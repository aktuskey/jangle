module Schema.User exposing (User, decoder, Query, fetchUsers)

import GraphQL
import Data.Name as Name exposing (Name)
import Data.User
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type alias User =
    { name : Name
    , slug : String
    , email : String
    , role : String
    }


type alias Query =
    GraphQL.Response UserQuery


type alias UserQuery =
    { users : List User
    }


fetchUsers : Data.User.User -> GraphQL.ResponseMsg UserQuery msg -> Cmd msg
fetchUsers user msg =
    GraphQL.sendQuery msg user usersQuery decoder


usersQuery : GraphQL.Query
usersQuery =
    GraphQL.query "users" "{name{first,last},slug,email,role}"


userDecoder : Decoder User
userDecoder =
    decode User
        |> required "name" Name.decoder
        |> required "slug" Decode.string
        |> required "email" Decode.string
        |> required "role" Decode.string


decoder : Decoder UserQuery
decoder =
    decode UserQuery
        |> required "users" (Decode.list userDecoder)
