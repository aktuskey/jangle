module Data.Api.User exposing (User, decoder, graphQlDecoder, GraphQLUser)

import Data.Name as Name exposing (Name)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type alias User =
    { name : Name
    , email : String
    , role : String
    }


type alias GraphQLUser =
    { data : UserObject
    }


type alias UserObject =
    { users : List User
    }


decoder : Decoder User
decoder =
    decode User
        |> required "name" Name.decoder
        |> required "email" Decode.string
        |> required "role" Decode.string


graphQlDecoder : Decoder GraphQLUser
graphQlDecoder =
    decode GraphQLUser
        |> required "data" userObjectDecoder


userObjectDecoder : Decoder UserObject
userObjectDecoder =
    decode UserObject
        |> required "users" (Decode.list decoder)
