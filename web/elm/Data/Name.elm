module Data.Name exposing (Name, decoder)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type alias Name =
    { first : String
    , last : String
    }


decoder : Decoder Name
decoder =
    decode Name
        |> required "first" Decode.string
        |> required "last" Decode.string
