var path    = require('path');
var _       = require('lodash');

var npmConfig = require('./package.json');

_.each(npmConfig.devDependencies, function (version, module) {
  var name = module == 'gulp-util' ? 'gutil' : module.replace('gulp-', '').replace('-', '');
  global[name] = require(module);
});

var dest = 'dist/';
var destAbsPath = path.resolve(dest);
var src = 'src/';

var includeBrowserSync = true;

if (_.contains(gutil.env._, 'build')) { 
  if (!gutil.env.production) gutil.env.production = true;
  includeBrowserSync = false;
}

var jadeLocals = { includeBrowserSync: includeBrowserSync, time: new Date().getTime() };

var scripts = [
  src + 'js/app.js',
  src + 'js/**/*.js',
];

gulp.task('clean', function () {
  // returning makes this synchronous
  return gulp.src(dest, { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('styles', function () {
  return gulp.src(src + 'scss/style.scss')
    .pipe(rubysass({
      style: gutil.env.production ? 'compressed' : 'nested',
    }))
    .pipe(autoprefixer('last 1 version'))
    .pipe(gutil.env.production ? rev() : gutil.noop())
    .pipe(gulp.dest(dest + 'css/'))
    .pipe(gutil.env.production ? inject(dest + 'index.html', {
      transform: function (filepath) {
        return '<link rel="stylesheet" href="' + filepath.replace(dest.substr(0,2) == '..' ? destAbsPath : dest, '') + '">';
      }
    }) : gutil.noop())
    .pipe(gutil.env.production ? gulp.dest(dest) : gutil.noop());
});

gulp.task('copy', function () {
  // apparently gulp ignores dotfiles with globs
  gulp.src(src + 'copy/**/*', { dot: true })
    .pipe(gulp.dest(dest));

  gulp.src(src + 'img/**/*.{png,svg,gif,jpg}')
    .pipe(gulp.dest(dest + 'img/'));
});

var jadeOpts = {
  locals: jadeLocals,
  pretty: !gutil.env.production
};

gulp.task('templates', function () {
  gulp.src([src + 'views/**/*.jade', src + '!views/include/**/*'])
    .pipe(jade(jadeOpts))
    .pipe(gulp.dest(dest + 'views/'));
});

gulp.task('scripts', ['index', 'bower'], function () {
  return gulp.src(scripts)
    .pipe(gutil.env.production ? ngmin() : gutil.noop())
    .pipe(gutil.env.production ? concat('script.js') : gutil.noop())
    .pipe(gutil.env.production ? uglify() : gutil.noop())
    .pipe(rev())
    .pipe(gulp.dest(dest + 'js/'))
    .pipe(inject(dest + 'index.html', {
      transform: function (filepath) {
        return '<script src="' + filepath.replace(dest.substr(0,2) == '..' ? destAbsPath : dest, '') + '"></script>';
      }
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('bower', ['index'], function () {
  wiredep({
    directory: 'bower_components',
    bowerJson: require('./bower.json'),
    src: [dest + 'index.html'],
    fileTypes: {
      html: {
        replace: {
          js: '<script src="/{{filePath}}"></script>'
        }
      }
    }
  });

  if (!gutil.env.production)
    return bowerfiles().pipe(gulp.dest(dest + 'bower_components/'));
    // return gulp.src('bower_components/**/*').pipe(gulp.dest(dest + 'bower_components/'));
});

gulp.task('usemin', ['bower', 'scripts'], function () {
  if (!gutil.env.production) return;

  gulp.src(dest + 'index.html')
    .pipe(usemin({
      jsmin: uglify()
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('index', function () {
  // returning makes task synchronous 
  // if something else depends on it
  return gulp.src(src + 'index.jade')
    .pipe(jade(jadeOpts))
    .pipe(gulp.dest(dest));
});

gulp.task('build', ['copy', 'styles', 'templates', 'scripts', 'bower', 'usemin']);

gulp.task('default', ['build'], function () {
  gulp.watch(src + 'scss/**/*.scss', ['styles']);
  gulp.watch(src + 'js/**/*.js', ['scripts']);
  gulp.watch(src + 'views/**/*.jade', ['templates']);
  gulp.watch([
    src + 'copy/**/*', 
    src + 'img/**/*.{png,svg,gif,jpg}'
  ], { dot: true }, ['copy']);

  gulp.watch(src + 'index.jade', ['index', 'scripts', 'bower', 'usemin']);

  var bs = browsersync.init([dest + 'css/style.css', dest + '**/*.*']);
  
  // bs.on("file:changed", function (path) {
  //   notify('File Changed ' + path);
  // });
});
