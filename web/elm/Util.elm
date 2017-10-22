module Util
    exposing
        ( (=>)
        , appendErrors
        , delay
        , getCmd
        , onClickStopPropagation
        , pair
        , parseError
        , viewIf
        , viewMaybe
        )

import Html exposing (Attribute, Html)
import Html.Events exposing (defaultOptions, onClick, onWithOptions)
import Http
import Json.Decode as Decode
import Process
import Task
import Time


(=>) : a -> b -> ( a, b )
(=>) =
    (,)


{-| infixl 0 means the (=>) operator has the same precedence as (<|) and (|>),
meaning you can use it at the end of a pipeline and have the precedence work out.
-}
infixl 0 =>


{-| Useful when building up a Cmd via a pipeline, and then pairing it with
a model at the end.

    session.user
        |> User.Request.foo
        |> Task.attempt Foo
        |> pair { model | something = blah }

-}
pair : a -> b -> ( a, b )
pair first second =
    first => second


viewIf : Bool -> Html msg -> Html msg
viewIf condition content =
    if condition then
        content
    else
        Html.text ""


viewMaybe : Maybe a -> (a -> Html msg) -> Html msg -> Html msg
viewMaybe maybeThing htmlNeedingThing otherHtml =
    case maybeThing of
        Just thing ->
            htmlNeedingThing thing

        Nothing ->
            otherHtml


onClickStopPropagation : msg -> Attribute msg
onClickStopPropagation msg =
    onWithOptions "click"
        { defaultOptions | stopPropagation = True }
        (Decode.succeed msg)


appendErrors : { model | errors : List error } -> List error -> { model | errors : List error }
appendErrors model errors =
    { model | errors = model.errors ++ errors }


delay : Float -> msg -> Cmd msg
delay millisecondsToWait msg =
    Process.sleep (Time.millisecond * millisecondsToWait)
        |> Task.perform (\_ -> msg)


getCmd : msg -> Cmd msg
getCmd msg =
    Cmd.map (always msg) Cmd.none


href : (String -> msg) -> String -> Html.Attribute msg
href msg url =
    onClick (msg url)


parseError : Http.Error -> String
parseError error =
    case error of
        Http.BadUrl msg ->
            msg

        Http.Timeout ->
            "Request timed out."

        Http.NetworkError ->
            "Network error"

        Http.BadStatus { status } ->
            "Bad status " ++ status.message

        Http.BadPayload error _ ->
            let
                _ =
                    Debug.log "Response Error: " error
            in
            "Oops! Something went wrong, please try again."
