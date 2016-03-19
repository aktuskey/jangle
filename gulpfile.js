var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');

var paths = {
    clean: './dist',
    js: {
        in: './src/app/**/*.js',
        out: './dist/static'
    },
    css: {
        in: './src/css/styles.css',
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

    browserify('./src/app/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(paths.js.out));

});

gulp.task('copy-html', function() {

    gulp.src(paths.html.in)
        .pipe(gulp.dest(paths.html.out));

});

gulp.task('copy-css', function() {

    gulp.src(paths.css.in)
        .pipe(gulp.dest(paths.css.out));

});

gulp.task('build', ['clean', 'bundle-js', 'copy-html', 'copy-css']);

gulp.task('watch', ['build'], function() {

    gulp.watch(paths.js.in, ['bundle-js']);
    gulp.watch(paths.html.in, ['copy-html']);
    gulp.watch(paths.css.in, ['copy-css']);

});

gulp.task('default', ['build']);
