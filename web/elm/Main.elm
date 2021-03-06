module Main exposing (Model, Msg, init, subscriptions, update, view)

import Data.Context as Context exposing (Context)
import Data.User as User exposing (User)
import Html exposing (..)
import Html.Attributes exposing (class, href)
import Json.Decode as Decode
import Navigation exposing (Location)
import Page.Dashboard as Dashboard
import Page.AddUser as AddUser
import Page.EditUser as EditUser
import Page.SignIn as SignIn
import Page.Users as Users
import Ports
import Route exposing (Route)
import Util exposing ((=>))


type alias Flags =
    { needsSetup : Bool
    , user : Maybe User
    }


main : Program Flags Model Msg
main =
    Navigation.programWithFlags
        SetRoute
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { context : Context
    , page : Page
    }


type Page
    = Dashboard Dashboard.Model
    | SignIn SignIn.Model
    | NotFound


type Msg
    = SetRoute Location
    | NewUrl Route
    | SetUser (Maybe User)
    | DashboardMsg Dashboard.Msg
    | SignInMsg SignIn.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( model.context.user, msg, model.page ) of
        ( Just user, DashboardMsg pageMsg, Dashboard pageModel ) ->
            updateAsUser user model.context pageMsg pageModel model

        _ ->
            updateAnonymously msg model


updateAsUser : User -> Context -> Dashboard.Msg -> Dashboard.Model -> Model -> ( Model, Cmd Msg )
updateAsUser user context subMsg subModel model =
    let
        ( ( updatedSubModel, subCmd ), externalMsg ) =
            Dashboard.update user subMsg subModel
    in
        case externalMsg of
            Context.NoOp ->
                { model | page = Dashboard updatedSubModel }
                    => Cmd.map DashboardMsg subCmd

            Context.SignOut ->
                update (SetUser Nothing) model

            Context.NavigateTo route ->
                update (NewUrl route) model


updateAnonymously : Msg -> Model -> ( Model, Cmd Msg )
updateAnonymously msg model =
    case ( msg, model.page ) of
        ( SetRoute location, _ ) ->
            let
                ( page, cmd ) =
                    pageFromLocation model.context location
            in
                { model
                    | page = page
                    , context = Context.updateCurrentUrl location.pathname model.context
                }
                    => cmd

        ( NewUrl route, _ ) ->
            model
                => Navigation.newUrl (Route.routeToString route)

        ( SetUser user, _ ) ->
            let
                context =
                    model.context

                newContext =
                    { context | user = user }
            in
                { model | context = newContext }
                    => (case user of
                            Just user ->
                                User.storeContext user

                            Nothing ->
                                Cmd.batch
                                    [ Ports.storeContext Nothing
                                    , Navigation.newUrl (Route.routeToString Route.SignIn)
                                    ]
                       )

        ( SignInMsg subMsg, SignIn subModel ) ->
            let
                ( ( updatedSubModel, subCmd ), externalMsg ) =
                    SignIn.update subMsg subModel

                ( newModel, newCmd ) =
                    case externalMsg of
                        SignIn.NoOp ->
                            { model | page = SignIn updatedSubModel }
                                => Cmd.none

                        SignIn.LoginUser user ->
                            let
                                ( userModel, userCmd ) =
                                    update (SetUser (Just user)) model
                            in
                                userModel
                                    => Cmd.batch [ userCmd, Navigation.newUrl (Route.routeToString Route.Dashboard) ]
            in
                newModel ! (newCmd :: [ Cmd.map SignInMsg subCmd ])

        ( _, _ ) ->
            model ! []


view : Model -> Html Msg
view model =
    viewPage model


viewPage : Model -> Html Msg
viewPage { context, page } =
    case page of
        Dashboard model ->
            viewDashboardPage context model

        SignIn model ->
            Html.map SignInMsg (SignIn.view context model)

        NotFound ->
            viewNotFoundPage


viewDashboardPage : Context -> Dashboard.Model -> Html Msg
viewDashboardPage { user, currentUrl } model =
    case user of
        Just user ->
            Html.map DashboardMsg (Dashboard.view currentUrl user model)

        Nothing ->
            viewProtectedPageWarning


viewProtectedPageWarning : Html Msg
viewProtectedPageWarning =
    div [ class "page page--error" ]
        [ h1 [ class "page__message" ] [ text "Oops! You need to sign in first." ]
        , a [ class "page__link", href (Route.routeToString Route.SignIn) ] [ text "Sign in here." ]
        ]


viewNotFoundPage : Html Msg
viewNotFoundPage =
    div [ class "page page--error" ]
        [ h1 [ class "page__message" ] [ text "Oops! Couldn't find that page..." ]
        , a [ class "page__link", href (Route.routeToString Route.Dashboard) ] [ text "Try this one?" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map SetUser contextChange
        ]


contextChange : Sub (Maybe User)
contextChange =
    Ports.onContextChange (Decode.decodeValue User.decoder >> Result.toMaybe)


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    let
        context =
            Context flags.user location.pathname

        ( page, pageCmd ) =
            pageFromLocation context location

        cmd =
            redirectCommand flags.needsSetup context.user page
    in
        ( Model context page
        , Cmd.batch [ cmd, pageCmd ]
        )


pageFromLocation : Context -> Location -> ( Page, Cmd Msg )
pageFromLocation { user } location =
    case Route.fromLocation location of
        Just route ->
            pageFromRoute user route

        Nothing ->
            NotFound => Cmd.none


redirectCommand : Bool -> Maybe User -> Page -> Cmd Msg
redirectCommand needsSetup user page =
    if needsSetup then
        Navigation.modifyUrl (Route.routeToString Route.Welcome)
    else if user == Nothing then
        Navigation.modifyUrl (Route.routeToString Route.SignIn)
    else
        Cmd.none


signInPageAndCmd : ( Page, Cmd Msg )
signInPageAndCmd =
    SignIn (SignIn.init False)
        => Cmd.none


pageFromRoute : Maybe User -> Route -> ( Page, Cmd Msg )
pageFromRoute maybeUser route =
    case ( route, maybeUser ) of
        ( Route.Welcome, _ ) ->
            SignIn (SignIn.init True)
                => Cmd.none

        ( Route.SignIn, _ ) ->
            signInPageAndCmd

        ( Route.Dashboard, Just user ) ->
            Dashboard (Dashboard.init Dashboard.Dashboard)
                => Cmd.none

        ( Route.Dashboard, Nothing ) ->
            signInPageAndCmd

        ( Route.Users, Just user ) ->
            let
                ( page, cmd ) =
                    Users.init user
            in
                (Dashboard.Users page
                    |> Dashboard.init
                    |> Dashboard
                )
                    => Cmd.map DashboardMsg (Cmd.map Dashboard.UsersMsg cmd)

        ( Route.Users, Nothing ) ->
            signInPageAndCmd

        ( Route.AddUser, Just user ) ->
            let
                page =
                    AddUser.init
            in
                (Dashboard.AddUser page
                    |> Dashboard.init
                    |> Dashboard
                )
                    => Cmd.none

        ( Route.AddUser, Nothing ) ->
            signInPageAndCmd

        ( Route.EditUser slug, Just user ) ->
            let
                ( page, cmd ) =
                    EditUser.init slug user
            in
                (Dashboard.EditUser page
                    |> Dashboard.init
                    |> Dashboard
                )
                    => Cmd.map DashboardMsg (Cmd.map Dashboard.EditUserMsg cmd)

        ( Route.EditUser _, Nothing ) ->
            signInPageAndCmd
