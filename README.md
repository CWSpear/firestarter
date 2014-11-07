# generator-firestarter

> [Yeoman](http://yeoman.io) generator


## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```bash
$ npm install -g yo
```

### Yeoman Generators

Yeoman travels light. He didn't pack any generators when he moved in. You can think of a generator like a plug-in. You get to choose what type of application you wish to create, such as a Backbone application or even a Chrome extension.

~~To install generator-firestarter from npm, run:~~ I am not ready to publish to npm. For now, you can do this:

```bash
$ git clone https://github.com/CWSpear/generator-firestarter.git firestarter
$ cd firestarter
$ npm link
```

Finally, initiate the generator:

```bash
$ yo firestarter
```

### Getting To Know Yeoman

Yeoman has a heart of gold. He's a person with feelings and opinions, but he's very easy to work with. If you think he's too opinionated, he can be easily convinced.

If you'd like to get to know Yeoman better and meet some of his friends, [Grunt](http://gruntjs.com) and [Bower](http://bower.io), check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started).

# Firestarter Kit

Quick start:

```shell
npm install
gulp --install
```

**Note** that I *do* use [Gulp Ruby Sass](https://github.com/sindresorhus/gulp-ruby-sass) and you will need to have Ruby (and I believe Sass) installed to make those work.

Gulp commands:

### Build (as in "for production"):
```shell
gulp build
```

### Build + Watch (as in "for development"):
```shell
gulp
# or
gulp dev
# or
gulp watch
```

### Install Bower compoments (and any new npm packages)
```shell
gulp [build] --install
```

### Local development server for Angular SPA
```shell
gulp serve
# or
gulp dev --serve # runs dev task + serves
```

## What does it do?

This particular project was built with an AngularJS Single Page Application (SPA), and these tasks are built with that goal in mind:

* Cleans dest directory before running other tasks
* Compile scss -> css (minifies if using build task)
* Automatically links JS, rev's files (concat + minify if using build task)
* Automatically link bower components (resolving dependencies to determine order)
* Copies other files and images to dest folder.
* Watches all files and runs appropriate tasks and reloads page/injects CSS.
* Uses `gulp-plumber` to make sure `watch` doesn't break everything.

## License

MIT
