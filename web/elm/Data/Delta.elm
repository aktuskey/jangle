module Data.Delta exposing (Delta)


type alias Delta dataType =
    { fieldName : String
    , before : dataType
    , after : dataType
    }
