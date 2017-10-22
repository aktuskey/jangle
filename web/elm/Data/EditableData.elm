module Data.EditableData exposing (EditableData(..), isUpdating)


type EditableData a
    = NotRequested
    | Fetching
    | Updating a
    | Success a
    | Error String


isUpdating : EditableData a -> Bool
isUpdating data =
    case data of
        Updating _ ->
            True

        _ ->
            False
