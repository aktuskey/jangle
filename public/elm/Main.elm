module Main exposing (..)

import Html exposing (..)
import Navigation exposing (Location)


type Msg
    = NoOp


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


type alias Model =
    { user : Maybe User
    }


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    Model flags.user ! []


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    model ! []


view : Model -> Html Msg
view model =
    case model.user of
        Just user ->
            text <| "Welcome back, " ++ user.name.first ++ "!"

        Nothing ->
            text "You should sign in!"


locationToMsg : Location -> Msg
locationToMsg location =
    NoOp


main : Program Flags Model Msg
main =
    Navigation.programWithFlags
        locationToMsg
        { init = init
        , subscriptions = (\_ -> Sub.none)
        , update = update
        , view = view
        }
