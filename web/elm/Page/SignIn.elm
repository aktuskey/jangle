module Page.SignIn exposing (ExternalMsg(..), Model, Msg(..), init, update, view)

import Data.Context as Context exposing (Context)
import Data.Response as Response exposing (Response)
import Data.User as User exposing (User)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onBlur, onClick, onFocus, onInput, onSubmit)
import Http exposing (Request)
import Json.Encode as Encode
import Util exposing ((=>), delay, getCmd, viewMaybe)
import Views.Form as Form exposing (Form)


type RemoteData a
    = NotRequested
    | Loading
    | Success a
    | Error String


type Field
    = Email
    | Password
    | FirstName
    | LastName


type FormPage
    = NamePage
    | LoginPage


formConfig : Form Field Msg
formConfig =
    Form.form Update SetFocus


type alias Model =
    { email : String
    , password : String
    , firstName : String
    , lastName : String
    , focusedField : Maybe Field
    , user : RemoteData User
    , signingUp : Bool
    , page : FormPage
    }


type Msg
    = Update Field String
    | SetFocus Field
    | RemoveFocus
    | AttemptSignUp
    | AttemptSignIn
    | SetUser (Result Http.Error (Response User))
    | NextPage
    | PrevPage


type ExternalMsg
    = NoOp
    | LoginUser User


update : Msg -> Model -> ( ( Model, Cmd Msg ), ExternalMsg )
update msg model =
    case msg of
        Update field value ->
            (case field of
                Email ->
                    { model | email = value }

                Password ->
                    { model | password = value }

                FirstName ->
                    { model | firstName = value }

                LastName ->
                    { model | lastName = value }
            )
                => Cmd.none
                => NoOp

        SetFocus field ->
            { model | focusedField = Just field }
                => Cmd.none
                => NoOp

        RemoveFocus ->
            { model | focusedField = Nothing }
                => Cmd.none
                => NoOp

        AttemptSignUp ->
            if model.user /= Loading then
                { model | user = Loading }
                    => attemptSignUp model
                    => NoOp
            else
                model
                    => Cmd.none
                    => NoOp

        AttemptSignIn ->
            if model.user /= Loading then
                { model | user = Loading }
                    => attemptSignIn model
                    => NoOp
            else
                model
                    => Cmd.none
                    => NoOp

        SetUser result ->
            case Response.singleHandler result of
                Ok user ->
                    model
                        => Cmd.none
                        => LoginUser user

                Err error ->
                    { model | user = Error error }
                        => Cmd.none
                        => NoOp

        NextPage ->
            if model.firstName /= "" && model.lastName /= "" then
                { model | page = LoginPage, user = NotRequested } => Cmd.none => NoOp
            else
                { model | user = Error "Please provide your name." } => Cmd.none => NoOp

        PrevPage ->
            { model | page = NamePage } => Cmd.none => NoOp


attemptSignIn : Model -> Cmd Msg
attemptSignIn model =
    Http.send SetUser (Response.post "/api/sign-in" (signInBody model) User.decoder)


attemptSignUp : Model -> Cmd Msg
attemptSignUp model =
    Http.send SetUser (Response.post "/api/sign-in" (signUpBody model) User.decoder)


signInBody : Model -> Http.Body
signInBody { email, password } =
    Http.jsonBody
        (Encode.object
            [ "email" => Encode.string email
            , "password" => Encode.string password
            ]
        )


signUpBody : Model -> Http.Body
signUpBody { email, password, firstName, lastName } =
    Http.jsonBody
        (Encode.object
            [ "email" => Encode.string email
            , "password" => Encode.string password
            , "name"
                => Encode.object
                    [ "first" => Encode.string firstName
                    , "last" => Encode.string lastName
                    ]
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
    h3 [ class "card__title card__title--centered" ]
        [ text "Jangle" ]


viewSignInForm : Model -> Html Msg
viewSignInForm { email, password, firstName, lastName, focusedField, user, signingUp, page } =
    let
        ( buttonLabel, buttonMsg ) =
            case ( signingUp, page ) of
                ( True, NamePage ) ->
                    ( "Continue", NextPage )

                ( True, LoginPage ) ->
                    ( "Sign Up", AttemptSignUp )

                ( False, _ ) ->
                    ( "Sign In", AttemptSignIn )

        nameFields =
            [ Form.input formConfig (Form.InputConfig "First Name" "text" firstName "" FirstName focusedField Form.AutoFocus)
            , Form.input formConfig (Form.InputConfig "Last Name" "text" lastName "" LastName focusedField Form.NormalFocus)
            ]

        loginFields =
            [ Form.input formConfig (Form.InputConfig "Email" "email" email "" Email focusedField Form.AutoFocus)
            , Form.input formConfig (Form.InputConfig "Password" "password" password "" Password focusedField Form.NormalFocus)
            ]

        fieldsToDisplay =
            if signingUp && page == NamePage then
                nameFields
            else
                loginFields
    in
        Html.form [ class "form card__content", attribute "novalidate" "novalidate", onSubmit buttonMsg ]
            (fieldsToDisplay
                ++ [ div [ class "form__button-row form__button-row--right" ]
                        [ button
                            [ class "button form__button"
                            , type_ "submit"
                            , classList [ ( "button--loading", user == Loading ) ]
                            , dataContent buttonLabel
                            , onFocus RemoveFocus
                            ]
                            [ text buttonLabel ]
                        , button
                            [ class "button form__button"
                            , type_ "button"
                            , dataContent "Back"
                            , onFocus RemoveFocus
                            , onClick PrevPage
                            , classList [ ( "button--invisible", signingUp == False || page == NamePage ) ]
                            ]
                            [ text "Back" ]
                        , p
                            [ class "form__response"
                            , classList
                                [ ( "form__response--visible", user /= NotRequested )
                                , ( "form__response--error", isError user )
                                ]
                            ]
                            [ viewResponseMessage user ]
                        ]
                   ]
            )


makeFakeInput : Html Msg
makeFakeInput =
    input [ type_ "password", style [ ( "display", "none" ) ] ] []


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


dataContent : String -> Html.Attribute msg
dataContent =
    attribute "data-content"


init : Bool -> Model
init signingUp =
    Model ""
        ""
        ""
        ""
        Nothing
        NotRequested
        signingUp
        (if signingUp then
            NamePage
         else
            LoginPage
        )
