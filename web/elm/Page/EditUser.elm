module Page.EditUser exposing (Model, Msg, init, update, view)

import Data.EditableData as EditableData exposing (EditableData(..))
import Data.User
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onSubmit)
import Http
import Schema.User as GraphQLUser exposing (User)
import Util exposing ((=>))
import Views.Dashboard
import Views.Form as Form exposing (Form)


type PageType
    = AddPage
    | EditPage


type alias UserFields a =
    { a
        | firstName : String
        , lastName : String
        , email : String
    }


type alias Model =
    { user : EditableData User
    , pageType : PageType
    , firstName : String
    , lastName : String
    , email : String
    , focusedField : Maybe Field
    }


type Field
    = FirstName
    | LastName
    | Email


type Msg
    = NoOp
    | HandleUserResponse (Result Http.Error GraphQLUser.UserResponse)
    | UpdateField Field String
    | SetFocus Field
    | RemoveFocus
    | UpdateUser


formConfig : Form Field Msg
formConfig =
    Form.form UpdateField SetFocus


update : Data.User.User -> Msg -> Model -> ( Model, Cmd Msg )
update user msg model =
    case msg of
        NoOp ->
            model => Cmd.none

        UpdateField field value ->
            updateField field value model
                => Cmd.none

        SetFocus field ->
            { model | focusedField = Just field }
                => Cmd.none

        RemoveFocus ->
            { model | focusedField = Nothing }
                => Cmd.none

        HandleUserResponse (Ok response) ->
            { model | user = Success response.data.user }
                => Cmd.none

        HandleUserResponse (Err error) ->
            { model | user = Error (Util.parseError error) }
                => Cmd.none

        UpdateUser ->
            case model.user of
                Success user_ ->
                    { model | user = Updating user_ }
                        => updateUser user_ model

                _ ->
                    model => Cmd.none


updateUser : User -> Model -> Cmd Msg
updateUser user_ { email, firstName, lastName } =
    let
        changes =
            getUpdatedFields
                [ ( "firstName", user_.name.first, firstName )
                , ( "lastName", user_.name.last, lastName )
                , ( "email", user_.email, email )
                ]
                |> toString
                |> Debug.log "Changes"
    in
    Cmd.none


updateField : Field -> String -> Model -> Model
updateField field value model =
    case field of
        Email ->
            { model | email = value }

        FirstName ->
            { model | firstName = value }

        LastName ->
            { model | lastName = value }


init : Maybe String -> Data.User.User -> ( Model, Cmd Msg )
init slug user =
    let
        ( pageType, user_, cmd ) =
            case slug of
                Just slug ->
                    ( EditPage
                    , Fetching
                    , GraphQLUser.fetchUser user slug HandleUserResponse
                    )

                Nothing ->
                    ( AddPage
                    , NotRequested
                    , Cmd.none
                    )
    in
    ( Model user_ pageType "" "" "" Nothing, cmd )


view : Data.User.User -> Model -> Html Msg
view user model =
    div []
        [ viewHeader model
        , viewUser model
        ]


viewHeader : Model -> Html Msg
viewHeader { pageType } =
    let
        title =
            case pageType of
                AddPage ->
                    "Add a user"

                EditPage ->
                    "Edit user"
    in
    Views.Dashboard.header title "People are nice."


viewUser : Model -> Html Msg
viewUser model =
    case model.user of
        NotRequested ->
            text ""

        Fetching ->
            text ""

        Updating user ->
            viewUserForm user model

        Success user ->
            viewUserForm user model

        Error message ->
            text message


viewUserForm : User -> Model -> Html Msg
viewUserForm user model =
    section [ class "list" ]
        [ h3 [ class "list__title" ] [ text <| Data.User.fullname user ]
        , viewForm user model
        ]


viewForm : User -> Model -> Html Msg
viewForm user_ { email, firstName, lastName, focusedField, user } =
    Html.form
        [ class "form container--tiny"
        , attribute "novalidate" "novalidate"
        , onSubmit UpdateUser
        ]
        [ Form.input formConfig <| Form.InputConfig "First Name" "text" firstName user_.name.first FirstName focusedField Form.NormalFocus
        , Form.input formConfig <| Form.InputConfig "Last Name" "text" lastName user_.name.last LastName focusedField Form.NormalFocus
        , Form.input formConfig <| Form.InputConfig "Email" "email" email user_.email Email focusedField Form.NormalFocus
        , div [ class "form__button-row form__button-row--right" ]
            [ Form.button <|
                Form.ButtonConfig
                    "Update"
                    Form.SubmitButtonType
                    (if EditableData.isUpdating user then
                        Form.ButtonLoading
                     else if
                        List.length
                            (getUpdatedFields
                                [ ( "firstName", user_.name.first, firstName )
                                , ( "lastName", user_.name.last, lastName )
                                , ( "email", user_.email, email )
                                ]
                            )
                            == 0
                     then
                        Form.ButtonDisabled
                     else
                        Form.ButtonNormal
                    )
            ]
        ]


type alias Delta dataType =
    { fieldName : String
    , before : dataType
    , after : dataType
    }


getUpdatedFields : List ( String, String, String ) -> List (Delta String)
getUpdatedFields fields_ =
    fields_
        |> List.map (\( name, before, after ) -> Delta name before after)
        |> List.filter (\{ before, after } -> after /= "" && before /= after)
