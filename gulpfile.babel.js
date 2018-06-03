/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import gulp from 'gulp';
import babel from 'gulp-babel';
import notify from 'gulp-notify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify';
import del from 'del';
import flow from 'gulp-flowtype';
import sass from 'gulp-sass';
import cleancss from 'gulp-clean-css';
import postcss from 'gulp-postcss';
import cssnext from 'postcss-cssnext';
import pug from 'gulp-pug';
import plumber from 'gulp-plumber';
import browserSync from 'browser-sync';

const paths = {
  allSrcJs: 'src/js/**/*.js',
  srcJs: 'src/js/applications/*.js',
  gulpFile: 'gulpfile.babel.js',
  allPug: 'src/pug/**/*.pug',
  pug: 'src/pug/pages/*.pug',
  html: 'dist',
  allSass: 'src/sass/**/*.scss',
  sass: 'src/sass/applications/*.scss',
  css: 'dist/css/',
  js: 'dist/js',
};

// コンパイルに失敗した時の挙動
// デスクトップ通知を送る
function handleError(err) {
  var args = Array.prototype.slice.call(arguments);
  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: err.message
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};

const plumberOption = {
  errorHandler(err) {
    var args = Array.prototype.slice.call(arguments);
    // Send error to notification center with gulp-notify
    notify.onError({
      title: "Compile Error",
      message: err.message
    }).apply(this, args);

    // Keep gulp from hanging on this task
    this.emit('end');
  },
};

// dist内のjsファイルを全削除
gulp.task('clean', () => del([
  paths.js,
]));

// buildタスク
gulp.task('build', ['clean', 'js', 'pug', 'sass']);

// pugのhtml化
gulp.task('pug', () =>
  gulp.src(paths.pug)
    .pipe(plumber(plumberOption))
    .on('error', handleError)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(paths.html)),
);

// sass（scss）のcss化
gulp.task('sass', () => {
  const processors = [
    cssnext(),
  ];
  gulp.src(paths.sass)
    .pipe(plumber(plumberOption))
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(cleancss())
    .pipe(gulp.dest(paths.css));
});

// jsの結合とminifyなど。
gulp.task('js', () => {
  var bundler = browserify('./src/js/applications/application.js', { debug: true });
  return bundler
    .bundle()
    .on('error', handleError)
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));
});

// 監視
gulp.task('watch', () => {
  const watchList = [
    paths.allSrcJs,
    paths.allSass,
    paths.allPug,
  ];
  // jsとsassとpugに変更があったら、buileとreloadを走らせる
  gulp.watch(watchList, ['build', 'reload']);
});

// yarn serverが実行された時に実行される。
gulp.task('default', ['watch', 'build']);

// $ yarn sever でこれが実行される。
// http://localhost:3000
gulp.task('server', ['default'], () => {
  const serverSetting = {
    server: {
      baseDir: './dist/',
      index: 'index.html',
    },
  };
  browserSync(serverSetting);
});

// ファイルの変更を探知するとブラウザリロード
gulp.task('reload', () =>
  browserSync.reload(),
);
