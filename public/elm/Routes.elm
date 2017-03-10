module Routes exposing (Page(..), getPage, getPath, getLocation, getLink, getNewLocation)

import Navigation exposing (Location)
import UrlParser as Url exposing (top, s)


type Page
    = SignIn
    | Dashboard
    | Users
    | Collections
    | NotFound


type alias Route =
    Url.Parser (Page -> Page) Page


type alias Parser =
    Route -> Location -> Maybe Page


useHashes : Bool
useHashes =
    False


prefix : String
prefix =
    if useHashes then
        "#"
    else
        "/"


getParser : Parser
getParser =
    if useHashes then
        Url.parseHash
    else
        Url.parsePath


route : Route
route =
    Url.oneOf
        [ Url.map Dashboard (s "")
        , Url.map Dashboard (s "dashboard")
        , Url.map SignIn (s "sign-in")
        , Url.map Collections (s "collections")
        , Url.map Users (s "users")
        ]


getPage : Location -> Page
getPage location =
    case getParser route location of
        Just page ->
            page

        Nothing ->
            NotFound


getLocation : Page -> Location -> Location
getLocation page location =
    getNewLocation
        (getPath page)
        location


getPath : Page -> String
getPath page =
    case page of
        SignIn ->
            "sign-in"

        Dashboard ->
            "dashboard"

        Collections ->
            "collections"

        Users ->
            "users"

        NotFound ->
            "not-found"


getLink : Page -> String
getLink page =
    prefix ++ getPath page


getNewLocation : String -> Location -> Location
getNewLocation newRoute location =
    if useHashes then
        { location | hash = prefix ++ newRoute }
    else
        { location | pathname = prefix ++ newRoute }
