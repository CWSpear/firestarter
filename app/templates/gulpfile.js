var path = require('path');
var url  = require('url');
var fs   = require('fs');

var gulp  = require('gulp');
var gutil = require('gulp-util');

var _ = require('lodash');

// this config is saved variables gathered from the yeoman generator
var config = require('./firestarter.json');

//////////////////
// start config //
//////////////////

var moduleName = config.ngApp;

var assetsDir = config.assetDir;
var dest = config.destDir + '/' + (assetsDir ? assetsDir + '/' : '');
var src = config.srcDir + '/';

var destAbsPath = path.resolve(dest);

var npmConfig = require('./package.json');
var includeBrowserSync = true;
var browserSyncPort = _.random(3001, 5000);

if (_.contains(gutil.env._, 'build') || _.contains(gutil.env._, 'prod') || _.contains(gutil.env._, 'production')) {
    if (!gutil.env.production) gutil.env.production = true;
    includeBrowserSync = false;
}

var scripts = [
    src + '**/*.js',
];

////////////////
// end config //
////////////////

var injectables = {
    scripts: [],
    styles: []
};

var $ = _.object(_.map(npmConfig.devDependencies, function (version, module) {
    var name = module === 'gulp-util' ? 'gutil' : module.replace('gulp-', '').replace(/-/g, '');
    return [name, require(module)];
}));

var plumberError = function (err) {
    gutil.beep();
    console.error(err.message, err);
};

gulp.task('reload', function () {
    $.browsersync.reload();
});

gulp.task('styles', function () {
    injectables.styles = [];

    var styles = gulp.src(src + 'scss/style.scss')
        .pipe($.plumber(function (error) {
            plumberError(error);
            // sass doesn't emit the required end event
            // so we have to do it ourselves manually
            this.emit('end');
        }))
        .pipe($.sass({
            style: gutil.env.production ? 'compressed' : 'nested',
        }))
        .pipe($.autoprefixer('last 1 version'));

    var bower = gulp.src($.wiredep().css || []);

    return $.streamqueue({ objectMode: true }, bower, styles)
        .pipe($.plumber(plumberError))
        .pipe(gutil.env.production ? $.concat('styles.css') : gutil.noop())
        .pipe(gutil.env.production ? $.rev() : gutil.noop())
        .pipe(gulp.dest(dest + 'css/'))
        .pipe($.tap(function (file) {
            // keep track of things to inject (only on production)
            injectables.styles.push(file.path);
        }))
        .pipe($.browsersync.reload({ stream: true }));
});

gulp.task('static', function () {
    // apparently gulp ignores dotfiles with globs
    gulp.src(src + 'static/**/*', { dot: true })
        .pipe(gulp.dest(dest));

    gulp.src(src + 'img/**/*.{png,svg,gif,jpg}')
        .pipe(gulp.dest(dest + 'img/'))
        .pipe($.browsersync.reload({ stream: true }));
});

gulp.task('templates', function () {
    gulp.src([src + '**/*.html', '!' + src + 'partials/**/*'])
        .pipe($.changed(dest))
        .pipe(gulp.dest(dest))
        .pipe($.browsersync.reload({ stream: true }));
});

gulp.task('scripts', function () {
    injectables.scripts = [];

    var scriptStream = gulp.src(scripts)
        .pipe($.plumber(plumberError))
        .pipe($.cached('scripts'))
        .pipe($.babel())
        .pipe($.remember('scripts'))
        .pipe($.rename(function (path) {
            // hack to prevent stuff from being doubled-rev'd
            path.basename = path.basename.replace(/-[0-9a-f]{8}$/, '');
        }))
        .pipe($.angularfilesort())
        .pipe($.ngannotate());

    var bower = gulp.src($.wiredep().js);

    return $.streamqueue({ objectMode: true }, bower, scriptStream)
        .pipe($.plumber(plumberError))
        .pipe(gutil.env.production ? $.concat('js/script.js') : gutil.noop())
        .pipe(gutil.env.production ? $.uglify() : gutil.noop())
        .pipe($.rev())
        .pipe(gulp.dest(dest))
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
        .pipe($.replace(
            '<!-- browser-sync -->',
            '<script>angular.module(\'' + moduleName + '\').constant(\'watchPort\', ' + (gutil.env.watch && browserSyncPort) + ');<' + '/script>'
        ))
        .pipe($.inject(gulp.src(_.flatten(_.values(injectables)), { read: false }), {
            transform: function (filepath) {
                if (path.extname(filepath) === '.css') {
                    return '<link rel="stylesheet" href="' + assetsDir + filepath.replace(dest.substr(0, 2) === '..' ? destAbsPath : dest, '') + '" />';
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

var clean = function () {
    var rimrafDeferred = $.q.defer();

    $.rimraf(dest, function (er) {
        if (er) throw er;
        rimrafDeferred.resolve();
        gutil.log('rimraf\'d', gutil.colors.magenta(dest));
    });

    return rimrafDeferred.promise;
};

var setUpServer = function () {
    var port = !gutil.env.serve || gutil.env.serve === true ? 1337 : gutil.env.serve;
    // port flag overrides!
    if (gutil.env.port && gutil.env.serve !== true)
        port = gutil.env.port;

    var server = $.express();

    // server.use($.expresslogger('dev'));

    var public = dest.replace(new RegExp(assetsDir + '\/?$'), '/');

    // everything else gets routed to our index!
    server.get('*', function (req, res) {
        var filepath = path.normalize(__dirname + '/' + public + url.parse(req.url).pathname);
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
            // send the file if it's a static file and exists
            res.sendFile(filepath);
        } else if (filepath.match(/\.[a-z0-9-]{1,6}$/)) {
            // if it has an "extension," but doesn't exist, send 404
            res.sendStatus(404);
        } else {
            // otherwise, send the angular base template
            res.sendFile(path.normalize(__dirname + '/' + dest + 'index.html'));
        }
    });

    server.listen(port);
    gutil.log($.chalk.yellow('Server listening on port ') + $.chalk.blue(port));
};

var watchOnce = _.once(function () {
    // watch flag must be set to watch
    if (!gutil.env.watch) {
        if (gutil.env.serve) setUpServer();
        return;
    }

    var scriptWatcher = gulp.watch(src + '**/*.js', ['index']);

    gulp.watch(src + 'scss/**/*.scss', ['styles']);
    gulp.watch([
        src + '**/*.html',
        '!' + src + 'index.html'
    ], ['templates']);
    gulp.watch([
        src + 'static/**/*',
        src + 'img/**/*.{png,svg,gif,jpg}'
    ], { dot: true }, ['static']);

    gulp.watch(src + 'index.html', ['index', 'scripts']);

    scriptWatcher.on('change', function (event) {
        if (event.type === 'deleted') {
            // if a file is deleted, forget about it
            delete $.cached.caches.scripts[event.path];
            $.remember.forget('scripts', event.path);
        }
    });

    var bs = $.browsersync({
        ghostMode: false,
        logLevel: 'silent',
        port: browserSyncPort
    });

    gutil.log($.chalk.yellow('Watching for changes...'));
    gutil.log($.chalk.yellow('browserSync listening on port ') + $.chalk.blue(browserSyncPort));

    bs.emitter.on('file:changed', function (file) {
        $.nodenotifier.notify({
            icon: 'http://yeoman.io/assets/img/yeoman-02.eed5.png',
            title: 'File Changed',
            message:  file.path.replace(destAbsPath, '')
        });
    });

    if (gutil.env.serve) setUpServer();
});

// Task Definitions
// -------------------------

gulp.task('default', function () {
    clean().then(function () {
        gulp.start('run', ['watch']);
    });
});

// dev/development is an alias for default
gulp.task('dev', ['default']);
gulp.task('development', ['default']);

gulp.task('prod', function () {
    clean().then(function () {
        gulp.start('run');
    });
});

// build is an alias for production for legacy reasons
gulp.task('build', ['prod']);
gulp.task('production', ['prod']);

gulp.task('run', ['static', 'styles', 'templates', 'scripts', 'index']);

gulp.task('serve', setUpServer);

// used internally, not for use from the CLI (gulp made some change to passing in
// callbacks in `gulp.start` and I haven't looked into it further. This was a quick fix.)
gulp.task('watch', watchOnce);
