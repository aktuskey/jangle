module Page.Users exposing (Model, Msg, view, update, init)

import Html exposing (..)
import Html.Attributes exposing (..)
import Http
import Data.RemoteData as RemoteData exposing (RemoteData(..))
import Data.Name as Name exposing (Name)
import Data.User as User exposing (User)
import Data.Api.User as ApiUser
import Util exposing ((=>))
import GraphQL


type alias Model =
    { users : RemoteData (List ApiUser.User)
    }


type Msg
    = FetchUsers
    | HandleUserResponse (Result Http.Error ApiUser.GraphQLUser)


update : User -> Msg -> Model -> ( Model, Cmd Msg )
update user msg model =
    case msg of
        FetchUsers ->
            model
                => fetchUsersAs user

        HandleUserResponse (Ok response) ->
            { model | users = RemoteData.Success response.data.users }
                => Cmd.none

        HandleUserResponse (Err error) ->
            { model | users = Error (Util.parseError error) }
                => Cmd.none


fetchUsersAs : User -> Cmd Msg
fetchUsersAs user =
    GraphQL.sendQuery HandleUserResponse user (GraphQL.query "/graphql" "users" "{ name { first last } email role }") ApiUser.graphQlDecoder


view : User -> Model -> Html Msg
view user model =
    div []
        [ div [ class "dashboard__header--right" ]
            [ h1 [ class "dashboard__title" ] [ text "Manage users" ]
            , h2 [ class "dashboard__subtitle" ] [ text "And let that power go straight to your head." ]
            ]
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


viewUsers : List ApiUser.User -> Html Msg
viewUsers users =
    section [ class "list" ]
        [ h3 [ class "list__title" ] [ text "All Users" ]
        , ul [ class "list__rows" ] (List.map viewUser users)
        ]


viewUser : ApiUser.User -> Html Msg
viewUser user =
    li [ class "list_row" ] [ text <| User.fullname user ]


init : User -> ( Model, Cmd Msg )
init user =
    Model RemoteData.NotRequested
        => fetchUsersAs user
