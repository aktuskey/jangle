module Page.Users exposing (Model, Msg, init, update, view)

import Data.Context as Context
import Data.RemoteData as RemoteData exposing (RemoteData(..))
import Data.User as User exposing (User)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Http
import Route exposing (Route)
import Schema.User as GraphQLUser
import Util exposing ((=>))
import Views.Dashboard


type DeletableData a
    = NothingToDelete
    | Deleting a
    | ErrorDeleting String


type alias Model =
    { users : RemoteData (List GraphQLUser.User)
    , selectedUsers : List GraphQLUser.User
    , usersBeingRemoved : DeletableData (List GraphQLUser.User)
    }


type Msg
    = FetchUsers
    | Navigate Route
    | HandleUsersResponse (Result Http.Error GraphQLUser.UsersResponse)
    | ToggleAll
    | ToggleRow GraphQLUser.User
    | RemoveSelectedUsers
    | HandleRemoveUsers (Result Http.Error GraphQLUser.RemoveUsersResponse)


update : User -> Msg -> Model -> ( ( Model, Cmd Msg ), Context.Msg )
update user msg model =
    case msg of
        FetchUsers ->
            model
                => fetchUsersAs user
                => Context.NoOp

        Navigate route ->
            model
                => Cmd.none
                => Context.NavigateTo route

        HandleUsersResponse (Ok response) ->
            { model | users = RemoteData.Success response.data.users }
                => Cmd.none
                => Context.NoOp

        HandleUsersResponse (Err error) ->
            { model | users = Error (Util.parseError error) }
                => Cmd.none
                => Context.NoOp

        ToggleAll ->
            case model.users of
                Success users ->
                    { model | selectedUsers = toggleAll users model.selectedUsers }
                        => Cmd.none
                        => Context.NoOp

                _ ->
                    model
                        => Cmd.none
                        => Context.NoOp

        ToggleRow user ->
            { model | selectedUsers = toggleRow user model.selectedUsers }
                => Cmd.none
                => Context.NoOp

        RemoveSelectedUsers ->
            { model | usersBeingRemoved = Deleting model.selectedUsers }
                => removeUsers user model.selectedUsers
                => Context.NoOp

        HandleRemoveUsers (Ok response) ->
            { model
                | selectedUsers = []
                , users = filterRemovedUsers response.data.removedUsers model.users
                , usersBeingRemoved = NothingToDelete
            }
                => Cmd.none
                => Context.NoOp

        HandleRemoveUsers (Err error) ->
            { model | usersBeingRemoved = ErrorDeleting (Util.parseError error) }
                => Cmd.none
                => Context.NoOp


removeUsers : User -> List GraphQLUser.User -> Cmd Msg
removeUsers user usersToRemove =
    GraphQLUser.removeUsers user (List.map (.slug) usersToRemove) HandleRemoveUsers


filterRemovedUsers : List GraphQLUser.User -> RemoteData (List GraphQLUser.User) -> RemoteData (List GraphQLUser.User)
filterRemovedUsers removedUsers users =
    case users of
        Success users_ ->
            Success (List.filter (\u -> (List.member u removedUsers) == False) users_)

        _ ->
            users


toggleAll : List GraphQLUser.User -> List GraphQLUser.User -> List GraphQLUser.User
toggleAll users selectedUsers =
    if List.length selectedUsers == 0 then
        users
    else
        []


toggleRow : GraphQLUser.User -> List GraphQLUser.User -> List GraphQLUser.User
toggleRow user selectedUsers =
    if List.member user selectedUsers then
        List.filter (\u -> u /= user) selectedUsers
    else
        user :: selectedUsers


view : User -> Model -> Html Msg
view user model =
    div []
        [ Views.Dashboard.header "Manage users." "And let that power go straight to your head."
        , case model.users of
            NotRequested ->
                text ""

            Loading ->
                -- TODO: Loading spinner
                text ""

            Success users ->
                viewUsers model.selectedUsers users

            Error reason ->
                text reason
        ]


type Field
    = Name
    | Email


columns : List ( String, Int, Field )
columns =
    [ ( "Name", 1, Name )

    --, ( "Email", 2, Email )
    ]


viewUsers : List GraphQLUser.User -> List GraphQLUser.User -> Html Msg
viewUsers selectedUsers users =
    div []
        [ viewTableActions selectedUsers
        , table
            [ class "list__table" ]
            ([ viewHeaderRow selectedUsers users columns ] ++ List.map (viewRow selectedUsers columns) users)
        ]


viewTableActions : List GraphQLUser.User -> Html Msg
viewTableActions selectedUsers =
    div [ class "list__actions form__button-row form__button-row--right" ]
        ([ button
            [ class "button button--success"
            , onClick (Navigate Route.AddUser)
            , attribute "data-content" "Add user"
            ]
            [ text "Add user" ]
         ]
            ++ (viewSelectedUserActions selectedUsers)
        )


viewSelectedUserActions : List GraphQLUser.User -> List (Html Msg)
viewSelectedUserActions selectedUsers =
    if List.length selectedUsers > 0 then
        [ button
            [ class "button button--danger"
            , onClick (RemoveSelectedUsers)
            ]
            [ text
                (if List.length selectedUsers == 1 then
                    "Remove user"
                 else
                    "Removes users"
                )
            ]
        ]
    else
        []


viewHeaderRow : List GraphQLUser.User -> List GraphQLUser.User -> List ( String, Int, Field ) -> Html Msg
viewHeaderRow selectedUsers users list =
    tr [ class "list__row list__row--header" ]
        ([ viewHeaderCheckboxCell selectedUsers users ]
            ++ (List.map viewHeaderCell list)
        )


viewHeaderCell : ( String, Int, Field ) -> Html Msg
viewHeaderCell ( label, size, _ ) =
    th
        [ class "list__cell list__cell--header"
        , style [ ( "flex", toString size ) ]
        ]
        [ span [ class "" ] [ text label ]
        ]


viewHeaderCheckboxCell : List GraphQLUser.User -> List GraphQLUser.User -> Html Msg
viewHeaderCheckboxCell selectedUsers users =
    th [ class "list__cell list__cell--checkbox" ]
        [ button [ class "list__checkbox", onClick ToggleAll ]
            [ if List.length selectedUsers == 0 then
                i [ class "material-icons" ] [ text "check_box_outline_blank" ]
              else if List.length selectedUsers == List.length users then
                i [ class "material-icons" ] [ text "check_box" ]
              else
                i [ class "material-icons" ] [ text "indeterminate_check_box" ]
            ]
        ]


viewRow : List GraphQLUser.User -> List ( String, Int, Field ) -> GraphQLUser.User -> Html Msg
viewRow selectedUsers list user =
    tr
        [ class "list__row"
        ]
        ([ viewCheckboxCell selectedUsers user ]
            ++ (List.map (viewCell user) list)
        )


viewCheckboxCell : List GraphQLUser.User -> GraphQLUser.User -> Html Msg
viewCheckboxCell selectedUsers user =
    td [ class "list__cell list__cell--checkbox" ]
        [ button [ class "list__checkbox", onClick (ToggleRow user) ]
            [ if List.member user selectedUsers then
                i [ class "material-icons" ] [ text "check_box" ]
              else
                i [ class "material-icons" ] [ text "check_box_outline_blank" ]
            ]
        ]


viewCell : GraphQLUser.User -> ( String, Int, Field ) -> Html Msg
viewCell user ( _, size, field ) =
    td
        [ class "list__cell"
        , style [ ( "flex", toString size ) ]
        ]
        [ button [ class "link", onClick (Navigate (Route.EditUser user.slug)) ]
            [ text (getFieldText user field) ]
        ]


getFieldText : GraphQLUser.User -> Field -> String
getFieldText user field =
    case field of
        Name ->
            user.name.first ++ " " ++ user.name.last

        Email ->
            user.email


viewUser : GraphQLUser.User -> Html Msg
viewUser user =
    li [ class "list_row" ]
        [ button [ class "link", onClick (Navigate (Route.EditUser user.slug)) ]
            [ text <| User.fullname user ]
        ]


fetchUsersAs : User -> Cmd Msg
fetchUsersAs user =
    GraphQLUser.fetchUsers user HandleUsersResponse


init : User -> ( Model, Cmd Msg )
init user =
    Model RemoteData.NotRequested [] NothingToDelete
        => fetchUsersAs user
