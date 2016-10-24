var gulp = require('gulp');
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var webpack = require('gulp-webpack');
var browserSync = require('browser-sync');
var del = require('del');
var es2015 = require('babel-preset-es2015');
var react = require('babel-preset-react');
var cleanCSS = require('gulp-clean-css');

gulp.task('default', ['build']);

gulp.task('build', [
  'clean',
  'images',
  'data',
  'vendors',
  'libs',
  'template',
  'js',
  'css',
  'serve'
]);

gulp.task('serve', ['template', 'css', 'js'], function() {

  browserSync.init({
      server: './dist'
  });

  gulp.watch('./src/**/*.js*', ['js']);
  gulp.watch('./src/scss/**/*.scss', ['css']);
  gulp.watch('./src/**/*.html', ['template']);
  gulp.watch('./src/data/*', ['data']);

  gulp.watch('dist/public/*.html').on('change', browserSync.reload);
  gulp.watch('dist/public/js/*.js').on('change', browserSync.reload);
  gulp.watch('dist/public/stylesheet/*.css').on('change', browserSync.reload);
  gulp.watch('dist/data/**').on('change', browserSync.reload);
});

gulp.task('libs', function(){
  return gulp.src([
    'node_modules/systemjs/dist/system.js',
    'node_modules/babel-polyfill/dist/polyfill.js',
    'node_modules/react/dist/react.min.js',
    'node_modules/react-dom/dist/react-dom.min.js'])
    .pipe(gulp.dest('./dist/public/vendors'));
});

gulp.task('vendors', function() {
  return gulp.src('./src/vendors/**/*')
    pipe(gulp.dest('./dist/public/vendors'));
});

gulp.task('images', function() {
  return gulp.src('./src/assets/**/*')
    .pipe(gulp.dest('./dist/public/assets'));
});

gulp.task('css', ['minify-css'], function() {
  return del.sync(['./temp-css/**']);
});

gulp.task('minify-css', ['stylesheets'], function() {
  return gulp.src('./temp-css/*.css')
    .pipe(cleanCSS({debug: true}, function(details) {
      console.log(details.name + ': ' + details.stats.originalSize);
      console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(gulp.dest('./dist/public/stylesheet'));
});

gulp.task('stylesheets', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./temp-css'))
    .pipe(browserSync.stream());
});

gulp.task('template', function() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('clean', function() {
  return del.sync(['./dist/**']);
});

gulp.task('data', function() {
  return gulp.src('./src/**/*.json')
    .pipe(gulp.dest('./dist'))
});

gulp.task('js', ['rename-webpack'], function() {
  return del.sync(['./temp/**']);
});

gulp.task('rename-webpack', ['webpack'], function() {
  return gulp.src(['./temp/webpack/*'])
    .pipe(rename(function(path) {
      path.basename = 'all.min';
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/public/js'))
    .pipe(browserSync.stream());
});

gulp.task('webpack', ['babel'], function() {
  return gulp.src(['./temp/**/*.js'])
    .pipe(webpack())
    .pipe(gulp.dest('./temp/webpack'))
});

gulp.task('babel', function() {
  return gulp.src('./src/*.js*')
    .pipe(babel({
      presets: [react, es2015]
    }))
    .pipe(gulp.dest('./temp'))
    .pipe(browserSync.stream());
});

gulp.task('eslint', function() {
  return gulp.src(['./src/*.js*'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.html', ['template']);
  gulp.watch('./src/**/*.js*', ['js']);
  gulp.watch('./src/scss/**/*.scss', ['stylesheets']);
  gulp.watch('./src/**/*.js*', ['eslint']);
});

