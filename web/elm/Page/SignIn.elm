module Page.SignIn exposing (Model, Msg, init, update, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick, onFocus, onBlur, onSubmit)
import Http exposing (Request)
import Data.Context as Context exposing (Context)
import Data.User as User exposing (User)
import Data.Response as Response exposing (Response)
import Json.Encode as Encode
import Util exposing ((=>), viewMaybe)
import Debug


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
    | SetUser (Result Http.Error (Response User))


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
                { model | user = Loading } ! [ attemptSignIn model.email model.password ]
            else
                model ! []

        SetUser result ->
            case Response.singleHandler result of
                Ok user ->
                    { model | user = Success user } ! []

                Err error ->
                    { model | user = Error error } ! []


attemptSignIn : String -> String -> Cmd Msg
attemptSignIn email password =
    Http.send SetUser (signInRequest email password)


signInRequest : String -> String -> Request (Response User)
signInRequest email password =
    Response.post "/api/sign-in" (signInBody email password) User.decoder


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
viewSignInForm { email, password, focusedField, user } =
    Html.form [ class "form card__content", attribute "novalidate" "novalidate", onSubmit AttemptSignIn ]
        [ label [ class "form__label", classList [ ( "form__label--focused", isFocused Email focusedField ) ] ]
            [ span [ class "form__label-text", classList [ ( "form__label-text--displaced", hasValue [ email ] || isFocused Email focusedField ) ] ] [ text "Email Address" ]
            , input
                [ class "form__input"
                , type_ "email"
                , value email
                , onInput UpdateEmail
                , onFocus (SetFocus Email)
                , onBlur RemoveFocus
                , attribute "autofocus" "true"
                ]
                []
            ]
        , label [ class "form__label", classList [ ( "form__label--focused", isFocused Password focusedField ) ] ]
            [ span [ class "form__label-text", classList [ ( "form__label-text--displaced", hasValue [ password ] || isFocused Password focusedField ) ] ] [ text "Password" ]
            , input
                [ class "form__input"
                , type_ "password"
                , value password
                , onInput UpdatePassword
                , onFocus (SetFocus Password)
                , onBlur RemoveFocus
                ]
                []
            ]
        , input [ type_ password, style [ ( "display", "none" ) ] ] []
        , div [ class "form__button-row form__button-row--right" ]
            [ p
                [ class "form__response"
                , classList
                    [ ( "form__response--visible", user /= NotRequested )
                    , ( "form__response--error", isError user )
                    ]
                ]
                [ viewResponseMessage user ]
            , button
                [ class "button"
                , type_ "submit"
                , classList [ ( "button--loading", user == Loading ) ]
                , dataContent "Sign In"
                ]
                [ text "Sign In" ]
            ]
        ]


isError : RemoteData a -> Bool
isError data =
    case data of
        Error _ ->
            True

        _ ->
            False


viewResponseMessage : RemoteData User -> Html Msg
viewResponseMessage user =
    case user of
        Success user ->
            text ("Welcome back, " ++ user.name.first ++ ".")

        Error error ->
            text error

        _ ->
            text ""


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
