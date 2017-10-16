module Views.Nav exposing (Model, init, view, update, Msg, ExternalMsg(..))

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Util exposing ((=>))


type Msg
    = ToggleMenu
    | SignOutClick


type ExternalMsg
    = NoOp
    | SignOut


type alias Model =
    { expandMenu : Bool
    }


init : Model
init =
    Model False


type Link
    = PageLink String String
    | ActionLink String Msg


update : Msg -> Model -> ( Model, ExternalMsg )
update msg model =
    case msg of
        ToggleMenu ->
            { model | expandMenu = not model.expandMenu }
                => NoOp

        SignOutClick ->
            model
                => SignOut


navigationOptions : List ( String, List Link )
navigationOptions =
    [ ( "Collections"
      , [ PageLink "Authors" "/collections/authors"
        , PageLink "Blog Posts" "/collections/blog-posts"
        ]
      )
    , ( "Users"
      , [ PageLink "Manage users" "/users/manage"
        , PageLink "Add a user" "/users/new"
        ]
      )
    ]


view : Model -> Html Msg
view model =
    nav [ class "nav" ]
        [ viewNavigationHeader
        , viewCollapsableContent model
        ]


viewNavigationHeader : Html Msg
viewNavigationHeader =
    header [ class "nav__header" ]
        [ viewMobileMenuIcon
        , h3 [ class "nav__header-title" ] [ text "Jangle" ]
        ]


viewMobileMenuIcon : Html Msg
viewMobileMenuIcon =
    span
        [ class "nav__header-menu-icon"
        , onClick ToggleMenu
        ]
        []


viewCollapsableContent : Model -> Html Msg
viewCollapsableContent { expandMenu } =
    div
        [ class "nav__content"
        , classList [ ( "nav__content--expanded", expandMenu ) ]
        ]
        [ viewNavigationOptions
        , viewNavigationFooter
        ]


viewNavigationOptions : Html Msg
viewNavigationOptions =
    ul [ class "nav__options" ]
        (List.map viewNavigationOption navigationOptions)


viewNavigationOption : ( String, List Link ) -> Html Msg
viewNavigationOption ( header, links ) =
    li [ class "nav__option" ]
        ([ span
            [ class "nav__option-header" ]
            [ text header ]
         ]
            ++ (List.map viewNavigationLink links)
        )


viewNavigationLink : Link -> Html Msg
viewNavigationLink link =
    case link of
        PageLink label url ->
            a [ class "nav__link", href url ] [ text label ]

        ActionLink label msg ->
            a [ class "nav__link", onClick msg ] [ text label ]


viewNavigationFooter : Html Msg
viewNavigationFooter =
    footer [ class "nav__footer" ]
        [ viewNavigationLink (ActionLink "Sign out" SignOutClick)
        ]
