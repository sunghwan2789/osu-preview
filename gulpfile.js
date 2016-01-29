var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano');

gulp.task('default', function() {
    return gulp.src('src/preview.html')
        .pipe(usemin({
            inlinejs: [ uglify() ],
            inlinecss: [ cssnano() ]
        }))
        .pipe(gulp.dest('dist/'));
});
