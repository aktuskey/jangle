module Schema.User
    exposing
        ( RemoveUserResponse
        , UpdateUserResponse
        , CreateUserResponse
        , User
        , NewUser
        , UserResponse
        , UsersResponse
        , fetchUser
        , fetchUsers
        , createUser
        , removeUser
        , updateUser
        )

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


type alias NewUser =
    { firstName : String
    , lastName : String
    , email : String
    , role : String
    , password : String
    }


type alias UsersResponse =
    { data : UsersQuery }


type alias UserResponse =
    { data : UserQuery }


type alias CreateUserResponse =
    { data : CreateUserMutation }


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


type alias CreateUserMutation =
    { createUser : User
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


createUser : Data.User.User -> NewUser -> GraphQL.ResponseMsg CreateUserMutation msg -> Cmd msg
createUser user newUser msg =
    GraphQL.executeMutation msg user (createUserMutation newUser) createUserMutationDecoder


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


createUserMutation : NewUser -> GraphQL.Mutation
createUserMutation { firstName, lastName, password, email, role } =
    GraphQL.mutation
        "createUser"
        [ ( "firstName", "String!", firstName )
        , ( "lastName", "String!", lastName )
        , ( "email", "String!", email )
        , ( "role", "String!", role )
        , ( "password", "String!", password )
        ]
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


createUserMutationDecoder : Decoder CreateUserMutation
createUserMutationDecoder =
    decode CreateUserMutation
        |> required "createUser" userDecoder


updateUserMutationDecoder : Decoder UpdateUserMutation
updateUserMutationDecoder =
    decode UpdateUserMutation
        |> required "updateUser" userDecoder


removeUserMutationDecoder : Decoder RemoveUserMutation
removeUserMutationDecoder =
    decode RemoveUserMutation
        |> required "removeUser" userDecoder
