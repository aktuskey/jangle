module Page.Dashboard exposing (ContentSection(..), Model, Msg(..), init, update, view)

import Data.Context as Context
import Data.User as User exposing (User)
import Html exposing (..)
import Html.Attributes exposing (..)
import Page.AddUser as AddUser
import Page.EditUser as EditUser
import Page.Users as Users
import Util exposing ((=>))
import Views.Dashboard
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
            div []
                [ Views.Dashboard.header
                    ("Welcome back, " ++ user.name.first ++ ".")
                    "It's great to see you."
                , p [ class "dashboard__text" ]
                    [ text "This would be a dashboard, but we're still working on that part." ]
                , p [ class "dashboard__text" ]
                    [ text "Why don't you try managing some users on the left?" ]
                , p [ class "dashboard__text" ]
                    [ text "We'll give them something useful to do soon." ]
                ]

        Users model ->
            Html.map UsersMsg (Users.view user model)

        AddUser model ->
            Html.map AddUserMsg (AddUser.view model)

        EditUser model ->
            Html.map EditUserMsg (EditUser.view user model)
