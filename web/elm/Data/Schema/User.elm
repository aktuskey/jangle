module Data.Schema.User exposing (User, decoder, usersDecoder, UserQuery, usersQuery)

import Data.Name as Name exposing (Name)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)
import GraphQL


type alias User =
    { name : Name
    , slug : String
    , email : String
    , role : String
    }


type alias UserQuery =
    { users : List User
    }


usersQuery : String -> GraphQL.Query
usersQuery endpoint =
    GraphQL.query endpoint "users" "{name{first,last},slug,email,role}"


decoder : Decoder User
decoder =
    decode User
        |> required "name" Name.decoder
        |> required "slug" Decode.string
        |> required "email" Decode.string
        |> required "role" Decode.string


usersDecoder : Decoder UserQuery
usersDecoder =
    decode UserQuery
        |> required "users" (Decode.list decoder)
