module Data.Context exposing (Context, Msg(..), updateCurrentUrl)

import Data.User exposing (User)
import Route exposing (Route)


type alias Context =
    { user : Maybe User
    , currentUrl : String
    }


type Msg
    = NoOp
    | SignOut
    | NavigateTo Route


updateCurrentUrl : String -> Context -> Context
updateCurrentUrl url context =
    { context | currentUrl = url }
