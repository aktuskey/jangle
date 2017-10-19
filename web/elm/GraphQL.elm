module GraphQL exposing (Query, Response, ResponseMsg, query, sendQuery)

import Http
import Data.User as User exposing (User)
import Json.Decode as Decode exposing (Decoder, Value)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type Query
    = Query String String


type alias ResponseMsg a msg =
    Result Http.Error (Response a) -> msg


type alias Response a =
    { data : a
    }


responseDecoder : Decoder a -> Decoder (Response a)
responseDecoder decoder =
    decode Response
        |> required "data" decoder


query : String -> String -> Query
query query body =
    Query query body


get : User -> Query -> Decoder a -> Http.Request (Response a)
get user (Query query body) decoder =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ user.token) ]
        , url = "/graphql?query={" ++ query ++ body ++ "}"
        , body = Http.emptyBody
        , expect = Http.expectJson (responseDecoder decoder)
        , timeout = Nothing
        , withCredentials = False
        }


sendQuery : ResponseMsg a msg -> User -> Query -> Decoder a -> Cmd msg
sendQuery msg user query decoder =
    Http.send msg (get user query decoder)
