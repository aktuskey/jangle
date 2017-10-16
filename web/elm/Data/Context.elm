module Data.Context exposing (Context)

import Data.User exposing (User)


type alias Context =
    { user : Maybe User
    , currentUrl : String
    }
