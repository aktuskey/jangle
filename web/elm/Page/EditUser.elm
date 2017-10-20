module Page.EditUser exposing (init, view, update, Model, Msg)

import Html exposing (..)
import Html.Attributes exposing (..)
import Http
import Data.User
import Data.RemoteData as RemoteData exposing (RemoteData(..))
import Views.Dashboard
import Schema.User as GraphQLUser exposing (User)
import Util exposing ((=>))


type PageType
    = AddPage
    | EditPage


type alias Model =
    { user : RemoteData User
    , pageType : PageType
    }


type Msg
    = HandleUserResponse (Result Http.Error GraphQLUser.UserResponse)


init : Maybe String -> Data.User.User -> ( Model, Cmd Msg )
init slug user =
    let
        ( pageType, user_, cmd ) =
            case slug of
                Just slug ->
                    ( EditPage
                    , RemoteData.Loading
                    , GraphQLUser.fetchUser user slug HandleUserResponse
                    )

                Nothing ->
                    ( AddPage
                    , RemoteData.NotRequested
                    , Cmd.none
                    )
    in
        ( Model user_ pageType, cmd )


view : Data.User.User -> Model -> Html Msg
view user model =
    div []
        [ viewHeader model
        , viewUser model
        ]


viewHeader : Model -> Html Msg
viewHeader { pageType } =
    let
        title =
            case pageType of
                AddPage ->
                    "Add a user"

                EditPage ->
                    "Edit user"
    in
        Views.Dashboard.header title "People are nice."


viewUser : Model -> Html Msg
viewUser { user } =
    case user of
        NotRequested ->
            text "No user to display."

        Loading ->
            text "Loading user..."

        Success user ->
            section [ class "list" ]
                [ h3 [ class "list__title" ] [ text <| Data.User.fullname user ]
                , ul [ class "list__rows" ]
                    [ div [ style [ ( "margin-top", ".5rem" ) ] ] [ text <| "Email: " ++ user.email ]
                    , div [ style [ ( "margin-top", ".5rem" ) ] ] [ text <| "Role: " ++ user.role ]
                    ]
                ]

        Error message ->
            text message


update : Data.User.User -> Msg -> Model -> ( Model, Cmd Msg )
update user msg model =
    case msg of
        HandleUserResponse (Ok response) ->
            { model | user = RemoteData.Success response.data.user }
                => Cmd.none

        HandleUserResponse (Err error) ->
            { model | user = RemoteData.Error (Util.parseError error) }
                => Cmd.none
