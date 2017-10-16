module Page.Dashboard exposing (Msg, view, init, update, Model)

import Html exposing (..)
import Html.Attributes exposing (..)
import Data.User as User exposing (User)
import Views.Nav as Nav
import Util exposing ((=>))


type Msg
    = NavMsg Nav.Msg


type alias ExternalMsg =
    Nav.ExternalMsg


type alias Model =
    { navigation : Nav.Model
    }


init : Model
init =
    Model (Nav.init)


update : Msg -> Model -> ( Model, ExternalMsg )
update msg model =
    case msg of
        NavMsg subMsg ->
            let
                ( navModel, navMsg ) =
                    Nav.update subMsg model.navigation
            in
                { model | navigation = navModel }
                    => navMsg


view : User -> Model -> Html Msg
view user model =
    div [ class "page page--has-nav" ]
        [ Html.map NavMsg (Nav.view model.navigation)
        , section [ class "page--main-section" ] []
        ]
