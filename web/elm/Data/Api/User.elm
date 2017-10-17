module Data.Api.User exposing (User, decoder)

import Data.Name as Name exposing (Name)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type alias User =
    { name : Name
    , email : String
    , role : String
    }


decoder : Decoder User
decoder =
    decode User
        |> required "name" Name.decoder
        |> required "email" Decode.string
        |> required "role" Decode.string