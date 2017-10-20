module Schema.User exposing (User, fetchUsers, fetchUser, UserResponse, UsersResponse)

import GraphQL
import Data.Name as Name exposing (Name)
import Data.User
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (decode, required)


type alias User =
    { name : Name
    , slug : String
    , email : String
    , role : String
    }


type alias UsersResponse =
    { data : UsersQuery }


type alias UserResponse =
    { data : UserQuery }


type alias UserQuery =
    { user : User
    }


type alias UsersQuery =
    { users : List User
    }


fetchUser : Data.User.User -> String -> GraphQL.ResponseMsg UserQuery msg -> Cmd msg
fetchUser user slug msg =
    GraphQL.sendQuery msg user (userQuery slug) userQueryDecoder


fetchUsers : Data.User.User -> GraphQL.ResponseMsg UsersQuery msg -> Cmd msg
fetchUsers user msg =
    GraphQL.sendQuery msg user usersQuery usersQueryDecoder


usersQuery : GraphQL.Query
usersQuery =
    GraphQL.query "users" "{name{first,last},slug,email,role}"


userQuery : String -> GraphQL.Query
userQuery slug =
    GraphQL.query ("user(slug:\"" ++ slug ++ "\")") "{name{first,last},slug,email,role}"


userDecoder : Decoder User
userDecoder =
    decode User
        |> required "name" Name.decoder
        |> required "slug" Decode.string
        |> required "email" Decode.string
        |> required "role" Decode.string


usersQueryDecoder : Decoder UsersQuery
usersQueryDecoder =
    decode UsersQuery
        |> required "users" (Decode.list userDecoder)


userQueryDecoder : Decoder UserQuery
userQueryDecoder =
    decode UserQuery
        |> required "user" (userDecoder)
