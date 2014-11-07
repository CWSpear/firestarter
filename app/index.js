'use strict';

var path   = require('path');
var fs     = require('fs');
var yeoman = require('yeoman-generator');
var yosay  = require('yosay');
var chalk  = require('chalk');
var _      = require('lodash');


var FirestarterGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');
    },

    promptTask: function () {
        var yo = this;
        var done = yo.async();

        // Have Yeoman greet the user.
        yo.log(yosay('Welcome to the marvelous Firestarter generator!'));

        yo.log('These questions are saved to a ' + chalk.magenta('.firestarterrc') + ' file so you can change them later. Note that changing some options after this inital creation may require you to manually edit code and/or file/directory names.');

        var prompts = [{
            name: 'appName',
            message: 'What is your app\'s name (use Title Case)?',
            default: 'Firestarter'
        }, {
            name: 'ngApp',
            message: 'What is your Angular app name (use camelCase)?',
            default: 'firestarter'
        }, {
            name: 'srcDir',
            message: 'What is your source directory?',
            default: 'src',
            when: function () {
                yo.log('For following directory related questions, ending/starting slashes don\'t matter as responses will be normalized.');
                return true;
            }
        }, {
            name: 'destDir',
            message: 'What is your destination/public directory?',
            default: 'public'
        }, {
            name: 'assetDir',
            message: 'What is your asset directory inside the destination/public (if any)?',
            default: ''
        }];

        yo.prompt(prompts, function (props) {
            yo.appName  = props.appName;
            yo.ngApp    = props.ngApp;

            yo.srcDir   = stripSlashes(props.srcDir);
            yo.destDir  = stripSlashes(props.destDir);
            yo.assetDir = stripSlashes(props.assetDir);

            // group together to easily grab all config items to save to a file
            yo.config = JSON.stringify(props, null, 4);

            done();
        });

        function stripSlashes(path, addEnding) {
            return (path + '').replace(/^\/+|\/+$/, '');
        }
    },

    app: function () {
        this.templateDirectory('.', '.');
    },

    install: function () {
        if (!this.options['skip-install']) {
            this.installDependencies();
        }
    },

    end: function () {
        this.log("\n" + chalk.yellow('Congratulations!') + ' You successfully started a fire (metaphorically speaking, of course)!' + "\n");

        if (!this.options['skip-install']) {
            this.log('First run ' + chalk.blue('npm install && bower install') + ' to install necessary dependencies.');
        }

        this.log('Run ' + chalk.blue('gulp') + ' to build a development build of the app.');
        this.log('Add the ' + chalk.blue('--watch') + ' flag to rebuild when something changes.');
        this.log('Add the ' + chalk.blue('--serve') + ' flag to run a lightweight express server for your app.');
        this.log('Run ' + chalk.blue('gulp production') + ' to build a production build of the app.');
    }
});

FirestarterGenerator.prototype.templateDirectory = function(source, destination) {
    if (!source) return;

    var yo = this;

    var root = yo.isPathAbsolute(source) ? source : path.join(yo.sourceRoot(), source);
    var files = yo.expandFiles('**', { dot: true, cwd: root });

    _.each(files, function (file) {
        if (file === '.' || file === '..') return;

        // don't change src -> yo.srcDir in path until after we set "src" var
        var src = path.join(root, file);

        file = file.replace(/^src/, yo.srcDir);

        // without these shenanigans, dotfiles won't get interpolated
        if (file[0] === '_') {
            file = file.replace(/^_/, '.');
        }

        // exceptions
        if (_.contains(file, 'Firestarter')) {
            file = file.replace('Firestarter', yo.appName);
        }

        var dest = path.join(destination, path.dirname(file), path.basename(file));

        yo.template(src, dest);
    });

    // run gulp

};

module.exports = FirestarterGenerator;
