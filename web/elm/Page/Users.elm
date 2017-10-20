module Page.Users exposing (Model, Msg, view, update, init)

import Http
import Html exposing (..)
import Html.Attributes exposing (..)
import Data.RemoteData as RemoteData exposing (RemoteData(..))
import Data.User as User exposing (User)
import Views.Dashboard
import Schema.User as GraphQLUser
import Util exposing ((=>))


type alias Model =
    { users : RemoteData (List GraphQLUser.User)
    }


type Msg
    = FetchUsers
    | HandleUsersResponse (Result Http.Error GraphQLUser.UsersResponse)


update : User -> Msg -> Model -> ( Model, Cmd Msg )
update user msg model =
    case msg of
        FetchUsers ->
            model => fetchUsersAs user

        HandleUsersResponse (Ok response) ->
            { model | users = RemoteData.Success response.data.users }
                => Cmd.none

        HandleUsersResponse (Err error) ->
            { model | users = Error (Util.parseError error) }
                => Cmd.none


view : User -> Model -> Html Msg
view user model =
    div []
        [ Views.Dashboard.header "Manage users" "And let that power go straight to your head."
        , case model.users of
            NotRequested ->
                text "I should add a button here..."

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
        [ h3 [ class "list__title" ] [ text "All Users" ]
        , ul [ class "list__rows" ] (List.map viewUser users)
        ]


viewUser : GraphQLUser.User -> Html Msg
viewUser user =
    li [ class "list_row" ]
        [ a [ class "link", href ("/users/" ++ user.slug) ]
            [ text <| User.fullname user ]
        ]


fetchUsersAs : User -> Cmd Msg
fetchUsersAs user =
    GraphQLUser.fetchUsers user HandleUsersResponse


init : User -> ( Model, Cmd Msg )
init user =
    Model RemoteData.NotRequested
        => fetchUsersAs user
