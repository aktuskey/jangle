module Route exposing (Route(..), fromLocation, href, modifyUrl, routeToString)

import Navigation exposing (Location)
import UrlParser as Url exposing ((</>), Parser, oneOf, parsePath, s, string, top)
import Html exposing (Attribute)
import Html.Attributes as Attr


type Route
    = SignIn
    | Dashboard
    | Users
    | AddUser


route : Parser (Route -> a) a
route =
    oneOf
        [ Url.map Dashboard top
        , Url.map SignIn (s "sign-in")
        , Url.map Users (s "users")
        , Url.map AddUser (s "users" </> s "new")
        ]


routeToString : Route -> String
routeToString page =
    let
        pieces : List String
        pieces =
            case page of
                Dashboard ->
                    []

                SignIn ->
                    [ "sign-in" ]

                Users ->
                    [ "users" ]

                AddUser ->
                    [ "users", "new" ]
    in
        "/" ++ (String.join "/" pieces)



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
