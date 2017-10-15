module Page.Dashboard exposing (Msg, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Data.User as User exposing (User)


type Msg
    = NoOp


type alias Link =
    { label : String
    , url : String
    }


navigationOptions : List ( String, List Link )
navigationOptions =
    [ ( "Collections"
      , [ Link "Authors" "/collections/authors"
        , Link "Blog Posts" "/collections/blog-posts"
        ]
      )
    ]


view : User -> Html Msg
view user =
    div [ class "page page--has-nav" ]
        [ viewNavigation
        , section [ class "page--main-section" ] []
        ]


viewNavigation : Html Msg
viewNavigation =
    nav [ class "nav" ]
        [ viewNavigationHeader
        , viewCollapsableContent
        ]


viewNavigationHeader : Html Msg
viewNavigationHeader =
    header [ class "nav__header" ]
        [ viewMobileMenuIcon
        , h3 [ class "nav__header-title" ] [ text "Jangle" ]
        ]


viewMobileMenuIcon : Html Msg
viewMobileMenuIcon =
    span [ class "nav__header-menu-icon" ] []


viewCollapsableContent : Html Msg
viewCollapsableContent =
    div [ class "nav__content" ]
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
    a [ class "nav__link", href link.url ] [ text link.label ]


viewNavigationFooter : Html Msg
viewNavigationFooter =
    footer [ class "nav__footer" ]
        [ viewNavigationLink (Link "Sign out" "/sign-out")
        ]
