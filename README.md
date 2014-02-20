# Gulp Starter Kit

Quick start:

```
npm install
gulp --install
```

Gulp commands:

### Build (as in "for production"):
```
gulp build
```

### Build + Watch (as in "for development"):
```
gulp
```

### Install Bower compoments (and any new npm packages)
```
gulp [build] --install
```

## What does it do?

* Cleans dest directory before running other tasks
* Compile scss -> css (minifies if using build task)
* Automatically links JS, rev's files (concat + minify if using build task)
* Automatically link bower components (resolving dependencies to determine order)
* Compiles Jade (links `browser-sync` if using default task)
* Copies other files and images to dest folder.
* Watches all files and runs appropriate tasks and reloads page/injects CSS.
