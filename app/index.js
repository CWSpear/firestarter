'use strict';
// var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var _ = require('lodash');
// var chalk = require('chalk');


var FirestarterGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous Fire Starter generator!'));

    var prompts = [{
      name: 'appName',
      message: 'What is your app\'s name?',
      default: 'Awesome Destroyer App'
    }, {
      name: 'ngApp',
      message: 'What is your Angular app name?',
      default: 'awesomeDestroyerApp'
    }];

    this.prompt(prompts, function (props) {
      this.appName = props.appName;
      this.ngApp = props.ngApp;

      done();
    }.bind(this));
  },

  app: function () {
    this.templateDirectory('.', '.');
  }
});

FirestarterGenerator.prototype.templateDirectory = function(source, destination) {
  if (!source) return;

  var root = this.isPathAbsolute(source) ? source : path.join(this.sourceRoot(), source);
  var files = this.expandFiles('**', { dot: true, cwd: root });

  _.each(files, function (file) {
    if (file === '.' || file === '..') return;

    var src = path.join(root, file);

    // exceptions
    if (_.contains(file, 'Fire Starter')) {
      file = file.replace('Fire Starter', this.appName);
    }

    var dest = path.join(destination, path.dirname(file), path.basename(file));

    this.template(src, dest);
  }, this);
};

module.exports = FirestarterGenerator;
