module Views.Dashboard exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)


header : String -> String -> Html msg
header title subtitle =
    div [ class "dashboard__header" ]
        [ h1 [ class "dashboard__title" ] [ text title ]
        , h2 [ class "dashboard__subtitle" ] [ text subtitle ]
        ]
