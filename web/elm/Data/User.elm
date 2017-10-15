module Data.User exposing (User, decoder, fullname)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type alias User =
    { email : String
    , token : String
    , name : Name
    , role : String
    }


type alias Name =
    { first : String
    , last : String
    }


decoder : Decoder User
decoder =
    decode User
        |> required "email" Decode.string
        |> required "token" Decode.string
        |> required "name" nameDecoder
        |> required "role" Decode.string


nameDecoder : Decoder Name
nameDecoder =
    decode Name
        |> required "first" Decode.string
        |> required "last" Decode.string


fullname : User -> String
fullname user =
    user.name.first ++ " " ++ user.name.last
