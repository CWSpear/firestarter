var gulp   = require('gulp');
var gutil  = require('gulp-util');
var sass   = require('gulp-ruby-sass');
var prefix = require('gulp-autoprefixer');
var jade   = require('gulp-jade');
var clean  = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rev    = require('gulp-rev');
var inject = require('gulp-inject');
var ngmin  = require('gulp-ngmin');
var bower  = require('gulp-bower-files');
var usemin = require('gulp-usemin');

var sync    = require('browser-sync');
var wiredep = require('wiredep');
var path    = require('path');
var _       = require('lodash');

var dist = '../dist/';
var distAbsPath = path.resolve(dist);

var includeBrowserSync = true;

if (_.contains(gutil.env._, 'build')) { 
  if (!gutil.env.production) gutil.env.production = true;
  includeBrowserSync = false;
}

var jadeLocals = { includeBrowserSync: includeBrowserSync, time: new Date().getTime() };

var scripts = [
  'js/app.js',
  'js/**/*.js',
];

gulp.task('clean', function () {
  // returning makes this synchronous
  return gulp.src(dist, { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('styles', function () {
  return gulp.src('scss/style.scss')
    .pipe(sass({
      style: gutil.env.production ? 'compressed' : 'nested',
    }))
    .pipe(prefix('last 1 version'))
    .pipe(gutil.env.production ? rev() : gutil.noop())
    .pipe(gulp.dest(dist + 'css/'))
    .pipe(gutil.env.production ? inject(dist + 'index.html', {
      transform: function (filepath) {
        return '<link rel="stylesheet" href="' + filepath.replace(distAbsPath, '') + '">';
      }
    }) : gutil.noop())
    .pipe(gutil.env.production ? gulp.dest(dist) : gutil.noop());
});

gulp.task('copy', function () {
  // apparently gulp ignores dotfiles with globs
  gulp.src('copy/**/*', { dot: true })
    .pipe(gulp.dest(dist));

  gulp.src('img/**/*.{png,svg,gif,jpg}')
    .pipe(gulp.dest(dist + 'img/'));
});

var jadeOpts = {
  locals: jadeLocals,
  pretty: !gutil.env.production
};

gulp.task('templates', function () {
  gulp.src(['views/**/*.jade', '!views/include/**/*'])
    .pipe(jade(jadeOpts))
    .pipe(gulp.dest(dist + 'views/'));
});

gulp.task('scripts', ['index', 'bower'], function () {
  return gulp.src(scripts)
    .pipe(gutil.env.production ? ngmin() : gutil.noop())
    .pipe(gutil.env.production ? concat('script.js') : gutil.noop())
    .pipe(gutil.env.production ? uglify() : gutil.noop())
    .pipe(rev())
    .pipe(gulp.dest(dist + 'js/'))
    .pipe(inject(dist + 'index.html', {
      transform: function (filepath) {
        return '<script src="' + filepath.replace(distAbsPath, '') + '"></script>';
      }
    }))
    .pipe(gulp.dest(dist));
});

gulp.task('bower', ['index'], function () {
  wiredep({
    directory: 'bower_components',
    bowerJson: require('./bower.json'),
    src: [dist + 'index.html'],
    fileTypes: {
      html: {
        replace: {
          js: '<script src="/{{filePath}}"></script>'
        }
      }
    }
  });

  if (!gutil.env.production)
    return bower().pipe(gulp.dest(dist + 'bower_components/'));
});

gulp.task('usemin', ['bower', 'scripts'], function () {
  if (gutil.env.production) {
    gulp.src(dist + 'index.html')
      .pipe(usemin({
        jsmin: uglify()
      }))
      .pipe(gulp.dest(dist));
  }
});

gulp.task('index', function () {
  // returning makes task synchronous 
  // if something else depends on it
  return gulp.src('index.jade')
    .pipe(jade(jadeOpts))
    .pipe(gulp.dest(dist));
});

gulp.task('build', ['copy', 'styles', 'templates', 'scripts', 'bower', 'usemin']);

gulp.task('default', ['build'], function () {
  gulp.watch('scss/**/*.scss', ['styles']);
  gulp.watch('js/**/*.js', ['scripts']);
  gulp.watch('views/**/*.jade', ['templates']);
  gulp.watch([
    'copy/**/*', 
    'img/**/*.{png,svg,gif,jpg}'
  ], { dot: true }, ['copy']);

  gulp.watch('index.jade', ['index', 'scripts', 'bower', 'usemin']);

  var bs = sync.init([dist + 'css/style.css', dist + '**/*.*']);
  
  // bs.on("file:changed", function (path) {
  //   notify('File Changed ' + path);
  // });
});
