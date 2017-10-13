module Main exposing (Model, Msg, update, view, subscriptions, init)

import Html exposing (..)
import Navigation exposing (Location)
import Route exposing (Route)
import Data.Context as Context exposing (Context)
import Data.User as User exposing (User)
import Page.Dashboard as Dashboard
import Page.SignIn as SignIn


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
            { model | page = page model.context location } ! []

        ( SignInMsg subMsg, SignIn subModel ) ->
            let
                ( updatedSubModel, subCmd ) =
                    SignIn.update subMsg subModel
            in
                { model | page = SignIn updatedSubModel } ! [ Cmd.map SignInMsg subCmd ]

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
    in
        ( Model
            (context)
            (page context location)
        , Cmd.none
        )


initialRoute : { context | user : Maybe User } -> Location -> Maybe Route
initialRoute { user } location =
    case user of
        Just _ ->
            Route.fromLocation location

        Nothing ->
            Just Route.SignIn


page : Context -> Location -> Page
page context location =
    let
        maybeRoute =
            initialRoute context location
    in
        case maybeRoute of
            Just route ->
                case route of
                    Route.Dashboard ->
                        Dashboard

                    Route.SignIn ->
                        SignIn SignIn.init

            Nothing ->
                NotFound
