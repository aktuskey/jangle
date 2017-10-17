module Data.User exposing (User, decoder, fullname, storeContext)

import Ports
import Data.Name as Name exposing (Name)
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
        |> required "name" Name.decoder
        |> required "role" Decode.string


fullname : { user | name : Name } -> String
fullname user =
    user.name.first ++ " " ++ user.name.last
