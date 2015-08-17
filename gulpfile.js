/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    htmlreplace = require('gulp-html-replace'),
    del = require('del');

// Styles
gulp.task('styles', function () {
    return gulp.src('css/style.css')
        //.pipe(sass({style: 'expanded'}))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        //.pipe(gulp.dest('dist/scss'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({message: 'Styles task complete'}));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['js/*.js'])
        //.pipe(jshint('.jshintrc'))
        //.pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        //.pipe(gulp.dest('dist/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({message: 'Scripts task complete'}));
});

// Images
gulp.task('images', function () {
    return gulp.src('img/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({message: 'Images task complete'}));
});

// Copy fonts from a module outside of our project (like Bower)
gulp.task('copyfiles', function () {
    
    gulp.src('templates/**/*')
        .pipe(gulp.dest('dist/templates'));

    gulp.src('config/**/*.csv')
        .pipe(gulp.dest('dist/config'));

    //gulp.src('css/**/*.*')
    //    .pipe(gulp.dest('dist/css'));

    gulp.src('img/**/*.*')
        .pipe(gulp.dest('dist/img'));

    gulp.src('lib/**/*.*')
        .pipe(gulp.dest('dist/lib'));


});

gulp.task('indexhtml', function () {
    gulp.src('index.html')
        .pipe(htmlreplace({
            'javascripts': 'js/main.min.js',
            'styles' : 'css/style.min.css'
        }))
        .pipe(gulp.dest('dist/'));

    /*
    gulp.src('index.html')
        .pipe(htmlreplace({
            'css': 'styles/site-svcc-relative.css',
            'js': ['https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular.js',
                'main.js']
        }))
        .pipe(rename('index-nomin.html'))
        .pipe(gulp.dest('dist/'));
    */
});


// Clean
gulp.task('clean', function (cb) {
    //del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img','Content/Sass/.sass-cache'], cb);
});

// Default task
//gulp.task('default', ['clean'], function () {
    //gulp.start('styles', 'scripts', 'images','copyfiles','indexhtml');
    gulp.start('scripts', 'styles' ,'copyfiles', 'indexhtml');
//});

gulp.task('default', ['scripts'])

// Watch
gulp.task('watch', function () {

    // Watch .scss files
    //gulp.watch('src/styles/**/*.scss', ['styles']);

    // Watch .js files
    //gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    //gulp.watch('src/images/**/*', ['images']);

    // Create LiveReload server
    //livereload.listen();

    // Watch any files in dist/, reload on change
    //gulp.watch(['dist/**']).on('change', livereload.changed);

});