module Page.EditUser exposing (Model, Msg, init, update, view)

import Data.Context as Context
import Data.Delta as Delta exposing (Delta)
import Data.EditableData as EditableData exposing (EditableData(..))
import Data.User
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onSubmit)
import Http
import Json.Decode as Json
import Route exposing (Route)
import Schema.User as GraphQLUser exposing (User)
import Util exposing ((=>))
import Views.Dashboard
import Views.Form as Form exposing (Form)


type alias UserFields a =
    { a
        | firstName : String
        , lastName : String
        , email : String
        , password : String
    }


type alias Fields =
    { firstName : String
    , lastName : String
    , email : String
    , password : String
    }


type alias Model =
    { user : EditableData User
    , firstName : String
    , lastName : String
    , email : String
    , password : String
    , focusedField : Maybe Field
    , showRemoveConfirmation : Bool
    }


type Field
    = FirstName
    | LastName
    | Email
    | Password


type Msg
    = DoNothing
    | HandleUserFetch (Result Http.Error GraphQLUser.UserResponse)
    | HandleUserUpdate (Result Http.Error GraphQLUser.UpdateUserResponse)
    | HandleUserRemoval (Result Http.Error GraphQLUser.RemoveUserResponse)
    | UpdateField Field String
    | SetFocus Field
    | RemoveFocus
    | UpdateUser
    | RemoveUser
    | OpenRemoveConfirmation
    | CloseRemoveConfirmation


formConfig : Form Field Msg
formConfig =
    Form.form UpdateField SetFocus


update : Data.User.User -> Msg -> Model -> ( ( Model, Cmd Msg ), Context.Msg )
update signedInUser msg model =
    case msg of
        DoNothing ->
            model
                => Cmd.none
                => Context.NoOp

        UpdateField field value ->
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

        HandleUserFetch (Ok response) ->
            { model
                | user = Success response.data.user
                , firstName = response.data.user.name.first
                , lastName = response.data.user.name.last
                , email = response.data.user.email
            }
                => Cmd.none
                => Context.NoOp

        HandleUserFetch (Err error) ->
            { model | user = Error (Util.parseError error) }
                => Cmd.none
                => Context.NoOp

        HandleUserUpdate (Ok response) ->
            { model
                | user = Success response.data.updateUser
                , firstName = response.data.updateUser.name.first
                , lastName = response.data.updateUser.name.last
                , email = response.data.updateUser.email
                , password = ""
            }
                => Cmd.none
                => Context.NoOp

        HandleUserUpdate (Err error) ->
            { model | user = Error (Util.parseError error) }
                => Cmd.none
                => Context.NoOp

        HandleUserRemoval (Ok response) ->
            model
                => Cmd.none
                => Context.NavigateTo Route.Users

        HandleUserRemoval (Err error) ->
            { model | user = Error (Util.parseError error) }
                => Cmd.none
                => Context.NoOp

        UpdateUser ->
            case model.user of
                Success user_ ->
                    { model | user = Updating user_ }
                        => updateUser signedInUser user_ model
                        => Context.NoOp

                _ ->
                    model
                        => Cmd.none
                        => Context.NoOp

        RemoveUser ->
            case model.user of
                Success user_ ->
                    { model | user = Removing user_ }
                        => removeUser signedInUser user_ model
                        => Context.NoOp

                _ ->
                    model
                        => Cmd.none
                        => Context.NoOp

        OpenRemoveConfirmation ->
            { model | showRemoveConfirmation = True }
                => Cmd.none
                => Context.NoOp

        CloseRemoveConfirmation ->
            { model | showRemoveConfirmation = False }
                => Cmd.none
                => Context.NoOp


updateUser : Data.User.User -> User -> Model -> Cmd Msg
updateUser signedInUser user model =
    let
        changes =
            getUpdatedFieldsFor user model
    in
        GraphQLUser.updateUser signedInUser user.slug changes HandleUserUpdate


removeUser : Data.User.User -> User -> Model -> Cmd Msg
removeUser signedInUser user model =
    GraphQLUser.removeUser signedInUser user.slug HandleUserRemoval


updateField : Field -> String -> Model -> Model
updateField field value model =
    case field of
        Email ->
            { model | email = value }

        FirstName ->
            { model | firstName = value }

        LastName ->
            { model | lastName = value }

        Password ->
            { model | password = value }


init : String -> Data.User.User -> ( Model, Cmd Msg )
init slug user =
    let
        ( user_, cmd ) =
            ( Fetching
            , GraphQLUser.fetchUser user slug HandleUserFetch
            )
    in
        ( Model user_ "" "" "" "" Nothing False, cmd )


view : Data.User.User -> Model -> Html Msg
view user model =
    div []
        [ viewHeader
        , viewUser model
        , viewRemoveConfirmationModal model
        ]


viewHeader : Html Msg
viewHeader =
    Views.Dashboard.header "Edit user." "People are nice."


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

        Removing user ->
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
viewForm user_ { email, firstName, lastName, password, focusedField, user } =
    Html.form
        [ class "form container--tiny"
        , attribute "novalidate" "novalidate"
        , onSubmit UpdateUser
        ]
        [ Form.input formConfig <| Form.InputConfig "First Name" "text" firstName user_.name.first FirstName focusedField Form.AutoFocus
        , Form.input formConfig <| Form.InputConfig "Last Name" "text" lastName user_.name.last LastName focusedField Form.NormalFocus
        , Form.input formConfig <| Form.InputConfig "Email" "email" email user_.email Email focusedField Form.NormalFocus
        , Form.input formConfig <| Form.InputConfig "New Password" "password" password "" Password focusedField Form.NormalFocus
        , div [ class "form__button-row form__button-row--right" ]
            [ Form.button <|
                Form.ButtonConfig
                    "Update"
                    Form.SubmitButtonType
                    (if EditableData.isUpdating user then
                        Form.ButtonLoading
                     else if
                        List.length
                            (getUpdatedFieldsFor user_ (Fields firstName lastName email password))
                            == 0
                     then
                        Form.ButtonDisabled
                     else
                        Form.ButtonNormal
                    )
                    Form.ButtonPrimary
            , Form.button <|
                Form.ButtonConfig
                    "Remove"
                    (Form.NormalButtonType OpenRemoveConfirmation)
                    Form.ButtonNormal
                    Form.ButtonDanger
            ]
        ]


onClickStopPropagation : Attribute Msg
onClickStopPropagation =
    Html.Events.onWithOptions "click" (Html.Events.Options True True) (Json.succeed DoNothing)


viewRemoveConfirmationModal : Model -> Html Msg
viewRemoveConfirmationModal { showRemoveConfirmation, user } =
    div [ class "modal", classList [ ( "modal--visible", showRemoveConfirmation ) ], onClick CloseRemoveConfirmation ]
        [ div [ class "modal__card", onClickStopPropagation ]
            [ h3 [ class "modal__title" ] [ text "Remove user?" ]
            , p [ class "modal__message" ] [ text <| "This will permanently remove " ++ getFirstName user ++ " from Jangle." ]
            , div [ class "modal__actions form__button-row form__button-row--right" ]
                [ Form.button <|
                    Form.ButtonConfig
                        ("Remove " ++ getFirstName user)
                        (Form.NormalButtonType RemoveUser)
                        (if EditableData.isRemoving user then
                            Form.ButtonLoading
                         else
                            Form.ButtonNormal
                        )
                        Form.ButtonDanger
                , Form.button <|
                    Form.ButtonConfig "Cancel" (Form.NormalButtonType CloseRemoveConfirmation) Form.ButtonNormal Form.ButtonDefault
                ]
            ]
        ]


getFirstName : EditableData User -> String
getFirstName user =
    case user of
        Success user ->
            user.name.first

        Updating user ->
            user.name.first

        Removing user ->
            user.name.first

        _ ->
            "this user"


getUpdatedFieldsFor : User -> UserFields model -> List (Delta String)
getUpdatedFieldsFor user { email, password, firstName, lastName } =
    getUpdatedFields
        [ ( "firstName", user.name.first, firstName )
        , ( "lastName", user.name.last, lastName )
        , ( "email", user.email, email )
        , ( "password", "", password )
        ]


getUpdatedFields : List ( String, String, String ) -> List (Delta String)
getUpdatedFields fields_ =
    fields_
        |> List.map (\( name, before, after ) -> Delta name before after)
        |> List.filter (\{ before, after } -> after /= "" && before /= after)
