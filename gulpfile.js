var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var del = require('del');
var Server = require('karma').Server;
var protractor = require("gulp-protractor").protractor;

var paths = {
    clean: './dist',
    js: {
        in: './src/app/**/*.js',
        out: './dist/static'
    },
    css: {
        main: './src/sass/styles.scss',
        in: './src/sass/**/*.scss',
        out: './dist/static'
    },
    img: {
        in: './src/img/**/*',
        out: './dist/static/img'
    },
    html: {
        in: './src/**/*.html',
        out: './dist'
    }
}
gulp.task('clean', function(){
    del([paths.clean]);
});

gulp.task('bundle-js', function(){

    browserify('./src/app/app.js', {
        paths: ['./node_modules', './src/app']
    })
        .bundle()
        .on('error', function (err) {
            console.log(err.toString());
            this.emit("end");
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(paths.js.out));

});


gulp.task('copy-img', function() {

    gulp.src(paths.img.in)
        .pipe(gulp.dest(paths.img.out));

});

gulp.task('copy-html', function() {

    gulp.src(paths.html.in)
        .pipe(gulp.dest(paths.html.out));

});

gulp.task('bundle-css', function() {

  gulp.src(paths.css.main)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.css.out));

});

gulp.task('build', ['bundle-js', 'copy-html', 'bundle-css', 'copy-img']);

gulp.task('watch', ['build'], function() {

    gulp.watch(paths.js.in, ['bundle-js']);
    gulp.watch(paths.css.in, ['bundle-css']);
    gulp.watch(paths.img.in, ['copy-img']);
    gulp.watch(paths.html.in, ['copy-html']);

});

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('test-watch', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

gulp.task('e2e', function(){
    gulp.src(["./src/tests/**/*.js"])
        .pipe(protractor({
            configFile: "./protractor.conf.js",
            args: ['--baseUrl', 'http://127.0.0.1:8000']
        }))
        .on('error', function(e) { throw e })
})

gulp.task('default', ['build']);
