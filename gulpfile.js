var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    strip = require('gulp-strip-comments');

gulp.task('default', function() {
    return gulp.src('src/preview.html')
        .pipe(usemin({
            inlinejs: [ uglify() ],
            inlinecss: [ cssnano() ]
        }))
        .pipe(strip())
        .pipe(gulp.dest('dist/'));
});
