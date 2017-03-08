module Routes exposing (Page(..), getPage, getPath, getNewLocation)

import Navigation exposing (Location)
import UrlParser as Url exposing (top, s)


type Page
    = SignIn
    | Dashboard
    | NotFound


type alias Route =
    Url.Parser (Page -> Page) Page


type alias Parser =
    Route -> Location -> Maybe Page


useHashes : Bool
useHashes =
    False


getParser : Parser
getParser =
    if useHashes then
        Url.parseHash
    else
        Url.parsePath


route : Route
route =
    Url.oneOf
        [ Url.map SignIn (s "sign-in")
        , Url.map Dashboard (s "dashboard")
        ]


getPage : Location -> Page
getPage location =
    case getParser route location of
        Just page ->
            page

        Nothing ->
            NotFound


getPath : Page -> String
getPath page =
    case page of
        SignIn ->
            "sign-in"

        Dashboard ->
            "dashboard"

        NotFound ->
            "not-found"


getNewLocation : String -> Location -> Location
getNewLocation newRoute location =
    if useHashes then
        { location | hash = "#" ++ newRoute }
    else
        { location | pathname = "/" ++ newRoute }
