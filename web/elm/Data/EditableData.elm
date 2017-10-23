module Data.EditableData exposing (EditableData(..), isRemoving, isUpdating)


type EditableData a
    = NotRequested
    | Fetching
    | Updating a
    | Removing a
    | Success a
    | Error String


isUpdating : EditableData a -> Bool
isUpdating data =
    case data of
        Updating _ ->
            True

        _ ->
            False


isRemoving : EditableData a -> Bool
isRemoving data =
    case data of
        Removing _ ->
            True

        _ ->
            False
