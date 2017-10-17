module Page.Dashboard exposing (Msg, view, init, update, Model, ContentSection(..))

import Html exposing (..)
import Html.Attributes exposing (..)
import Data.User as User exposing (User)
import Views.Nav as Nav
import Util exposing ((=>))


type Msg
    = NavMsg Nav.Msg


type ContentSection
    = Dashboard
    | Users --Users.Model
    | AddUser --AddUser.Model


type alias ExternalMsg =
    Nav.ExternalMsg


type alias Model =
    { navigation : Nav.Model
    , section : ContentSection
    }


init : ContentSection -> Model
init contentSection =
    Model (Nav.init) contentSection


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


view : String -> User -> Model -> Html Msg
view currentUrl user model =
    div [ class "page page--has-nav" ]
        [ Html.map NavMsg (Nav.view currentUrl model.navigation)
        , section
            [ class "dashboard" ]
            [ viewSection user model.section ]
        ]


viewSection : User -> ContentSection -> Html Msg
viewSection user section =
    case section of
        Dashboard ->
            div [ class "dashboard__header--right" ]
                [ h1 [ class "dashboard__title" ] [ text <| "Welcome back, " ++ user.name.first ++ "." ]
                , h3 [ class "dashboard__subtitle" ] [ text "Let's get started." ]
                ]

        Users ->
            h1 [ class "dashboard__title" ] [ text "Manage users" ]

        AddUser ->
            h1 [ class "dashboard__title" ] [ text "Add a new user" ]
