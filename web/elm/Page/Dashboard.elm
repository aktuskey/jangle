module Page.Dashboard exposing (ContentSection(..), Model, Msg(..), init, update, view)

import Data.Context as Context
import Data.User as User exposing (User)
import Html exposing (..)
import Html.Attributes exposing (..)
import Page.AddUser as AddUser
import Page.EditUser as EditUser
import Page.Users as Users
import Util exposing ((=>))
import Views.Nav as Nav


type Msg
    = NavMsg Nav.Msg
    | UsersMsg Users.Msg
    | AddUserMsg AddUser.Msg
    | EditUserMsg EditUser.Msg


type ContentSection
    = Dashboard
    | Users Users.Model
    | AddUser AddUser.Model
    | EditUser EditUser.Model


type alias Model =
    { navigation : Nav.Model
    , section : ContentSection
    }


init : ContentSection -> Model
init contentSection =
    Model Nav.init contentSection


update : User -> Msg -> Model -> ( ( Model, Cmd Msg ), Context.Msg )
update user msg model =
    case ( msg, model.section ) of
        ( NavMsg subMsg, _ ) ->
            let
                ( navModel, navMsg ) =
                    Nav.update subMsg model.navigation
            in
                { model | navigation = navModel }
                    => Cmd.none
                    => navMsg

        ( UsersMsg subMsg, Users sectionModel ) ->
            let
                ( ( subModel, subCmd ), contextMsg ) =
                    Users.update user subMsg sectionModel
            in
                { model | section = Users subModel }
                    => Cmd.map UsersMsg subCmd
                    => contextMsg

        ( UsersMsg _, _ ) ->
            model
                => Cmd.none
                => Context.NoOp

        ( AddUserMsg subMsg, AddUser sectionModel ) ->
            let
                ( ( subModel, subCmd ), contextMsg ) =
                    AddUser.update user subMsg sectionModel
            in
                { model | section = AddUser subModel }
                    => Cmd.map AddUserMsg subCmd
                    => contextMsg

        ( AddUserMsg _, _ ) ->
            model
                => Cmd.none
                => Context.NoOp

        ( EditUserMsg subMsg, EditUser sectionModel ) ->
            let
                ( ( subModel, subCmd ), contextMsg ) =
                    EditUser.update user subMsg sectionModel
            in
                { model | section = EditUser subModel }
                    => Cmd.map EditUserMsg subCmd
                    => contextMsg

        ( EditUserMsg _, _ ) ->
            model
                => Cmd.none
                => Context.NoOp


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

        Users model ->
            Html.map UsersMsg (Users.view user model)

        AddUser model ->
            Html.map AddUserMsg (AddUser.view model)

        EditUser model ->
            Html.map EditUserMsg (EditUser.view user model)
