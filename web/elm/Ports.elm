port module Ports exposing (storeContext, onContextChange)

import Json.Encode exposing (Value)


port storeContext : Maybe String -> Cmd msg


port onContextChange : (Value -> msg) -> Sub msg
