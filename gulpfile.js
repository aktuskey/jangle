var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var del = require('del');

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

gulp.task('copy-html', function() {

    gulp.src(paths.html.in)
        .pipe(gulp.dest(paths.html.out));

});

gulp.task('bundle-css', function() {

  gulp.src(paths.css.main)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.css.out));

});

gulp.task('build', ['bundle-js', 'copy-html', 'bundle-css']);

gulp.task('watch', ['build'], function() {

    gulp.watch(paths.js.in, ['bundle-js']);
    gulp.watch(paths.html.in, ['copy-html']);
    gulp.watch(paths.css.in, ['bundle-css']);

});

gulp.task('default', ['build']);
