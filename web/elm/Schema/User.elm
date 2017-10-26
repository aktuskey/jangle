module Schema.User
    exposing
        ( User
        , RemoveUserResponse
        , RemoveUsersResponse
        , UpdateUserResponse
        , CreateUserResponse
        , NewUser
        , UserResponse
        , UsersResponse
        , fetchUser
        , fetchUsers
        , createUser
        , removeUser
        , removeUsers
        , updateUser
        )

import Data.Delta as Delta exposing (Delta)
import Data.Name as Name exposing (Name)
import Data.User
import GraphQL exposing (QLType(..))
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


type alias RemoveUsersResponse =
    { data : RemoveUsersMutation }


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


type alias RemoveUsersMutation =
    { removedUsers : List User
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


removeUsers : Data.User.User -> List String -> GraphQL.ResponseMsg RemoveUsersMutation msg -> Cmd msg
removeUsers user slugs msg =
    GraphQL.executeMutation msg user (removeUsersMutation slugs) removeUsersMutationDecoder


userReturnType : String
userReturnType =
    "{name{first,last},role,email,slug}"


usersQuery : GraphQL.Query
usersQuery =
    GraphQL.query
        "users"
        userReturnType


userQuery : String -> GraphQL.Query
userQuery slug =
    GraphQL.query
        ("user(slug:\"" ++ slug ++ "\")")
        userReturnType


removeUserMutation : String -> GraphQL.Mutation
removeUserMutation slug =
    GraphQL.mutation
        "removeUser"
        [ ( "slug", QLString slug ) ]
        userReturnType


removeUsersMutation : List String -> GraphQL.Mutation
removeUsersMutation slugs =
    GraphQL.mutation
        "removeUsers"
        [ ( "slugs", QLArray slugs ) ]
        userReturnType


createUserMutation : NewUser -> GraphQL.Mutation
createUserMutation { firstName, lastName, password, email, role } =
    GraphQL.mutation
        "createUser"
        [ ( "firstName", QLString firstName )
        , ( "lastName", QLString lastName )
        , ( "email", QLString email )
        , ( "role", QLString role )
        , ( "password", QLString password )
        ]
        userReturnType


updateUserMutation : String -> List (Delta String) -> GraphQL.Mutation
updateUserMutation slug changes =
    GraphQL.mutation
        "updateUser"
        ([ ( "slug", QLString slug ) ] ++ List.map getMutationTuple changes)
        userReturnType


getMutationTuple : Delta String -> GraphQL.MutationParameter
getMutationTuple { fieldName, after } =
    ( fieldName, QLMaybeString after )


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


removeUsersMutationDecoder : Decoder RemoveUsersMutation
removeUsersMutationDecoder =
    decode RemoveUsersMutation
        |> required "removeUsers" (Decode.list userDecoder)
