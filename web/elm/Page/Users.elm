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


viewUsers : List GraphQLUser.User -> Html Msg
viewUsers users =
    section [ class "list" ]
        [ h3 [ class "list__title" ] [ text "All users." ]
        , ul [ class "list__rows" ] (List.map viewUser users)
        ]


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
