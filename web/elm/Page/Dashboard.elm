module Page.Dashboard exposing (Msg, view)

import Html exposing (..)
import Data.User as User exposing (User)


type Msg
    = NoOp


view : User -> Html Msg
view user =
    h1 [] [ text (User.fullname user) ]
