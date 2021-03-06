module Route exposing (Route(..), fromLocation, href, modifyUrl, routeToString)

import Html exposing (Attribute)
import Html.Attributes as Attr
import Navigation exposing (Location)
import UrlParser as Url exposing ((</>), Parser, oneOf, parsePath, s, string, top)


type Route
    = Welcome
    | SignIn
    | Dashboard
    | Users
    | AddUser
    | EditUser String


route : Parser (Route -> a) a
route =
    oneOf
        [ Url.map Dashboard top
        , Url.map Welcome (s "welcome")
        , Url.map SignIn (s "sign-in")
        , Url.map Users (s "users")
        , Url.map AddUser (s "users" </> s "new")
        , Url.map EditUser (s "users" </> string)
        ]


routeToString : Route -> String
routeToString route =
    let
        pieces : List String
        pieces =
            case route of
                Dashboard ->
                    []

                Welcome ->
                    [ "welcome" ]

                SignIn ->
                    [ "sign-in" ]

                Users ->
                    [ "users" ]

                EditUser slug ->
                    [ "users", slug ]

                AddUser ->
                    [ "users", "new" ]
    in
    "/" ++ String.join "/" pieces



-- PUBLIC HELPERS --


href : Route -> Attribute msg
href route =
    Attr.href (routeToString route)


modifyUrl : Route -> Cmd msg
modifyUrl =
    routeToString >> Navigation.modifyUrl


fromLocation : Location -> Maybe Route
fromLocation location =
    if String.isEmpty location.pathname then
        Just Dashboard
    else
        parsePath route location
