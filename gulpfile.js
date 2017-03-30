let gulp = require('gulp')
let elm = require('gulp-elm')

gulp.task('elm', function () {
  gulp.src('public/elm/Main.elm')
    .pipe(elm({
      debug: true
    }))
    .on('error', console.error)
    .pipe(gulp.dest('public/'))
})

gulp.task('elm-watch', ['elm'], function () {
  gulp.watch('public/elm/*.elm', ['elm'])
})

gulp.task('default', ['elm-watch'])
