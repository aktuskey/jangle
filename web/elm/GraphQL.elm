module GraphQL
    exposing
        ( Mutation
        , MutationParameter
        , Query
        , Response
        , ResponseMsg
        , QLType(..)
        , executeMutation
        , executeQuery
        , mutation
        , query
        )

import Data.User as User exposing (User)
import Http
import Json.Decode as Decode exposing (Decoder, Value)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)
import Json.Encode as Encode


type Query
    = Query String String


type QLType
    = QLString String
    | QLMaybeString String
    | QLArray (List String)


type alias MutationParameter =
    ( String, QLType )


type Mutation
    = Mutation String (List MutationParameter) String


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


mutation : String -> List MutationParameter -> String -> Mutation
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


getMutationParameterString : List MutationParameter -> String
getMutationParameterString triplets =
    triplets
        |> List.map (\( name, param ) -> "$" ++ name ++ ": " ++ (getType param))
        |> String.join ", "


getType : QLType -> String
getType param =
    case param of
        QLString _ ->
            "String!"

        QLMaybeString _ ->
            "String"

        QLArray _ ->
            "[String!]!"


getMutationVariableString : List MutationParameter -> String
getMutationVariableString triplets =
    triplets
        |> List.map (\( name, _ ) -> name ++ ": $" ++ name)
        |> String.join ", "


getEncodeField : MutationParameter -> ( String, Encode.Value )
getEncodeField ( name, param ) =
    case param of
        QLString value ->
            ( name, Encode.string value )

        QLMaybeString value ->
            ( name, Encode.string value )

        QLArray values ->
            ( name, Encode.list (List.map Encode.string values) )


executeQuery : ResponseMsg a msg -> User -> Query -> Decoder a -> Cmd msg
executeQuery msg user query decoder =
    Http.send msg (get user query decoder)


executeMutation : ResponseMsg a msg -> User -> Mutation -> Decoder a -> Cmd msg
executeMutation msg user mutation decoder =
    Http.send msg (post user mutation decoder)
