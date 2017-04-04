let gulp = require('gulp')
let watch = require('gulp-watch')
let elm = require('gulp-elm')
let nodemon = require('gulp-nodemon')

gulp.task('elm', function () {
  gulp
    .src('public/elm/Main.elm')
    .pipe(elm({ debug: true }))
    .on('error', console.error)
    .pipe(gulp.dest('public/'))
})

gulp.task('elm-watch', ['elm'], function () {
  watch('public/elm/*.elm', () => gulp.start('elm'))
})

gulp.task('node-watch', function () {
  nodemon({
    script: 'app.js',
    watch: ['api', 'config', 'models', 'utilities', 'app.js']
  })
})

gulp.task('build', ['elm'])
gulp.task('watch', ['elm-watch'])

gulp.task('dev', ['watch', 'node-watch'])
gulp.task('default', ['build'])
