/* jscs:disable disallowTrailingComma */
var path = require('path');

var gulp  = require('gulp');
var gutil = require('gulp-util');
var chalk = require('chalk');

var _ = require('lodash');

//////////////////
// start config //
//////////////////

var moduleName = '<% ngApp %>';

var assetsDir = '';
var dest = 'dist/' + (assetsDir ? assetsDir + '/' : '');
var src = 'src/';

var destAbsPath = path.resolve(dest);

var npmConfig = require('./package.json');
var includeBrowserSync = true;
var browserSyncPort = 3233;

if (_.contains(gutil.env._, 'build')) {
    if (!gutil.env.production) gutil.env.production = true;
    includeBrowserSync = false;
}

var scripts = [
    src + 'js/app.js',
    src + 'js/**/*.js',
];

////////////////
// end config //
////////////////

var injectables = {};

var $ = _.object(_.map(npmConfig.devDependencies, function (version, module) {
    var name = module === 'gulp-util' ? 'gutil' : module.replace('gulp-', '').replace(/-/g, '');
    return [name, require(module)];
}));

var plumberError = function (err) {
    gutil.beep();
    console.error(err.message, err);
};

gulp.task('styles', function () {
    injectables.styles = [];

    return gulp.src(src + 'scss/style.scss')
        .pipe($.plumber(function (error) {
            plumberError(error);
            this.emit('end');
        }))
        .pipe($.sass({
            style: gutil.env.production ? 'compressed' : 'nested',
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gutil.env.production && $.wiredep().css && $.wiredep().css.length ? gulp.src($.wiredep().css) : gutil.noop())
        .pipe(gutil.env.production ? $.concat('styles.css') : gutil.noop())
        .pipe(gutil.env.production ? $.rev() : gutil.noop())
        .pipe(gulp.dest(dest + 'css/'))
        .pipe($.tap(function (file) {
            // keep track of things to inject (only on production)
            if (gutil.env.production) injectables.styles.push(file.path);
        }))
        .pipe($.browsersync.reload({ stream: true }));
});

gulp.task('copy', function () {
    // apparently gulp ignores dotfiles with globs
    gulp.src(src + 'copy/**/*', { dot: true })
        .pipe(gulp.dest(dest));

    gulp.src(src + 'img/**/*.{png,svg,gif,jpg}')
        .pipe(gulp.dest(dest + 'img/'))
        .pipe($.browsersync.reload({ stream: true }));
});

gulp.task('templates', function () {
    gulp.src([src + 'views/**/*.html', '!' + src + 'views/partials/**/*'])
        .pipe($.changed(dest + 'views/'))
        .pipe(gulp.dest(dest + 'views/'))
        .pipe($.browsersync.reload({ stream: true }));
});

gulp.task('scripts', function () {
    injectables.scripts = [];

    return gulp.src(_.union($.wiredep().js, scripts))
        .pipe($.plumber(plumberError))
        .pipe(gutil.env.production ? $.ngannotate() : gutil.noop())
        .pipe(gutil.env.production ? $.concat('script.js') : gutil.noop())
        .pipe(gutil.env.production ? $.uglify() : gutil.noop())
        .pipe($.rev())
        .pipe(gulp.dest(dest + 'js/'))
        .pipe($.tap(function (file) {
            // keep track of files to inject
            injectables.scripts.push(file.path);
        }));
});

var indexDeps = ['scripts'];
if (gutil.env.production) indexDeps.push('styles');
gulp.task('index', indexDeps, function () {
    // returning makes task synchronous
    // if something else depends on it
    return gulp.src(src + 'index.html')
        .pipe($.replace('<!-- browser-sync -->',
            '<script>angular.module(\'' + moduleName + '\').constant(\'debug\', ' + !gutil.env.production + ');<' + '/script>' +
            '<script>angular.module(\'' + moduleName + '\').constant(\'browserSyncPort\', ' + browserSyncPort + ');<' + '/script>'
        ))
        .pipe($.inject(gulp.src(_.flatten(_.values(injectables)), { read: false }), {
            transform: function (filepath) {
                if (path.extname(filepath) === '.css') {
                    return '<link rel="stylesheet" href="' + assetsDir + '' + filepath.replace(dest.substr(0, 2) === '..' ? destAbsPath : dest, '') + '">';
                }

                if (path.extname(filepath) === '.js') {
                    return '<script src="' + assetsDir + '/' + filepath.replace(dest.substr(0, 2) === '..' ? destAbsPath : dest, '').replace(/^\//, '') + '"></script>';
                }

                // default
                return $.inject.transform.apply($.inject.transform, arguments);
            }
        }))
        .pipe(gulp.dest(dest))
        .pipe($.browsersync.reload({ stream: true }));
});

var prereqs = function () {
    var rimrafDeferred = $.q.defer();

    $.rimraf(dest, function (er) {
        if (er) throw er;
        rimrafDeferred.resolve();
        gutil.log('rimraf\'d', gutil.colors.magenta(dest));
    });

    if (!gutil.env.install) {
        return rimrafDeferred.promise;
    }

    var bowerDeferred = $.q.defer();
    var npmDeferred = $.q.defer();

    $.bower.commands.install().on('end', function () {
        bowerDeferred.resolve();
        gutil.log(gutil.colors.cyan('bower install'), 'finished');
    });

    $.npm.load(npmConfig, function () {
        $.npm.commands.install([], function () {
            gutil.log(gutil.colors.cyan('npm install'), 'finished');
            npmDeferred.resolve();
        });
    });

    return $.q.all([
        rimrafDeferred.promise,
        bowerDeferred.promise,
        npmDeferred.promise
    ]);
};

gulp.task('build', function () {
    prereqs().then(function () {
        gulp.start('run');
    });
});

var setUpServer = function () {
    var port = !gutil.env.serve || gutil.env.serve === true ? 1337 : gutil.env.serve;

    var server = $.express();

    // serve static resources from here
    server.use('/js', $.express.static(__dirname + '/dist/js'));
    server.use('/img', $.express.static(__dirname + '/dist/img'));
    server.use('/css', $.express.static(__dirname + '/dist/css'));
    server.use('/views', $.express.static(__dirname + '/dist/views'));
    server.use('/bower_components', $.express.static(__dirname + '/dist/bower_components'));
    server.use('/fonts', $.express.static(__dirname + '/dist/fonts'));
    // server.use($.expresslogger('dev'));

    // everything else gets routed to our index!
    server.get('*', function (req, res) {
        res.sendFile(__dirname + '/dist/index.html');
    });

    server.listen(port);
    console.log('Server listening on port ' + port);
};

var watchOnce = _.once(function () {
    gulp.watch(src + 'scss/**/*.scss', ['styles']);
    gulp.watch(src + 'js/**/*.js', ['index']);
    gulp.watch(src + 'views/**/*.html', ['templates']);
    gulp.watch([
        src + 'copy/**/*',
        src + 'img/**/*.{png,svg,gif,jpg}'
    ], { dot: true }, ['copy']);

    gulp.watch(src + 'index.html', ['index', 'scripts']);

    var bs = $.browsersync({
        ghostMode: false,
        logLevel: 'silent',
        port: browserSyncPort
    });

    gutil.log(chalk.yellow('Watching for changes...'));

    bs.events.on('file:changed', function (file) {
        $.terminalnotifier(file.path.replace(destAbsPath, ''), { title: 'File Changed' });
    });

    if (gutil.env.serve) setUpServer();
});

gulp.task('default', function () {
    prereqs().then(function () {
        gulp.start('run', watchOnce);
    });
});

gulp.task('run', ['copy', 'styles', 'templates', 'scripts', 'index']);

gulp.task('serve', setUpServer);
