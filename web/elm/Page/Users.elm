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


type alias Model =
    { users : RemoteData (List GraphQLUser.User)
    }


type Msg
    = FetchUsers
    | Navigate Route
    | HandleUsersResponse (Result Http.Error GraphQLUser.UsersResponse)


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


view : User -> Model -> Html Msg
view user model =
    div []
        [ Views.Dashboard.header "Manage users." "And let that power go straight to your head."
        , case model.users of
            NotRequested ->
                text ""

            Loading ->
                text "Fetching users..."

            Success users ->
                viewUsers users

            Error reason ->
                text reason
        ]


type Field
    = Name
    | Email


columns : List ( String, Int, Field )
columns =
    [ ( "Name", 1, Name )
    , ( "Email", 1, Email )
    ]


viewUsers : List GraphQLUser.User -> Html Msg
viewUsers users =
    div []
        [ viewTableActions
        , table
            [ class "list__table" ]
            ([ viewHeaderRow columns ] ++ List.map (viewRow columns) users)
        ]


viewTableActions : Html Msg
viewTableActions =
    div [ class "list__actions form__button-row form__button-row--right" ]
        [ button
            [ class "button button--success"
            , onClick (Navigate Route.AddUser)
            , attribute "data-content" "Add user"
            ]
            [ text "Add user" ]
        ]


viewHeaderRow : List ( String, Int, Field ) -> Html Msg
viewHeaderRow list =
    tr [ class "list__row list__row--header" ]
        (List.map viewHeaderCell list)


viewHeaderCell : ( String, Int, Field ) -> Html Msg
viewHeaderCell ( label, size, _ ) =
    th
        [ class "list__cell list__cell--header"
        , style [ ( "flex", toString size ) ]
        ]
        [ span [ class "" ] [ text label ]
        ]


viewRow : List ( String, Int, Field ) -> GraphQLUser.User -> Html Msg
viewRow list user =
    tr
        [ class "list__row"
        ]
        (List.map (viewCell user) list)


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
    Model RemoteData.NotRequested
        => fetchUsersAs user
