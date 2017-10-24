module Views.Form exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


type FocusSetting
    = AutoFocus
    | NormalFocus


type alias InputConfig field =
    { label_ : String
    , type__ : String
    , value_ : String
    , placeholder_ : String
    , field : field
    , focusedField : Maybe field
    , focusSetting : FocusSetting
    }


type ButtonState
    = ButtonNormal
    | ButtonLoading
    | ButtonDisabled


type ButtonType msg
    = NormalButtonType msg
    | SubmitButtonType


type ButtonStyle
    = ButtonDefault
    | ButtonPrimary
    | ButtonDanger
    | ButtonSuccess


type alias ButtonConfig msg =
    { label_ : String
    , type__ : ButtonType msg
    , state : ButtonState
    , style_ : ButtonStyle
    }


type alias InputMsg field msg =
    field -> String -> msg


type alias SetFocusMsg field msg =
    field -> msg


type Form field msg
    = Form (InputMsg field msg) (SetFocusMsg field msg)


form : InputMsg field msg -> SetFocusMsg field msg -> Form field msg
form inputMsg setFocusMsg =
    Form inputMsg setFocusMsg


isFocused : field -> Maybe field -> Bool
isFocused field maybeField =
    maybeField == Just field


hasValue : List String -> Bool
hasValue =
    List.any (\str -> String.length str > 0)


input : Form field msg -> InputConfig field -> Html msg
input (Form inputMsg setFocusMsg) { label_, type__, value_, placeholder_, field, focusSetting, focusedField } =
    label
        [ class "form__label"
        , classList
            [ ( "form__label--focused"
              , isFocused field focusedField
              )
            ]
        ]
        [ span
            [ class "form__label-text"
            , classList
                [ ( "form__label-text--displaced"
                  , hasValue [ value_, placeholder_ ] || isFocused field focusedField
                  )
                ]
            ]
            [ text label_ ]
        , Html.input
            [ class "form__input"
            , type_ type__
            , value value_
            , placeholder placeholder_
            , onInput (inputMsg field)
            , onFocus (setFocusMsg field)
            , autofocus (focusSetting == AutoFocus)
            ]
            []
        ]


button : ButtonConfig msg -> Html msg
button { label_, type__, state, style_ } =
    Html.button
        ([ class "button form__button"
         , classList
            [ ( "button--loading", state == ButtonLoading )
            , ( "button--disabled", state == ButtonDisabled )
            , ( "button--primary", style_ == ButtonPrimary )
            , ( "button--danger", style_ == ButtonDanger )
            ]
         , attribute "data-content" label_
         ]
            ++ (case type__ of
                    NormalButtonType msg ->
                        [ type_ "button", onClick msg ]

                    SubmitButtonType ->
                        [ type_ "submit" ]
               )
            ++ (if state == ButtonDisabled then
                    [ attribute "disabled" "disabled" ]
                else
                    []
               )
        )
        [ text label_ ]
