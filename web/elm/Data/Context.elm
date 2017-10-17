module Data.Context exposing (Context, updateCurrentUrl)

import Data.User exposing (User)


type alias Context =
    { user : Maybe User
    , currentUrl : String
    }


updateCurrentUrl : String -> Context -> Context
updateCurrentUrl url context =
    { context | currentUrl = url }
