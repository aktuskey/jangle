module Schema.User exposing (RemoveUserResponse, UpdateUserResponse, User, UserResponse, UsersResponse, fetchUser, fetchUsers, removeUser, updateUser)

import Data.Delta as Delta exposing (Delta)
import Data.Name as Name exposing (Name)
import Data.User
import GraphQL
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


type alias UpdateUserResponse =
    { data : UpdateUserMutation }


type alias RemoveUserResponse =
    { data : RemoveUserMutation }


type alias UserQuery =
    { user : User
    }


type alias UsersQuery =
    { users : List User
    }


type alias UpdateUserMutation =
    { updateUser : User
    }


type alias RemoveUserMutation =
    { removeUser : User
    }


fetchUser : Data.User.User -> String -> GraphQL.ResponseMsg UserQuery msg -> Cmd msg
fetchUser user slug msg =
    GraphQL.executeQuery msg user (userQuery slug) userQueryDecoder


fetchUsers : Data.User.User -> GraphQL.ResponseMsg UsersQuery msg -> Cmd msg
fetchUsers user msg =
    GraphQL.executeQuery msg user usersQuery usersQueryDecoder


updateUser : Data.User.User -> String -> List (Delta String) -> GraphQL.ResponseMsg UpdateUserMutation msg -> Cmd msg
updateUser user slug changes msg =
    GraphQL.executeMutation msg user (updateUserMutation slug changes) updateUserMutationDecoder


removeUser : Data.User.User -> String -> GraphQL.ResponseMsg RemoveUserMutation msg -> Cmd msg
removeUser user slug msg =
    GraphQL.executeMutation msg user (removeUserMutation slug) removeUserMutationDecoder


userReturnType : String
userReturnType =
    "{name{first,last},role,email,slug}"


usersQuery : GraphQL.Query
usersQuery =
    GraphQL.query "users" userReturnType


userQuery : String -> GraphQL.Query
userQuery slug =
    GraphQL.query ("user(slug:\"" ++ slug ++ "\")") userReturnType


removeUserMutation : String -> GraphQL.Mutation
removeUserMutation slug =
    GraphQL.mutation
        "removeUser"
        [ ( "slug", "String!", slug ) ]
        userReturnType


updateUserMutation : String -> List (Delta String) -> GraphQL.Mutation
updateUserMutation slug changes =
    GraphQL.mutation
        "updateUser"
        ([ ( "slug", "String!", slug ) ] ++ List.map getMutationTuple changes)
        userReturnType


getMutationTuple : Delta String -> GraphQL.MutationTriplet
getMutationTuple { fieldName, after } =
    ( fieldName, "String", after )


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
        |> required "user" userDecoder


updateUserMutationDecoder : Decoder UpdateUserMutation
updateUserMutationDecoder =
    decode UpdateUserMutation
        |> required "updateUser" userDecoder


removeUserMutationDecoder : Decoder RemoveUserMutation
removeUserMutationDecoder =
    decode RemoveUserMutation
        |> required "removeUser" userDecoder
