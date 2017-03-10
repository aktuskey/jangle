module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Navigation exposing (Location)
import Json.Decode as Json exposing (field, null, oneOf, string)
import Task
import Routes exposing (Page)
import Types exposing (..)


emptyHtml : Html Msg
emptyHtml =
    text ""


type Msg
    = NoOp
    | PageChange Page
    | PageLoaded
    | UsernameUpdated String
    | PasswordUpdated String
    | SignInSubmit
    | SignInResponded (Result Http.Error User)
    | SignOutSubmit
    | SignOutResponded (Result Http.Error (Response User))
    | GetCollections
    | CollectionsRetrieved (Result Http.Error (Response Collection))


type alias Model =
    { context : Context
    , username : String
    , password : String
    , errorMessage : Maybe String
    , handlingRequest : Bool
    , gettingCollections : Bool
    , collections : List Collection
    , collectionFilter : String
    }


getCmdForMsg : msg -> Cmd msg
getCmdForMsg msg =
    Task.perform identity (Task.succeed msg)


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    Model
        (Context flags.user location)
        ""
        ""
        Nothing
        False
        False
        []
        ""
        ! [ getCmdForMsg PageLoaded ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PageChange newPage ->
            let
                context =
                    model.context

                newContext =
                    setLocation newPage context
            in
                { model | context = newContext }
                    ! [ Navigation.newUrl (Routes.getPath newPage) ]

        PageLoaded ->
            if (getPage model) /= Routes.SignIn && model.context.user == Nothing then
                model
                    ! [ getCmdForMsg (PageChange Routes.SignIn) ]
            else
                case (getPage model) of
                    Routes.Collections ->
                        model ! [ getCmdForMsg GetCollections ]

                    _ ->
                        model ! []

        UsernameUpdated newUsername ->
            { model | username = newUsername }
                ! []

        PasswordUpdated newPassword ->
            { model | password = newPassword }
                ! []

        SignInSubmit ->
            if model.handlingRequest then
                model ! []
            else
                { model | handlingRequest = True }
                    ! [ attemptSignIn model.username model.password ]

        SignInResponded result ->
            case result of
                Ok user ->
                    let
                        context =
                            model.context

                        newContext =
                            { context | user = Just user }
                    in
                        { model
                            | handlingRequest = False
                            , context = newContext
                            , errorMessage = Nothing
                        }
                            ! [ getCmdForMsg <| PageChange Routes.Dashboard ]

                Err error ->
                    { model
                        | errorMessage = Just "Could not sign in."
                        , handlingRequest = False
                    }
                        ! []

        GetCollections ->
            { model | gettingCollections = True } ! [ getCollections ]

        CollectionsRetrieved result ->
            case result of
                Ok response ->
                    { model
                        | collections = response.data
                        , gettingCollections = False
                    }
                        ! []

                Err error ->
                    { model | gettingCollections = False }
                        ! []

        SignOutSubmit ->
            if model.handlingRequest then
                model ! []
            else
                { model | handlingRequest = True }
                    ! [ attemptSignOut ]

        SignOutResponded result ->
            case result of
                Ok response ->
                    let
                        context =
                            model.context

                        newContext =
                            { context | user = Nothing }
                    in
                        { model
                            | handlingRequest = False
                            , context = newContext
                            , errorMessage = Nothing
                        }
                            ! [ getCmdForMsg <| PageChange Routes.SignIn ]

                Err error ->
                    { model
                        | errorMessage = Just "Could not sign out."
                        , handlingRequest = False
                    }
                        ! [ getCmdForMsg <| PageChange Routes.SignIn ]

        NoOp ->
            model ! []


setLocation : Page -> Context -> Context
setLocation page context =
    { context | location = (Routes.getLocation page context.location) }


getPage : Model -> Page
getPage model =
    Routes.getPage model.context.location


getCollections : Cmd Msg
getCollections =
    let
        url =
            "/api/jangle/collections"

        request =
            Http.get url (responseDecoder collectionsDecoder)
    in
        Http.send CollectionsRetrieved request


attemptSignIn : String -> String -> Cmd Msg
attemptSignIn username password =
    let
        url =
            "/sign-in?username=" ++ username ++ "&password=" ++ password

        request =
            Http.post url Http.emptyBody userDecoder
    in
        Http.send SignInResponded request


attemptSignOut : Cmd Msg
attemptSignOut =
    let
        url =
            "/sign-out"

        request =
            Http.post url Http.emptyBody (responseDecoder userDecoder)
    in
        Http.send SignOutResponded request


responseDecoder : Json.Decoder a -> Json.Decoder (Response a)
responseDecoder decoder =
    Json.map3 Response
        (field "error" Json.bool)
        (field "message" Json.string)
        (field "data" (Json.list decoder))


collectionsDecoder : Json.Decoder Collection
collectionsDecoder =
    Json.map3 Collection
        (field "name" Json.string)
        (field "labels" labelsDecoder)
        (field "fields" (Json.list fieldDecoder))


labelsDecoder : Json.Decoder Label
labelsDecoder =
    Json.map2 Label
        (field "singular" Json.string)
        (field "plural" Json.string)


fieldDecoder : Json.Decoder Field
fieldDecoder =
    Json.map3 Field
        (field "name" Json.string)
        (field "labels" labelsDecoder)
        (field "type" (Json.map getFieldType Json.string))


getFieldType : String -> FieldType
getFieldType fieldTypeName =
    case fieldTypeName of
        "single-line" ->
            SingleLine

        "multi-line" ->
            MultiLine

        "whole-number" ->
            WholeNumber

        _ ->
            SingleLine


userDecoder : Json.Decoder User
userDecoder =
    Json.map3 User
        (field "name" nameDecoder)
        (field "username" string)
        (field "token" string)


nameDecoder : Json.Decoder Name
nameDecoder =
    Json.map2 Name
        (field "first" string)
        (field "last" string)


view : Model -> Html Msg
view model =
    div [ class "app" ]
        [ viewNavbar model
        , viewPage model
        ]


viewNavbar : Model -> Html Msg
viewNavbar model =
    case getPage model of
        Routes.SignIn ->
            emptyHtml

        _ ->
            nav [ class "nav has-shadow is-fixed" ]
                [ div [ class "container" ]
                    [ div [ class "nav-left" ]
                        [ div [ class "nav-item" ]
                            [ h3 [ class "subtitle is-3" ]
                                [ a [ onClick (PageChange Routes.Dashboard) ]
                                    [ text "Jangle" ]
                                ]
                            ]
                        ]
                    , div [ class "nav-right no-flex" ]
                        [ div [ class "nav-item" ]
                            [ a [ class "button", onClick (SignOutSubmit) ]
                                [ text "Sign out" ]
                            ]
                        ]
                    ]
                ]


viewUserMenu : Model -> Html Msg
viewUserMenu model =
    a [ onClick (NoOp) ]
        [ span [ class "icon is-margin-right" ]
            [ i [ class "fa fa-user-circle" ] [] ]
        , span [ class "" ]
            [ text <|
                Maybe.withDefault ""
                    (getFirstName model.context.user)
            ]
        , span [ class "icon" ]
            [ i [ class "fa fa-caret-down fa-small" ] [] ]
        , ul [ class "is-hidden" ]
            [ div [ class "nav-item" ]
                [ a [ onClick (SignOutSubmit) ]
                    [ text "Sign out" ]
                ]
            ]
        ]


getFirstName : Maybe User -> Maybe String
getFirstName user =
    user
        |> Maybe.map (.name)
        |> Maybe.map (.first)


viewPage : Model -> Html Msg
viewPage model =
    case getPage model of
        Routes.SignIn ->
            viewSignInPage model

        Routes.Dashboard ->
            viewDashboardPage model

        Routes.Collections ->
            viewCollectionsPage model

        Routes.Users ->
            viewUsersPage model

        Routes.NotFound ->
            viewNotFoundPage model


viewSignInPage : Model -> Html Msg
viewSignInPage model =
    div [ class "sign-in-page" ]
        [ div [ class "hero is-dark is-bold is-fullheight" ]
            [ div [ class "hero-body" ]
                [ div [ class "container is-flex justify-center" ]
                    [ viewSignInForm model
                    ]
                ]
            ]
        ]


viewSignInForm : Model -> Html Msg
viewSignInForm model =
    Html.form [ class "sign-in-form", onSubmit SignInSubmit ]
        [ h1 [ class "title is-1 has-text-centered" ] [ text "Jangle" ]
        , div [ class "box" ]
            [ div [ class "fields" ]
                [ bulmaField "Username"
                    "text"
                    UsernameUpdated
                    model.username
                , bulmaField "Password"
                    "password"
                    PasswordUpdated
                    model.password
                ]
            , buttonBar
                [ case model.errorMessage of
                    Just message ->
                        span
                            [ class "help is-danger is-padded-right" ]
                            [ text message ]

                    Nothing ->
                        emptyHtml
                , button
                    [ class (getSignInClasses model), onClick SignInSubmit ]
                    [ text "Sign in" ]
                ]
            ]
        ]


bulmaField : String -> String -> (String -> Msg) -> String -> Html Msg
bulmaField fieldLabel inputType msg value_ =
    div [ class "control" ]
        [ label [ class "label is-medium" ] [ text fieldLabel ]
        , p [ class "control" ]
            [ input
                [ class "input is-medium"
                , onInput msg
                , type_ inputType
                , value value_
                ]
                []
            ]
        ]


buttonBar : List (Html Msg) -> Html Msg
buttonBar children =
    div [ class "button-bar is-flex" ] children


getSignInClasses : Model -> String
getSignInClasses model =
    (if model.handlingRequest then
        "is-loading "
     else
        ""
    )
        ++ "button is-info is-medium"


viewDashboardPage : Model -> Html Msg
viewDashboardPage model =
    div [ class "dashboard-page" ]
        [ div [ class "hero is-fullheight is-info" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Dashboard" ]
                    , h2 [ class "subtitle is-3" ] [ text <| getGreeting model ]
                    , viewDashboardOptions model
                    ]
                ]
            ]
        ]


viewDashboardOptions : Model -> Html Msg
viewDashboardOptions model =
    div [ class "dashboard-options columns" ]
        [ viewDashboardOption "Collections"
            "fa-files-o"
            (Routes.Collections)
        , viewDashboardOption "Users"
            "fa-users"
            (Routes.Users)
        ]


viewDashboardOption : String -> String -> Routes.Page -> Html Msg
viewDashboardOption label_ iconClass url =
    div [ class "column is-half-tablet" ]
        [ a [ class "box section", onClick (PageChange url) ]
            [ i [ class <| "is-hidden-mobile title is-1 fa " ++ iconClass ] []
            , h3 [ class "title is-3" ] [ text label_ ]
            ]
        ]


getGreeting : Model -> String
getGreeting model =
    case model.context.user of
        Just user ->
            "Welcome home, " ++ user.name.first ++ "."

        Nothing ->
            "You sneaky, huh..."


viewNotFoundPage : Model -> Html Msg
viewNotFoundPage model =
    div [ class "not-found-page" ]
        [ div [ class "hero is-fullheight is-gray" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Page not found." ]
                    , h2 [ class "subtitle is-3" ]
                        [ text "Sorry about that!" ]
                    , button
                        [ class "button is-info is-medium"
                        , onClick (PageChange Routes.Dashboard)
                        ]
                        [ text "Go to dashboard" ]
                    ]
                ]
            ]
        ]


viewCollectionsPage : Model -> Html Msg
viewCollectionsPage model =
    div [ class "collections-page" ]
        [ div [ class (getCollectionHeroClasses model) ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container section" ]
                    [ h1 [ class "title is-1" ]
                        [ text "Collections." ]
                    , h2 [ class "subtitle is-3" ]
                        [ text (getCollectionsSubtitle model) ]
                    , viewCollectionsAction model
                    ]
                ]
            ]
        , viewCollectionsSection model
        ]


getCollectionHeroClasses : Model -> String
getCollectionHeroClasses model =
    "hero is-primary animate-height has-navbar "
        ++ (if model.gettingCollections then
                "is-fullheight"
            else
                "is-medium"
           )


getCollectionsSubtitle : Model -> String
getCollectionsSubtitle model =
    if model.gettingCollections then
        ""
    else if List.isEmpty model.collections then
        "Let's get started!"
    else
        "Manage your things."


viewCollectionsSection : Model -> Html Msg
viewCollectionsSection model =
    div [ class "container section is-fullwidth" ]
        (if model.gettingCollections then
            []
         else
            [ viewCollectionsList model
            ]
        )


viewCollectionsAction : Model -> Html Msg
viewCollectionsAction model =
    if model.gettingCollections then
        i [ class "title is-1 fa fa-spin fa-cog" ] []
    else if List.isEmpty model.collections then
        button [ class "button is-medium is-success", onClick (NoOp) ]
            [ text "Add a collection" ]
    else
        div [ class "column is-half is-offset-3" ]
            [ viewCollectionsSearch model ]


viewCollectionsSearch : Model -> Html Msg
viewCollectionsSearch model =
    p [ class "control has-icon has-icon-right" ]
        [ input
            [ class "input collections-filter is-medium"
            , type_ "search"
            , placeholder (getCollectionsSearchPlaceholder model)
            ]
            []
        , span [ class "icon is-small" ]
            [ i [ class "fa fa-search" ] [] ]
        ]


getCollectionsSearchPlaceholder : Model -> String
getCollectionsSearchPlaceholder model =
    (toString <| List.length model.collections)
        ++ " collection"
        ++ if List.length model.collections == 1 then
            ""
           else
            "s"


viewCollectionsList : Model -> Html Msg
viewCollectionsList model =
    div [ class "columns is-mobile is-multiline" ]
        (model.collections
            |> List.filter (filterCollection model)
            |> List.map viewCollection
        )


filterCollection : Model -> Collection -> Bool
filterCollection model collection =
    True


viewCollection : Collection -> Html Msg
viewCollection collection =
    div [ class "column is-full-mobile is-half-tablet is-one-third-desktop" ]
        [ a [ class "box content" ]
            [ h4 [ class "title is-3" ]
                [ text collection.labels.plural
                , span
                    [ class "subtitle is-5 tag is-medium is-margin-left" ]
                    [ text collection.name ]
                ]
            ]
        ]


viewUsersPage : Model -> Html Msg
viewUsersPage model =
    div [ class "users-page" ]
        [ div [ class "hero is-fullheight is-dark" ]
            [ div [ class "hero-body has-text-centered is-paddingless" ]
                [ div [ class "container is-fullheight justify-center" ]
                    [ h1 [ class "title is-1" ] [ text "Users." ]
                    , h2 [ class "subtitle is-3" ]
                        [ text "Coming soon!" ]
                    , button
                        [ class "button is-info is-medium"
                        , onClick (PageChange Routes.Dashboard)
                        ]
                        [ text "Go to dashboard" ]
                    ]
                ]
            ]
        ]


main : Program Flags Model Msg
main =
    Navigation.programWithFlags
        (\_ -> PageLoaded)
        { init = init
        , subscriptions = (\_ -> Sub.none)
        , update = update
        , view = view
        }
