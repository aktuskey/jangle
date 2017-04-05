module Types exposing (..)

import Navigation


type alias Name =
    { first : String
    , last : String
    }


type alias User =
    { name : Name
    , username : String
    , token : String
    }


type alias Label =
    { singular : String
    , plural : String
    }


type alias Field =
    { name : String
    , label : String
    , type_ : FieldType
    }


type FieldType
    = SingleLine
    | MultiLine
    | WholeNumber
    | DecimalNumber
    | Checkbox


type alias Collection =
    { name : String
    , labels : Label
    , fields : List Field
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
