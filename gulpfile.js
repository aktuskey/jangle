const gulp = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')
const elm = require('gulp-elm')
const sass = require('gulp-sass')
const series = require('run-sequence')

const tsProject = ts.createProject('tsconfig.json')
const paths = {
  del: {
    folders: [ '_dist' ]
  },
  pug: {
    src: 'web/**/*.pug',
    dest: '_dist/public'
  },
  elm: {
    src: 'web/elm/**/*.elm',
    out: 'main.js',
    dest: '_dist/public'
  },
  css: {
    src: 'web/styles/**/*.scss',
    dest: '_dist/public'
  },
  typescript: {
    src: 'server/**/*.ts',
    dest: '_dist'
  }
}

// Typescript
gulp.task('typescript', () => gulp
  .src(paths.typescript.src)
  .pipe(tsProject())
  .js
  .pipe(gulp.dest(paths.typescript.dest))
)

gulp.task('typescript:watch', ['typescript'], () => {
  gulp.watch(paths.typescript.src, ['typescript'])
})

// Elm
gulp.task('elm:init', elm.init)

gulp.task('elm', ['elm:init'], () =>
  gulp.src(paths.elm.src)
    .pipe(elm.bundle(paths.elm.out, { debug: true }))
    .on('error', () => {})
    .pipe(gulp.dest(paths.elm.dest))
)

gulp.task('elm:watch', ['elm'], () =>
  gulp.watch(paths.elm.src, ['elm'])
)

// Pug
gulp.task('pug', () =>
  gulp.src(paths.pug.src)
    .pipe(gulp.dest(paths.pug.dest))
)

gulp.task('pug:watch', ['pug'], () =>
  gulp.watch(paths.pug.src, ['pug'])
)

// CSS
gulp.task('css', () =>
  gulp.src(paths.css.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.css.dest))
)

gulp.task('css:watch', ['css'], () =>
  gulp.watch(paths.css.src, ['css'])
)

gulp.task('clean', () => del(paths.del.folders))
gulp.task('build', ['elm', 'pug', 'css', 'typescript'])
gulp.task('watch', ['elm:watch', 'pug:watch', 'css:watch', 'typescript:watch'])

gulp.task('dev', (done) => series('clean', 'watch', done))
gulp.task('default', (done) => series('clean', 'build', done))
