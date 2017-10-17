module GraphQL exposing (Query, query, sendQuery)

import Http
import Data.User as User exposing (User)
import Json.Decode as Decode exposing (Decoder, Value)


type Query
    = Query String String String


query : String -> String -> String -> Query
query endpoint query body =
    Query endpoint query body


get : User -> Query -> Decoder a -> Http.Request a
get user (Query endpoint query body) decoder =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ user.token) ]
        , url = endpoint ++ "?query={ " ++ query ++ " " ++ body ++ " }"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


sendQuery : (Result Http.Error a -> msg) -> User -> Query -> Decoder a -> Cmd msg
sendQuery msg user query decoder =
    Http.send msg (get user query decoder)
