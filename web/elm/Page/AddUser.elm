module Page.AddUser exposing (Model, Msg(..), init, update, view)

import Data.Context as Context
import Data.RemoteData as RemoteData exposing (..)
import Data.User
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onSubmit)
import Http
import Route
import Schema.User as GraphQLUser
import Util exposing ((=>))
import Views.Dashboard
import Views.Form as Form exposing (Form)


type alias Model =
    { firstName : String
    , lastName : String
    , email : String
    , password : String
    , focusedField : Maybe Field
    , newUser : RemoteData GraphQLUser.User
    }


type Field
    = FirstName
    | LastName
    | Email
    | Password


type Msg
    = NoOp
    | Update Field String
    | SetFocus Field
    | RemoveFocus
    | AddUser
    | HandleNewUser (Result Http.Error GraphQLUser.CreateUserResponse)


formConfig : Form Field Msg
formConfig =
    Form.form Update SetFocus


init : Model
init =
    Model "" "" "" "" Nothing NotRequested


update : Data.User.User -> Msg -> Model -> ( ( Model, Cmd Msg ), Context.Msg )
update user msg model =
    case msg of
        NoOp ->
            model
                => Cmd.none
                => Context.NoOp

        Update field value ->
            updateField field value model
                => Cmd.none
                => Context.NoOp

        SetFocus field ->
            { model | focusedField = Just field }
                => Cmd.none
                => Context.NoOp

        RemoveFocus ->
            { model | focusedField = Nothing }
                => Cmd.none
                => Context.NoOp

        AddUser ->
            { model | newUser = Loading }
                => createUser user
                    (GraphQLUser.NewUser
                        model.firstName
                        model.lastName
                        model.email
                        "admin"
                        model.password
                    )
                => Context.NoOp

        HandleNewUser (Ok response) ->
            { model | newUser = Success response.data.createUser }
                => Cmd.none
                => Context.NavigateTo Route.Users

        HandleNewUser (Err error) ->
            { model | newUser = Error (Util.parseError error) }
                => Cmd.none
                => Context.NoOp


createUser : Data.User.User -> GraphQLUser.NewUser -> Cmd Msg
createUser user newUser =
    GraphQLUser.createUser user newUser HandleNewUser


updateField : Field -> String -> Model -> Model
updateField field value model =
    case field of
        FirstName ->
            { model | firstName = value }

        LastName ->
            { model | lastName = value }

        Email ->
            { model | email = value }

        Password ->
            { model | password = value }


view : Model -> Html Msg
view model =
    div []
        [ Views.Dashboard.header "Add a user." "Let's make some humans."
        , viewUserForm model
        ]


viewUserForm : Model -> Html Msg
viewUserForm model =
    section [ class "list" ]
        [ viewForm model
        ]


viewForm : Model -> Html Msg
viewForm { email, firstName, lastName, password, focusedField, newUser } =
    Html.form
        [ class "form container--tiny"
        , attribute "novalidate" "novalidate"
        , onSubmit AddUser
        ]
        [ Form.input formConfig <| Form.InputConfig "First Name" "text" firstName "" FirstName focusedField Form.AutoFocus
        , Form.input formConfig <| Form.InputConfig "Last Name" "text" lastName "" LastName focusedField Form.NormalFocus
        , Form.input formConfig <| Form.InputConfig "Email" "email" email "" Email focusedField Form.NormalFocus
        , Form.input formConfig <| Form.InputConfig "Password" "password" password "" Password focusedField Form.NormalFocus
        , div [ class "form__button-row form__button-row--right" ]
            [ Form.button <|
                Form.ButtonConfig
                    "Update"
                    Form.SubmitButtonType
                    (if newUser == Loading then
                        Form.ButtonLoading
                     else if List.any (\str -> str == "") [ firstName, lastName, email, password ] then
                        Form.ButtonDisabled
                     else
                        Form.ButtonNormal
                    )
                    Form.ButtonPrimary
            , p
                [ class "form__response"
                , classList
                    [ ( "form__response--visible", isError newUser )
                    , ( "form__response--error", isError newUser )
                    ]
                ]
                [ viewResponseMessage newUser ]
            ]
        ]


isError : RemoteData a -> Bool
isError data =
    case data of
        Error _ ->
            True

        _ ->
            False


viewResponseMessage : RemoteData GraphQLUser.User -> Html Msg
viewResponseMessage user =
    case user of
        Success user ->
            text ("Welcome back, " ++ user.name.first ++ ".")

        Error error ->
            text error

        _ ->
            text ""
