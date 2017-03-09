module Types exposing (..)

import Navigation


type alias Name =
    { first : String
    , last : String
    }


type alias User =
    { name : Name
    , username : String
    }


type alias Flags =
    { user : Maybe User
    }


type alias Response a =
    { error : Bool
    , message : String
    , data : List a
    }


type alias Context =
    { user : Maybe User
    , location : Navigation.Location
    }
