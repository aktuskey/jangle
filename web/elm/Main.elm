module Main exposing (Model, Msg, update, view, subscriptions, init)

import Html exposing (..)
import Html.Attributes exposing (class, href)
import Navigation exposing (Location)
import Route exposing (Route)
import Ports
import Json.Decode as Decode
import Data.Context as Context exposing (Context)
import Data.User as User exposing (User)
import Page.Dashboard as Dashboard
import Page.SignIn as SignIn
import Views.Nav as Nav
import Util exposing ((=>))


type alias Flags =
    { user : Maybe User
    }


main : Program Flags Model Msg
main =
    Navigation.programWithFlags
        (SetRoute)
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
    | NewUrl String
    | SetUser (Maybe User)
    | DashboardMsg Dashboard.Msg
    | SignInMsg SignIn.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( SetRoute location, _ ) ->
            { model
                | page = pageFromLocation location
                , context = Context.updateCurrentUrl location.pathname model.context
            }
                => Cmd.none

        ( NewUrl url, _ ) ->
            model
                => Navigation.newUrl url

        ( SetUser user, _ ) ->
            let
                context =
                    model.context

                newContext =
                    { context | user = user }
            in
                { model | context = newContext }
                    => case user of
                        Just user ->
                            User.storeContext user

                        Nothing ->
                            Cmd.batch
                                [ Ports.storeContext Nothing
                                , Navigation.newUrl (Route.routeToString Route.SignIn)
                                ]

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

        ( DashboardMsg subMsg, Dashboard subModel ) ->
            let
                ( updatedSubModel, externalMsg ) =
                    Dashboard.update subMsg subModel
            in
                case externalMsg of
                    Nav.SignOut ->
                        update (SetUser Nothing) model

                    Nav.NoOp ->
                        { model | page = Dashboard updatedSubModel }
                            => Cmd.none

                    Nav.NavigateTo url ->
                        update (NewUrl url) model

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
            (Context flags.user location.pathname)

        page =
            pageFromLocation location

        cmd =
            redirectCommand context.user page
    in
        ( Model context page
        , cmd
        )


pageFromLocation : Location -> Page
pageFromLocation location =
    case Route.fromLocation location of
        Just route ->
            pageFromRoute route

        Nothing ->
            NotFound


redirectCommand : Maybe User -> Page -> Cmd Msg
redirectCommand user page =
    if user == Nothing then
        Navigation.modifyUrl (Route.routeToString Route.SignIn)
    else
        Cmd.none


pageFromRoute : Route -> Page
pageFromRoute route =
    case route of
        Route.Dashboard ->
            Dashboard (Dashboard.init Dashboard.Dashboard)

        Route.SignIn ->
            SignIn SignIn.init

        Route.Users ->
            Dashboard (Dashboard.init Dashboard.Users)

        Route.AddUser ->
            Dashboard (Dashboard.init Dashboard.AddUser)
