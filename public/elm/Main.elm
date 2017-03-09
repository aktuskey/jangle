module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Navigation exposing (Location)
import Json.Decode as Json exposing (field, null, oneOf, string)
import Task
import Routes exposing (Page)
import Types exposing (..)


emptyHtml : Html Msg
emptyHtml =
    text ""


type Msg
    = NoOp
    | AppStart
    | PageChange Page
    | UsernameUpdated String
    | PasswordUpdated String
    | SignInSubmit
    | SignInResponded (Result Http.Error User)
    | SignOutSubmit
    | SignOutResponded (Result Http.Error (Response User))


type alias Model =
    { context : Context
    , page : Page
    , username : String
    , password : String
    , errorMessage : Maybe String
    , handlingRequest : Bool
    }


getCmdForMsg : msg -> Cmd msg
getCmdForMsg msg =
    Task.perform identity (Task.succeed msg)


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    Model
        (Context flags.user location)
        (Routes.getPage location)
        ""
        ""
        Nothing
        False
        ! [ getCmdForMsg AppStart ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        AppStart ->
            appStart model

        PageChange newPage ->
            { model | page = newPage } ! [ Navigation.newUrl (Routes.getPath newPage) ]

        UsernameUpdated newUsername ->
            { model | username = newUsername } ! []

        PasswordUpdated newPassword ->
            { model | password = newPassword } ! []

        SignInSubmit ->
            if model.handlingRequest then
                model ! []
            else
                { model | handlingRequest = True }
                    ! [ attemptSignIn model.username model.password ]

        SignInResponded result ->
            case result of
                Ok user ->
                    let
                        context =
                            model.context

                        newContext =
                            { context | user = Just user }
                    in
                        { model
                            | handlingRequest = False
                            , context = newContext
                            , errorMessage = Nothing
                        }
                            ! [ getCmdForMsg <| PageChange Routes.Dashboard ]

                Err error ->
                    { model
                        | errorMessage = Just "Could not sign in."
                        , handlingRequest = False
                    }
                        ! []

        SignOutSubmit ->
            if model.handlingRequest then
                model ! []
            else
                { model | handlingRequest = True }
                    ! [ attemptSignOut ]

        SignOutResponded result ->
            case result of
                Ok response ->
                    let
                        context =
                            model.context

                        newContext =
                            { context | user = Nothing }
                    in
                        { model
                            | handlingRequest = False
                            , context = newContext
                            , errorMessage = Nothing
                        }
                            ! [ getCmdForMsg <| PageChange Routes.SignIn ]

                Err error ->
                    { model
                        | errorMessage = Just "Could not sign out."
                        , handlingRequest = False
                    }
                        ! [ getCmdForMsg <| PageChange Routes.SignIn ]

        NoOp ->
            model ! []


attemptSignIn : String -> String -> Cmd Msg
attemptSignIn username password =
    let
        url =
            "/sign-in?username=" ++ username ++ "&password=" ++ password

        request =
            Http.post url Http.emptyBody userDecoder
    in
        Http.send SignInResponded request


attemptSignOut : Cmd Msg
attemptSignOut =
    let
        url =
            "/sign-out"

        request =
            Http.post url Http.emptyBody (responseDecoder userDecoder)
    in
        Http.send SignOutResponded request


responseDecoder : Json.Decoder a -> Json.Decoder (Response a)
responseDecoder decoder =
    Json.map3 Response
        (field "error" Json.bool)
        (field "message" Json.string)
        (field "data" (Json.list decoder))


userDecoder : Json.Decoder User
userDecoder =
    Json.map2 User (field "name" nameDecoder) (field "username" string)


nameDecoder : Json.Decoder Name
nameDecoder =
    Json.map2 Name (field "first" string) (field "last" string)


appStart : Model -> ( Model, Cmd Msg )
appStart model =
    if model.page /= Routes.SignIn && model.context.user == Nothing then
        model ! [ getCmdForMsg (PageChange Routes.SignIn) ]
    else
        model ! []


view : Model -> Html Msg
view model =
    div [ class "app" ]
        [ viewNavbar model
        , viewPage model
        ]


viewNavbar : Model -> Html Msg
viewNavbar model =
    case model.page of
        Routes.SignIn ->
            emptyHtml

        _ ->
            nav [ class "nav has-shadow is-fixed" ]
                [ div [ class "container" ]
                    [ div [ class "nav-left" ]
                        [ div [ class "nav-item" ]
                            [ h3 [ class "subtitle is-3" ]
                                [ a
                                    [ href (Routes.getLink Routes.Dashboard) ]
                                    [ text "Jangle" ]
                                ]
                            ]
                        ]
                    , div [ class "nav-right" ]
                        [ div [ class "nav-item" ]
                            [ a
                                [ onClick (SignOutSubmit) ]
                                [ text "Sign out" ]
                            ]
                        ]
                    ]
                ]


viewPage : Model -> Html Msg
viewPage model =
    case model.page of
        Routes.SignIn ->
            viewSignInPage model

        Routes.Dashboard ->
            viewDashboardPage model

        Routes.Collections ->
            viewCollectionsPage model

        Routes.Users ->
            viewUsersPage model

        Routes.NotFound ->
            viewNotFoundPage model


viewSignInPage : Model -> Html Msg
viewSignInPage model =
    div [ class "sign-in-page" ]
        [ div [ class "hero is-dark is-bold is-fullheight" ]
            [ div [ class "hero-body" ]
                [ div [ class "container is-flex justify-center" ]
                    [ Html.form [ class "sign-in-form", onSubmit SignInSubmit ]
                        [ h1 [ class "title is-1 has-text-centered" ] [ text "Jangle" ]
                        , div [ class "box" ]
                            [ div [ class "fields" ]
                                [ bulmaField "Username" "text" UsernameUpdated model.username
                                , bulmaField "Password" "password" PasswordUpdated model.password
                                ]
                            , buttonBar
                                [ case model.errorMessage of
                                    Just message ->
                                        span [ class "help is-danger is-padded-right" ] [ text message ]

                                    Nothing ->
                                        emptyHtml
                                , button [ class (getSignInClasses model), onClick SignInSubmit ] [ text "Sign in" ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]


bulmaField : String -> String -> (String -> Msg) -> String -> Html Msg
bulmaField fieldLabel inputType msg value_ =
    div [ class "control" ]
        [ label [ class "label" ] [ text fieldLabel ]
        , p [ class "control" ]
            [ input
                [ class "input"
                , onInput msg
                , type_ inputType
                , value value_
                ]
                []
            ]
        ]


buttonBar : List (Html Msg) -> Html Msg
buttonBar children =
    div [ class "button-bar is-flex" ] children


getSignInClasses : Model -> String
getSignInClasses model =
    (if model.handlingRequest then
        "is-loading "
     else
        ""
    )
        ++ "button is-info"


viewDashboardPage : Model -> Html Msg
viewDashboardPage model =
    div [ class "dashboard-page" ]
        [ div [ class "hero is-fullheight is-info" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Dashboard" ]
                    , h2 [ class "subtitle is-3" ] [ text <| getGreeting model ]
                    , viewDashboardOptions model
                    ]
                ]
            ]
        ]


viewDashboardOptions : Model -> Html Msg
viewDashboardOptions model =
    div [ class "dashboard-options columns" ]
        [ viewDashboardOption "Content"
            "fa-database"
            (Routes.getLink Routes.Collections)
        , viewDashboardOption "Users"
            "fa-users"
            (Routes.getLink Routes.Users)
        ]


viewDashboardOption : String -> String -> String -> Html Msg
viewDashboardOption label_ iconClass url =
    div [ class "column is-half-tablet" ]
        [ a [ class "box section", href url ]
            [ i [ class <| "is-hidden-mobile title is-1 fa " ++ iconClass ] []
            , h3 [ class "title is-3" ] [ text label_ ]
            ]
        ]


getGreeting : Model -> String
getGreeting model =
    case model.context.user of
        Just user ->
            "Welcome home, " ++ user.name.first ++ "."

        Nothing ->
            "You sneaky, huh..."


viewNotFoundPage : Model -> Html Msg
viewNotFoundPage model =
    div [ class "not-found-page" ]
        [ div [ class "hero is-fullheight is-gray" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Page not found." ]
                    , h2 [ class "subtitle is-3" ]
                        [ text "Sorry about that!" ]
                    , button
                        [ class "button is-info is-medium"
                        , onClick (PageChange Routes.Dashboard)
                        ]
                        [ text "Go to dashboard" ]
                    ]
                ]
            ]
        ]


viewCollectionsPage : Model -> Html Msg
viewCollectionsPage model =
    div [ class "collections-page" ]
        [ div [ class "hero is-fullheight is-primary" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Collections." ]
                    , h2 [ class "subtitle is-3" ]
                        [ text "Coming soon!" ]
                    , button
                        [ class "button is-primary is-medium is-inverted"
                        , onClick (PageChange Routes.Dashboard)
                        ]
                        [ text "Go to dashboard" ]
                    ]
                ]
            ]
        ]


viewUsersPage : Model -> Html Msg
viewUsersPage model =
    div [ class "users-page" ]
        [ div [ class "hero is-fullheight is-dark" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Users." ]
                    , h2 [ class "subtitle is-3" ]
                        [ text "Coming soon!" ]
                    , button
                        [ class "button is-info is-medium"
                        , onClick (PageChange Routes.Dashboard)
                        ]
                        [ text "Go to dashboard" ]
                    ]
                ]
            ]
        ]


main : Program Flags Model Msg
main =
    Navigation.programWithFlags
        (\_ -> NoOp)
        { init = init
        , subscriptions = (\_ -> Sub.none)
        , update = update
        , view = view
        }
