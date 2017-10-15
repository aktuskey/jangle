module Data.RemoteData exposing (RemoteData(..))


type RemoteData a
    = NotRequested
    | Loading
    | Success a
    | Error String
