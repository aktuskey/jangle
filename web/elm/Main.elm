module Main exposing (Model, Msg, update, view, subscriptions, init)

import Html exposing (..)
import Navigation exposing (Location)
import Route exposing (Route)
import Data.Context as Context exposing (Context)
import Data.User as User exposing (User)
import Page.Dashboard as Dashboard
import Page.SignIn as SignIn
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
    = Dashboard
    | SignIn SignIn.Model
    | NotFound


type Msg
    = SetRoute Location
    | DashboardMsg Dashboard.Msg
    | SignInMsg SignIn.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( SetRoute location, _ ) ->
            { model | page = pageFromLocation location } ! []

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
                            { model | page = SignIn updatedSubModel, context = Context (Just user) }
                                => (Navigation.newUrl (Route.routeToString Route.Dashboard))
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
        Dashboard ->
            viewDashboardPage context

        SignIn model ->
            Html.map SignInMsg (SignIn.view context model)

        NotFound ->
            div [] [ text "NotFound" ]


viewDashboardPage : Context -> Html Msg
viewDashboardPage { user } =
    case user of
        Just user ->
            Html.map DashboardMsg (Dashboard.view user)

        Nothing ->
            div [] [ text "Oops! This should have redirected you to the sign in page..." ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    let
        context =
            (Context flags.user)

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
            Dashboard

        Route.SignIn ->
            SignIn SignIn.init
