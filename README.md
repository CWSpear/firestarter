# Yeoman Firestarter Generator

> [Yeoman](http://yeoman.io) generator


## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![yo](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```bash
$ npm install -g yo
```

### Yeoman Generators

Yeoman travels light. He didn't pack any generators when he moved in. You can think of a generator like a plug-in. You get to choose what type of application you wish to create, such as a Backbone application or even a Chrome extension.

To install `firestarter` from npm, run:

```bash
npm install -g generator-firestarter
```

If you're wanting to contribute to development of this package, you can alternatively install it like so:

```bash
$ git clone https://github.com/CWSpear/firestarter.git firestarter
$ cd firestarter
$ npm link
```

`npm link` will link this local package to your global `npm` packages.

Finally, initiate the generator:

```bash
$ yo firestarter
```

### Getting To Know Yeoman

Yeoman has a heart of gold. He's a person with feelings and opinions, but he's very easy to work with. If you think he's too opinionated, he can be easily convinced.

If you'd like to get to know Yeoman better and meet some of his friends, [Grunt](http://gruntjs.com) and [Bower](http://bower.io), check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started).

# Firestarter

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

### Watch for
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
* Compile scss -> css (minifies if using build task)
* Automatically links JS, rev's files (concat + minify if using build task)
* Automatically link bower components (resolving dependencies to determine order)
* Copies other static files and images to dest folder.
* Watches all files and runs appropriate tasks and reloads page/injects CSS.
* Uses `gulp-plumber` to make sure `watch` doesn't break everything.

## License

MIT
