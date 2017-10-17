module Views.Nav exposing (Model, init, view, update, Msg, ExternalMsg(..))

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Util exposing ((=>))
import Debug


type Msg
    = ToggleMenu
    | SignOutClick
    | Navigate String


type ExternalMsg
    = NoOp
    | SignOut
    | NavigateTo String


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

        Navigate url ->
            { model | expandMenu = False }
                => NavigateTo url


navigationOptions : List ( String, List Link )
navigationOptions =
    [ ( "Collections"
      , [ PageLink "All collections" "/collections"
        , PageLink "Authors" "/collections/authors"
        , PageLink "Blog Posts" "/collections/blog-posts"
        ]
      )
    , ( "Users"
      , [ PageLink "Manage users" "/users"
        , PageLink "Add a user" "/users/new"
        ]
      )
    , ( "Collections"
      , [ PageLink "All collections" "/collections"
        , PageLink "Authors" "/collections/authors"
        , PageLink "Blog Posts" "/collections/blog-posts"
        ]
      )
    , ( "Users"
      , [ PageLink "Manage users" "/users"
        , PageLink "Add a user" "/users/new"
        ]
      )
    , ( "Users"
      , [ PageLink "Manage users" "/users"
        , PageLink "Add a user" "/users/new"
        ]
      )
    , ( "Collections"
      , [ PageLink "All collections" "/collections"
        , PageLink "Authors" "/collections/authors"
        , PageLink "Blog Posts" "/collections/blog-posts"
        ]
      )
    , ( "Users"
      , [ PageLink "Manage users" "/users"
        , PageLink "Add a user" "/users/new"
        ]
      )
    ]


view : String -> Model -> Html Msg
view currentUrl model =
    nav [ class "nav nav--light" ]
        [ viewNavigationHeader
        , viewCollapsableContent currentUrl model
        ]


viewNavigationHeader : Html Msg
viewNavigationHeader =
    header [ class "nav__header" ]
        [ viewMobileMenuIcon
        , button [ class "nav__brand", onClick (Navigate "/") ] [ text "Jangle" ]
        ]


viewMobileMenuIcon : Html Msg
viewMobileMenuIcon =
    button
        [ class "nav__menu-button"
        , onClick ToggleMenu
        ]
        [ span [ class "nav__menu-icon" ] []
        ]


viewCollapsableContent : String -> Model -> Html Msg
viewCollapsableContent currentUrl { expandMenu } =
    div
        [ class "nav__content"
        , classList [ ( "nav__content--expanded", expandMenu ) ]
        ]
        [ viewNavigationOptions currentUrl
        , viewNavigationFooter currentUrl
        ]


viewNavigationOptions : String -> Html Msg
viewNavigationOptions currentUrl =
    ul [ class "nav__options" ]
        (List.map (viewNavigationOption currentUrl) navigationOptions)


viewNavigationOption : String -> ( String, List Link ) -> Html Msg
viewNavigationOption currentUrl ( header, links ) =
    li [ class "nav__option" ]
        ([ span
            [ class "nav__option-header" ]
            [ text header ]
         ]
            ++ (List.map (viewNavigationLink currentUrl) links)
        )


viewNavigationLink : String -> Link -> Html Msg
viewNavigationLink currentUrl link =
    case link of
        PageLink label url ->
            div []
                [ button
                    [ class "nav__link"
                    , classList [ ( "nav__link--disabled", url == currentUrl ) ]
                    , if url == currentUrl then
                        disabled True
                      else
                        onClick (Navigate url)
                    , tabindex 0
                    ]
                    [ text label ]
                ]

        ActionLink label msg ->
            div [] [ button [ class "nav__link", onClick msg, tabindex 0 ] [ text label ] ]


viewNavigationFooter : String -> Html Msg
viewNavigationFooter currentUrl =
    footer [ class "nav__footer" ]
        [ (viewNavigationLink currentUrl) (ActionLink "Sign out" SignOutClick)
        ]
