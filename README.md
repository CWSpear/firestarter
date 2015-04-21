**Firestarter has 3 parts:**

1. A Yeoman Generator for generating a default Angular SPA app structure.
2. An awesome `gulp` build script for optimization things just like I like them for new Angular SPAs.
3. **(Coming Eventually...!)** A (Yeoman) tool for generating additional templated views and controllers, etc to remove the need to write a lot of boilerplate code. These templates are fully customizable.

# Yeoman Firestarter Generator

As a pre-requisite, `yeoman` is required and if you don't already, install it globally:

```shell
npm install -g yo
```

If you'd like to get to know Yeoman better and meet some of his friends, [Gulp](http://gulpjs.com/) and [Bower](http://bower.io), check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started).

## Installation

To install the `firestarter` generator, from your terminal, run:

```shell
npm install -g generator-firestarter
```

If you're wanting to contribute to development of this package, you can alternatively install it like so:

```shell
git clone https://github.com/CWSpear/firestarter.git firestarter
cd firestarter
npm link
```

`npm link` will link this local package to your global `npm` packages.

Finally, initiate the generator:

```shell
yo firestarter
```

# Firestarter Gulp Build

## Quick start:

```shell
npm install
bower install
gulp
```

## Gulp commands:

### Production Build
```shell
gulp production
# aliases for the same thing
gulp build
gulp prod
```

### Development Build
```shell
gulp
# aliases for the same thing
gulp dev
gulp development
```

### Watch for changes
```shell
# just add the --watch flag to any command
gulp [production] --watch
```

### Local development server for Angular SPA
```shell
gulp serve [--port="port"] # just serves the app
# or
gulp --serve[="port"] # runs dev task + serves (define optional port)
# (--port flag overrides --serve flag)
```

## What does it do?

This particular project was built with an AngularJS Single Page Application (SPA), and these tasks are built with that goal in mind:

* Cleans dest directory before running other tasks
* Compile `scss` &rarr; `css` (minifies if using production task)
* Runs `autoprefixer` on compiled `css`
* Converts es6 to es5 via `babeljs`
* Automatically links `js` and revisions files (for cachebusting) 
* concat + minify (if using production task)
* Automatically link `bower` components (both `js` and `css`) (resolving dependencies to determine order)
* Automatically orders Angular files in order based on module dependencies
* Copies other static files and images to dest folder
* Watches all files and runs appropriate tasks and reloads page/injects CSS
* Uses `gulp-plumber` to make sure `watch` doesn't break everything

# Firestarter Template Builder

*Coming Eventually...*

# Changelog

- **v1.1.0** (*2015-04-21*) - Add support for using es6 via `babeljs`, as well as clean up various little things. (Removed undocumented, rarely used `--install` flag support.)

- **v1.0.4** (*2014-12-04*) - Add `gulp-angular-filesorter` to make it automatically resolve Angular module order instead of relying on knowing exactly where module definitions are. This fixed a bug where you'd sometimes get errors about trying to access undefined modules because Firestarter wasn't looking for app.js (or other files that define modules) in the correct place.

# License

MIT
