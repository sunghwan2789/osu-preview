var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('public', function() {
    return gulp.src('src/*.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(usemin())
        .pipe(gulp.dest('dist/'));
});
gulp.task('debug', function() {
    return gulp.src('src/*.html')
        .pipe(usemin())
        .pipe(gulp.dest('dist/'));
});