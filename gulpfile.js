var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('usemin', function() {
    return gulp.src('src/*.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(gulp.dest('dist/'));
});
gulp.task('default', ['usemin']);