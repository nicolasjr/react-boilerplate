const gulp = require('gulp');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
const webpack = require('gulp-webpack');
const browserSync = require('browser-sync');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const historyApiFallback = require('connect-history-api-fallback');

gulp.task('default', ['serve']);

gulp.task('build', [
  'clean',
  'images',
  'data',
  'vendors',
  'template',
  'js',
  'css',
]);

gulp.task('build:release', ['set-prod-node-env', 'build'], () => gulp.src('./.htaccess')
  .pipe(gulp.dest('./dist'))
);

gulp.task('set-dev-node-env', () => {
  process.env.NODE_ENV = 'development';
});

gulp.task('set-prod-node-env', () => {
  process.env.NODE_ENV = 'production';
});

gulp.task('serve', ['build'], () => {
  browserSync.init({
    server: './dist',
    middleware: [historyApiFallback()],
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

gulp.task('vendors', () => gulp.src('./src/vendors/**/*')
  .pipe(gulp.dest('./dist/public/vendors'))
);

gulp.task('images', () => gulp.src('./src/assets/**/*')
  .pipe(gulp.dest('./dist/public/assets'))
);

gulp.task('css', ['minify-css'], () => del.sync(['./temp-css/**']));

gulp.task('minify-css', ['stylesheets'], () => gulp.src('./temp-css/*.css')
  .pipe(cleanCSS({ debug: true }))
  .pipe(gulp.dest('./dist/public/stylesheet'))
);

gulp.task('stylesheets', () => gulp.src('./src/scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./temp-css'))
  .pipe(browserSync.stream())
);

gulp.task('template', () => gulp.src('./src/**/*.html')
  .pipe(gulp.dest('./dist'))
  .pipe(browserSync.stream())
);

gulp.task('clean', () => del.sync(['./dist/**']));

gulp.task('data', () => gulp.src('./src/**/*.json')
  .pipe(gulp.dest('./dist'))
);

gulp.task('js', () => {
  const webpackConfig = require('./webpack.config.js');
  return webpack(webpackConfig)
    .pipe(gulp.dest('./dist/public/js'));
});

gulp.task('eslint', () => gulp.src(['./src/**/*.js', './src/**/*.jsx'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
);

gulp.task('watch', () => {
  gulp.watch('./src/**/**/*.html', ['template']);
  gulp.watch('./src/**/**/*.js*', ['js', 'eslint']);
  gulp.watch('./src/scss/**/*.scss', ['stylesheets']);
});
