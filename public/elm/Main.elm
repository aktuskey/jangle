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
import String.Extra exposing (dasherize, decapitalize, humanize)


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
    | UpdateSingularName String
    | UpdatePluralName String
    | EditingPluralName Bool
    | RemoveFieldFromNewCollection Field
    | OpenAddFieldModal
    | CloseAddFieldModal
    | AddField
    | EditField Field
    | UpdateFieldLabel String
    | UpdateFieldType String


type alias Model =
    { context : Context
    , username : String
    , password : String
    , errorMessage : Maybe String
    , handlingRequest : Bool
    , gettingCollections : Bool
    , collections : List Collection
    , collectionFilter : String
    , newCollection : Collection
    , newField : Field
    , editingPluralName : Bool
    , showAddFieldModal : Bool
    , nameOfFieldBeingEdited : String
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
        initCollection
        initField
        False
        False
        ""
        ! [ getCmdForMsg PageLoaded ]


initCollection : Collection
initCollection =
    Collection
        ""
        (Label "" "")
        [ Field "name" "Name" SingleLine
        , Field "age" "Age" WholeNumber
        ]


initField : Field
initField =
    Field
        ""
        ""
        SingleLine


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

        UpdateSingularName name ->
            let
                collection =
                    model.newCollection

                labels =
                    model.newCollection.labels
            in
                { model
                    | newCollection =
                        { collection
                            | labels =
                                { labels
                                    | singular = name
                                }
                        }
                }
                    ! []

        UpdatePluralName name ->
            let
                collection =
                    model.newCollection

                labels =
                    model.newCollection.labels
            in
                { model
                    | newCollection =
                        { collection
                            | labels =
                                { labels
                                    | plural = name
                                }
                        }
                }
                    ! []

        EditingPluralName value ->
            { model | editingPluralName = value } ! []

        RemoveFieldFromNewCollection field ->
            let
                collection =
                    model.newCollection

                fields =
                    collection.fields
            in
                { model | newCollection = { collection | fields = (List.filter (\f -> f /= field) fields) } } ! []

        AddField ->
            let
                collection =
                    model.newCollection

                fields =
                    (List.filter
                        (\field -> field.name /= model.nameOfFieldBeingEdited)
                        collection.fields
                    )
                        ++ [ model.newField ]
            in
                { model
                    | newCollection = { collection | fields = fields }
                    , showAddFieldModal = False
                    , nameOfFieldBeingEdited = ""
                }
                    ! []

        OpenAddFieldModal ->
            { model | showAddFieldModal = True } ! []

        CloseAddFieldModal ->
            { model
                | showAddFieldModal = False
                , newField = initField
                , nameOfFieldBeingEdited = ""
            }
                ! []

        EditField field ->
            { model
                | showAddFieldModal = True
                , newField = field
                , nameOfFieldBeingEdited = field.name
            }
                ! []

        UpdateFieldLabel label ->
            let
                field =
                    model.newField
            in
                { model
                    | newField =
                        { field
                            | label = label
                            , name = label |> decapitalize |> dasherize
                        }
                }
                    ! []

        UpdateFieldType fieldName ->
            let
                fieldType =
                    toFieldType fieldName

                field =
                    model.newField
            in
                { model
                    | newField =
                        { field
                            | type_ = fieldType
                        }
                }
                    ! []

        NoOp ->
            model ! []


setLocation : Page -> Context -> Context
setLocation page context =
    let
        newLocation =
            Debug.log "New Location" (Routes.getLocation page context.location)
    in
        { context | location = newLocation }


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
        (field "label" Json.string)
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

        Routes.AddCollection collection ->
            viewAddCollectionPage model

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
        [ div [ class "hero is-fullheight" ]
            [ div [ class "hero-body" ]
                [ div [ class "container" ]
                    [ h1 [ class "title is-1" ]
                        [ text "Collections." ]
                    , viewAddCollectionButton model
                    ]
                ]
            ]
        ]


viewAddCollectionButton : Model -> Html Msg
viewAddCollectionButton model =
    button
        [ class "button is-medium is-success"
        , onClick <| PageChange <| Routes.AddCollection "add"
        ]
        [ text "Create a collection" ]


viewAddCollectionPage : Model -> Html Msg
viewAddCollectionPage model =
    div [ class "add-collection-page" ]
        [ div [ class "hero is-fullheight has-navbar" ]
            [ div [ class "hero-head" ]
                [ div [ class "container" ]
                    [ viewCollectionForm model
                    ]
                ]
            ]
        ]



-- /api/jangle/collections?where={"name":<name>}&select


viewCollectionForm : Model -> Html Msg
viewCollectionForm model =
    Html.form
        [ class "add-collection-form form", onSubmit NoOp ]
        [ h1 [ class "title is-1" ]
            [ text "New Collection." ]
        , hr [] []
        , h3 [ class "subtitle is-3" ] [ text "Name" ]
        , div [ class "field" ]
            [ label [ class "label" ] [ text "Singular" ]
            , p [ class "control" ]
                [ input
                    [ onInput UpdateSingularName
                    , type_ "text"
                    , class "input"
                    , value model.newCollection.labels.singular
                    ]
                    []
                ]
            ]
        , showPluralInput model
        , br [] []
        , h3 [ class "subtitle is-3" ] [ text "Fields" ]
        , viewFieldSelector model
        , viewAddFieldModal model
        ]


showPluralInput : Model -> Html Msg
showPluralInput model =
    let
        labels =
            model.newCollection.labels

        defaultPlural =
            getPluralForm labels.singular
    in
        if model.editingPluralName then
            div [ class "field" ]
                [ label [ class "label" ] [ text "Plural" ]
                , div [ class "field has-addons" ]
                    [ p [ class "control", style [ ( "flex", "1" ) ] ]
                        [ input
                            [ onInput UpdatePluralName
                            , type_ "text"
                            , class "input"
                            , placeholder defaultPlural
                            , value labels.plural
                            ]
                            []
                        ]
                    , p [ class "control" ]
                        [ button
                            [ class "button", onClick (EditingPluralName False) ]
                            [ i [ class "fa fa-check" ] [] ]
                        ]
                    ]
                ]
        else if String.length labels.singular /= 0 then
            p [ class "control" ]
                [ button
                    [ class "button is-link"
                    , onClick (EditingPluralName True)
                    ]
                    [ text <| "Plural: " ++ getPluralToSave labels
                    ]
                ]
        else
            emptyHtml


getPluralForm : String -> String
getPluralForm singular =
    if String.length singular /= 0 then
        singular ++ "s"
    else
        ""


getPluralToSave : Label -> String
getPluralToSave labels =
    let
        defaultPlural =
            getPluralForm labels.singular
    in
        if String.length labels.plural == 0 then
            defaultPlural
        else
            labels.plural


viewFieldSelector : Model -> Html Msg
viewFieldSelector model =
    div [ class "fields-selector" ]
        [ viewFields model.newCollection.fields
        , div [ class "field" ]
            [ button
                [ class "button is-medium is-light"
                , onClick OpenAddFieldModal
                ]
                [ text "Add a field" ]
            ]
        ]


viewAddFieldModal : Model -> Html Msg
viewAddFieldModal model =
    if model.showAddFieldModal then
        viewModal
            (Html.form [ class "section", onSubmit NoOp ]
                [ h3 [ class "subtitle is-3" ] [ text "Add field." ]
                , hr [] []
                , div [ class "field" ]
                    [ label [ class "label" ] [ text "Name" ]
                    , p [ class "control" ]
                        [ input
                            [ onInput UpdateFieldLabel
                            , type_ "text"
                            , class "input"
                            , value model.newField.label
                            ]
                            []
                        ]
                    ]
                , div [ class "field" ]
                    [ label [ class "label" ] [ text "Type" ]
                    , p [ class "control" ]
                        [ span [ class "select" ]
                            [ select
                                [ onInput (UpdateFieldType)
                                ]
                                (List.map (viewTypeOption model.newField.type_) typeOptions)
                            ]
                        ]
                    ]
                , buttonBar
                    [ button
                        [ class "button is-medium is-success"
                        , onClick AddField
                        ]
                        [ text "Add field" ]
                    ]
                ]
            )
    else
        emptyHtml


viewTypeOption : FieldType -> ( FieldType, String ) -> Html Msg
viewTypeOption activeFieldType ( fieldType, fieldName ) =
    let
        text_ =
            (fieldType |> toString |> humanize)

        value_ =
            toSelectValue fieldType
    in
        option
            ([ value value_ ]
                ++ if fieldType == activeFieldType then
                    [ attribute "selected" "selected" ]
                   else
                    []
            )
            [ text text_ ]


toSelectValue : FieldType -> String
toSelectValue fieldType =
    (fieldType |> toString |> decapitalize |> dasherize)


toFieldType : String -> FieldType
toFieldType fieldName =
    case List.head (List.filter (\( a, b ) -> b == fieldName) typeOptions) of
        Just ( a, b ) ->
            a

        Nothing ->
            SingleLine


typeOptions : List ( FieldType, String )
typeOptions =
    [ ( SingleLine, "single-line" )
    , ( MultiLine, "multi-line" )
    , ( WholeNumber, "whole-number" )
    ]


viewModal : Html Msg -> Html Msg
viewModal content =
    div [ class "modal is-active" ]
        [ div [ class "modal-background", onClick CloseAddFieldModal ] []
        , div [ class "modal-content" ] [ content ]
        , button [ class "modal-close", onClick CloseAddFieldModal ] []
        ]


viewFields : List Field -> Html Msg
viewFields fields =
    if List.length fields /= 0 then
        table [ class "table" ]
            [ thead []
                [ tr []
                    (List.map (\header -> th [] [ text header ]) [ "Name", "Type", "" ])
                ]
            , tbody [] (List.map viewField fields)
            ]
    else
        emptyHtml


viewField : Field -> Html Msg
viewField field =
    tr []
        [ td [] [ text field.label ]
        , td [] [ text (toString field.type_ |> humanize) ]
        , td [ style [ ( "text-align", "right" ) ] ]
            [ a [ onClick <| EditField field ]
                [ i [ class "fa fa-edit" ] [] ]
            , a [ onClick <| RemoveFieldFromNewCollection field ]
                [ i [ class "fa fa-close", style [ ( "margin-left", "4px" ), ( "margin-top", "-1px" ) ] ] [] ]
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
