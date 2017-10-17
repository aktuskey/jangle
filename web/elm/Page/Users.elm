module Page.Users exposing (Model, Msg, view, update, init)

import Html exposing (..)
import Html.Attributes exposing (..)
import Data.RemoteData as RemoteData exposing (RemoteData(..))
import Data.Name as Name exposing (Name)
import Data.User as User exposing (User)
import Data.Api.User as ApiUser
import Util exposing ((=>))


type alias Model =
    { users : RemoteData (List ApiUser.User)
    }


type Msg
    = FetchUsers


view : User -> Model -> Html Msg
view user model =
    h1 [ class "dashboard__title" ] [ text "Manage users" ]


update : User -> Msg -> Model -> ( Model, Cmd Msg )
update user msg model =
    case msg of
        FetchUsers ->
            model
                => fetchUsersAs user


fetchUsersAs : User -> Cmd Msg
fetchUsersAs user =
    Cmd.none


init : User -> ( Model, Cmd Msg )
init user =
    Model
        (Success
            [ ApiUser.User (Name "Ryan" "Haskell-Glatz") "ryan@jangle.com" "admin"
            , ApiUser.User (Name "Alex" "Hawley") "alex@jangle.com" "admin"
            , ApiUser.User (Name "Erik" "Carron") "erik@jangle.com" "editor"
            ]
        )
        => fetchUsersAs user
