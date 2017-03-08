let gulp = require('gulp'),
    elm = require('gulp-elm')

gulp.task('elm', function () {
  gulp.src('public/elm/*.elm')
    .pipe(elm())
    .pipe(gulp.dest('public/'));
})

gulp.task('elm-watch', ['elm'], function () {

    gulp.watch('public/elm/*.elm', ['elm'])

})

gulp.task('default', ['elm-watch'])
