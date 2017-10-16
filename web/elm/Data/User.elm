module Data.User exposing (User, decoder, fullname, storeContext)

import Ports
import Json.Encode as Encode exposing (Value)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)
import Util exposing ((=>))


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


storeContext : User -> Cmd msg
storeContext user =
    encode user
        |> Encode.encode 0
        |> Just
        |> Ports.storeContext


encode : User -> Value
encode user =
    Encode.object
        [ "email" => Encode.string user.email
        , "token" => Encode.string user.token
        , "role" => Encode.string user.role
        , "name" => encodeName user.name
        ]


encodeName : Name -> Value
encodeName name =
    Encode.object
        [ "first" => Encode.string name.first
        , "last" => Encode.string name.last
        ]


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
