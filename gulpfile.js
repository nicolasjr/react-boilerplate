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
  'template',
  'js',
  'css',
  'serve'
]);

gulp.task('set-dev-node-env', function() {
    return process.env.NODE_ENV = 'development';
});

gulp.task('set-prod-node-env', function() {
    return process.env.NODE_ENV = 'production';
});

gulp.task('serve', ['template', 'css', 'js', 'data'], function() {

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

gulp.task('js', ['create-js'], function() {
  return del.sync(['./temp/**']);
});

gulp.task('create-js', ['webpack'], function() {
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
  return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
    .pipe(babel({
      presets: [react, es2015]
    }))
    .pipe(gulp.dest('./temp'))
    .pipe(browserSync.stream());
});

gulp.task('eslint', function() {
  return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch('./src/**/**/*.html', ['template']);
  gulp.watch('./src/**/**/*.js*', ['js', 'eslint']);
  gulp.watch('./src/scss/**/*.scss', ['stylesheets']);
});

