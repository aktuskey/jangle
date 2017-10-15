module Data.Response exposing (Response, decoder, post, handler, singleHandler)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)
import Http


type alias Response a =
    { error : Bool
    , message : String
    , data : List a
    }


decoder : Decoder a -> Decoder (Response a)
decoder subDecoder =
    decode Response
        |> required "error" Decode.bool
        |> required "message" Decode.string
        |> required "data" (Decode.list subDecoder)


post : String -> Http.Body -> Decoder a -> Http.Request (Response a)
post url body decoder_ =
    Http.post url body (decoder decoder_)


handler : Result Http.Error (Response a) -> Result String (List a)
handler result =
    case result of
        Ok response ->
            Ok response.data

        Err error ->
            case error of
                Http.BadUrl msg ->
                    Err msg

                Http.Timeout ->
                    Err "Request timed out."

                Http.NetworkError ->
                    Err "Network error"

                Http.BadStatus { status } ->
                    Err ("Bad status " ++ status.message)

                Http.BadPayload error _ ->
                    Err error


singleHandler : Result Http.Error (Response a) -> Result String a
singleHandler result =
    case handler result of
        Ok data ->
            case List.head data of
                Just thing ->
                    Ok thing

                Nothing ->
                    Err (Maybe.withDefault "No item found." (getErrorMessage result))

        Err error ->
            Err error


getErrorMessage : Result Http.Error (Response a) -> Maybe String
getErrorMessage result =
    case result of
        Ok response ->
            Just response.message

        Err _ ->
            Nothing
