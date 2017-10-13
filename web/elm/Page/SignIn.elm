module Page.SignIn exposing (Model, Msg, init, update, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Http exposing (Request)
import Data.Context as Context exposing (Context)
import Data.User as User exposing (User)
import Json.Encode as Encode
import Util exposing ((=>), viewMaybe)


type RemoteData a
    = NotRequested
    | Loading
    | Success a
    | Error String


type alias Model =
    { username : String
    , password : String
    , user : RemoteData User
    }


type Msg
    = UpdateUsername String
    | UpdatePassword String
    | AttemptSignIn
    | SetUser (Result Http.Error User)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateUsername username ->
            { model | username = username } ! []

        UpdatePassword password ->
            { model | password = password } ! []

        AttemptSignIn ->
            if model.user /= Loading then
                model ! [ attemptSignIn model.username model.password ]
            else
                model ! []

        SetUser userResult ->
            case userResult of
                Ok user ->
                    { model | user = Success user } ! []

                Err error ->
                    { model | user = Error (toString error) } ! []


attemptSignIn : String -> String -> Cmd Msg
attemptSignIn username password =
    if username /= "" && password /= "" then
        Http.send SetUser (signInRequest username password)
    else
        Cmd.none


signInRequest : String -> String -> Request User
signInRequest username password =
    Http.post "/api/sign-in" (signInBody username password) User.decoder


signInBody : String -> String -> Http.Body
signInBody username password =
    Http.jsonBody
        (Encode.object
            [ "username" => Encode.string username
            , "password" => Encode.string password
            ]
        )


view : Context -> Model -> Html Msg
view context model =
    div [ class "page page--dark page--full-height page--center-content" ]
        [ viewMaybe context.user
            (viewContinue model)
            (viewSignIn model)
        ]


viewContinue : Model -> User -> Html Msg
viewContinue model user =
    div [ class "card" ]
        [ text (User.fullname user) ]


viewSignIn : Model -> Html Msg
viewSignIn model =
    div [ class "card" ]
        [ viewSignInHeader
        , viewSignInForm model
        ]


viewSignInHeader : Html Msg
viewSignInHeader =
    h3 [ class "card__title" ]
        [ text "Jangle" ]


viewSignInForm : Model -> Html Msg
viewSignInForm { username, password } =
    div [ class "form card__content" ]
        [ label [ class "form__label" ]
            [ span [ class "form__label-text" ] [ text "Email Address" ]
            , input [ class "form__input", type_ "email", value username, onInput UpdateUsername ] []
            ]
        , label [ class "form__label" ]
            [ span [ class "form__label-text" ] [ text "Password" ]
            , input [ class "form__input", type_ "password", value password, onInput UpdatePassword ] []
            ]
        , div [ class "form__button-row form__button-row--right" ]
            [ button [ class "form__button", onClick AttemptSignIn ] [ text "Sign In" ]
            ]
        ]


init : Model
init =
    Model "" "" NotRequested
