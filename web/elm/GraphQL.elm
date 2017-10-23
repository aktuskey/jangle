module GraphQL exposing (Mutation, MutationTriplet, Query, Response, ResponseMsg, executeMutation, executeQuery, mutation, query)

import Data.User as User exposing (User)
import Http
import Json.Decode as Decode exposing (Decoder, Value)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)
import Json.Encode as Encode


type Query
    = Query String String


type alias MutationTriplet =
    ( String, String, String )


type Mutation
    = Mutation String (List MutationTriplet) String


type alias ResponseMsg a msg =
    Result Http.Error (Response a) -> msg


type alias Response a =
    { data : a
    }


responseDecoder : Decoder a -> Decoder (Response a)
responseDecoder decoder =
    decode Response
        |> required "data" decoder


query : String -> String -> Query
query =
    Query


mutation : String -> List MutationTriplet -> String -> Mutation
mutation =
    Mutation


get : User -> Query -> Decoder a -> Http.Request (Response a)
get user (Query query body) decoder =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ user.token) ]
        , url = "/graphql?query={" ++ query ++ body ++ "}"
        , body = Http.emptyBody
        , expect = Http.expectJson (responseDecoder decoder)
        , timeout = Nothing
        , withCredentials = False
        }


post : User -> Mutation -> Decoder a -> Http.Request (Response a)
post user mutation decoder =
    Http.request
        { method = "POST"
        , headers = [ Http.header "Authorization" ("Bearer " ++ user.token) ]
        , url = "/graphql"
        , body = buildMutationBody mutation
        , expect = Http.expectJson (responseDecoder decoder)
        , timeout = Nothing
        , withCredentials = False
        }


buildMutationBody : Mutation -> Http.Body
buildMutationBody (Mutation name triplets returnType) =
    Http.jsonBody <|
        Encode.object
            [ ( "query", getQueryForMutation (Mutation name triplets returnType) )
            , ( "variables", Encode.object (List.map getEncodeField triplets) )
            ]


getQueryForMutation : Mutation -> Encode.Value
getQueryForMutation (Mutation name triplets returnType) =
    Encode.string
        ("mutation "
            ++ name
            ++ "("
            ++ getMutationParameterString triplets
            ++ ") {"
            ++ name
            ++ "("
            ++ getMutationVariableString triplets
            ++ ")"
            ++ returnType
            ++ "}"
        )


getMutationParameterString : List MutationTriplet -> String
getMutationParameterString triplets =
    triplets
        |> List.map (\( name, type_, _ ) -> "$" ++ name ++ ": " ++ type_)
        |> String.join ", "


getMutationVariableString : List MutationTriplet -> String
getMutationVariableString triplets =
    triplets
        |> List.map (\( name, _, _ ) -> name ++ ": $" ++ name)
        |> String.join ", "


getEncodeField : MutationTriplet -> ( String, Encode.Value )
getEncodeField ( name, _, value ) =
    ( name, Encode.string value )


executeQuery : ResponseMsg a msg -> User -> Query -> Decoder a -> Cmd msg
executeQuery msg user query decoder =
    Http.send msg (get user query decoder)


executeMutation : ResponseMsg a msg -> User -> Mutation -> Decoder a -> Cmd msg
executeMutation msg user mutation decoder =
    Http.send msg (post user mutation decoder)
