var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

gulp.task('default', function() {
    return gulp.src('src/preview.html')
        .pipe(usemin({
            inlinejs: [ uglify() ],
            inlinecss: [ minifyCss() ]
        }))
        .pipe(gulp.dest('dist/'));
});