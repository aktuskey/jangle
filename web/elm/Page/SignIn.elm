module Page.SignIn exposing (Model, Msg, init, update, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick, onFocus, onBlur)
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


type Field
    = Email
    | Password


type alias Model =
    { email : String
    , password : String
    , focusedField : Maybe Field
    , user : RemoteData User
    }


type Msg
    = UpdateEmail String
    | UpdatePassword String
    | SetFocus Field
    | RemoveFocus
    | AttemptSignIn
    | SetUser (Result Http.Error User)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateEmail email ->
            { model | email = email } ! []

        UpdatePassword password ->
            { model | password = password } ! []

        SetFocus field ->
            { model | focusedField = Just field } ! []

        RemoveFocus ->
            { model | focusedField = Nothing } ! []

        AttemptSignIn ->
            if model.user /= Loading then
                model ! [ attemptSignIn model.email model.password ]
            else
                model ! []

        SetUser userResult ->
            case userResult of
                Ok user ->
                    { model | user = Success user } ! []

                Err error ->
                    { model | user = Error (toString error) } ! []


attemptSignIn : String -> String -> Cmd Msg
attemptSignIn email password =
    if email /= "" && password /= "" then
        Http.send SetUser (signInRequest email password)
    else
        Cmd.none


signInRequest : String -> String -> Request User
signInRequest email password =
    Http.post "/api/sign-in" (signInBody email password) User.decoder


signInBody : String -> String -> Http.Body
signInBody email password =
    Http.jsonBody
        (Encode.object
            [ "email" => Encode.string email
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
    div [ class "card container container--tiny" ]
        [ viewSignInHeader
        , viewSignInForm model
        ]


viewSignInHeader : Html Msg
viewSignInHeader =
    h3 [ class "card__title" ]
        [ text "Jangle" ]


viewSignInForm : Model -> Html Msg
viewSignInForm { email, password, focusedField } =
    div [ class "form card__content" ]
        [ label [ class "form__label", classList [ ( "form__label--focused", isFocused Email focusedField ) ] ]
            [ span [ class "form__label-text", classList [ ( "form__label-text--displaced", hasValue [ email ] || isFocused Email focusedField ) ] ] [ text "Email Address" ]
            , input [ class "form__input", type_ "email", value email, onInput UpdateEmail, onFocus (SetFocus Email), onBlur RemoveFocus ] []
            ]
        , label [ class "form__label", classList [ ( "form__label--focused", isFocused Password focusedField ) ] ]
            [ span [ class "form__label-text", classList [ ( "form__label-text--displaced", hasValue [ password ] || isFocused Password focusedField ) ] ] [ text "Password" ]
            , input [ class "form__input", type_ "password", value password, onInput UpdatePassword, onFocus (SetFocus Password), onBlur RemoveFocus ] []
            ]
        , div [ class "form__button-row form__button-row--right" ]
            [ button [ class "button", dataContent "Sign In", onClick AttemptSignIn ] [ text "Sign In" ]
            ]
        ]


isFocused : Field -> Maybe Field -> Bool
isFocused field maybeField =
    maybeField == Just field


hasValue : List String -> Bool
hasValue =
    List.any (\str -> String.length str > 0)


dataContent : String -> Html.Attribute msg
dataContent =
    attribute "data-content"


init : Model
init =
    Model "" "" Nothing NotRequested
