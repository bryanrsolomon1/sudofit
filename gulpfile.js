"use strict";

var gulp = require("gulp");
var wiredep = require("wiredep")();
var ngAnnotate = require("gulp-ng-annotate");
var angularFilesort = require("gulp-angular-filesort");
var inject = require("gulp-inject");
var Q = require("q");
var del = require("del");
var es = require("event-stream");
var config = require("./config");

var watch, browserSync, htmlhint, jshint, stylish, htmlmin, ngHtml2js, cleanCss, uglify, concat;

var paths = {
    scripts: "./src/app/**/*.js",
    styles: "./src/app/**/*.css",
    partials: "./src/app/**/*.html",
    assets: "./src/assets/**/*",
    index: "./src/index.html",
    jshintConfig: "./.jshintrc"
};

gulp.task("set-deps-serve", function () {
    watch = require("gulp-watch");
    browserSync = require("browser-sync")
        .create();
});

gulp.task("set-deps-minification", function () {
    concat = require("gulp-concat");
    uglify = require("gulp-uglify");
    htmlmin = require("gulp-htmlmin");
    ngHtml2js = require("gulp-ng-html2js");
    cleanCss = require("gulp-clean-css");
});

gulp.task("set-deps-quality", function () {
    jshint = require("gulp-jshint");
    stylish = require("jshint-stylish");
    htmlhint = require("gulp-htmlhint");
});

var pipes = {};

pipes.pullFilePath = function (vinyl) {
    var length = vinyl.base.length;
    var path = "./src/app/**/" + vinyl.history[0].substring(length, vinyl.history[0].length);
    return gulp.src(path);
};

/* app partials */

pipes.appPartials = function () {
    return gulp.src(paths.partials);
};

pipes.builtPartialsDev = function () {
    return pipes.appPartials()
        .pipe(gulp.dest(config.development.distApp));
};

/* take all validated partials, clean them,
 * then inject them into angular $templatecache */
pipes.scriptedPartials = function () {
    return pipes.appPartials()
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(ngHtml2js({
            moduleName: "sudofit",
            declareModule: false,
            prefix: "app/" //"the prefix which should be prepended to the file path to generate
                           // the file url",
        }));
};

/* app stylesheets */

pipes.builtAppStylesDev = function () {
    return gulp.src(paths.styles)
        .pipe(gulp.dest(config.development.distApp));
};

pipes.builtAppStylesPro = function () {
    return gulp.src(paths.styles)
        .pipe(concat("app.min.css"))
        .pipe(cleanCss())
        .pipe(gulp.dest(config.production.distApp));
};

/* vendor stylesheets */

/* grab all bower css files and pipe them to distDev */
pipes.builtVendorStylesDev = function () {
    return gulp.src(wiredep.css)
        .pipe(gulp.dest(config.development.distBower));
};

/*
 * grab all bower css files, concatenate them, minify them,
 * then pipe to distProd
 */
pipes.builtVendorStylesPro = function () {
    return gulp.src(wiredep.css)
        .pipe(concat("vendor.min.css"))
        .pipe(cleanCss())
        .pipe(gulp.dest(config.production.distApp));
};

/* pulls all scripts to begin manipulation */
pipes.appScripts = function () {
    return gulp.src(paths.scripts);
};

/* pipe scripts and put them in distDev */
pipes.builtAppScriptsDev = function () {
    return pipes.appScripts()
        .pipe(angularFilesort())
        .pipe(ngAnnotate())
        .pipe(gulp.dest(config.development.distApp));
};

/*
 * pipe partials and app scripts, merge the two, order them all properly,
 * concatenate them all, minify the file, and send it to distProd
 */
pipes.builtAppScriptsPro = function () {
    var appScripts = pipes.appScripts();
    var scriptedPartials = pipes.scriptedPartials();

    return es.merge(appScripts, scriptedPartials)
        .pipe(angularFilesort())
        .pipe(ngAnnotate())
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(config.production.distApp));
};

/* vendor javascripts */

pipes.builtVendorScriptsDev = function () {
    return gulp.src(wiredep.js)
        .pipe(gulp.dest(config.development.distBower));
};


/*
 * grab all vendor (bower) dependency javascripts, order them, concatenate them,
 * minifiy the result and pipe the final product to the distribution
 */
pipes.builtVendorScriptsPro = function () {
    return gulp.src(wiredep.js)
        .pipe(concat("vendor.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(config.production.distApp));
};

/* app assets */

/* put all fonts into the dist */
pipes.builtAssetsDevelopment = function () {
    return gulp.src(paths.assets)
        .pipe(gulp.dest(config.development.dist + "assets"));
};

/* put all fonts into the dist */
pipes.builtAssetsProduction = function () {
    return gulp.src(paths.assets)
        .pipe(gulp.dest(config.production.dist + "assets"));
};

/* app index.html */

/* unifies all related tasks to building the index and then pipes the finished product to distDev */
pipes.builtIndexDev = function () {

    var orderedVendorScripts = pipes.builtVendorScriptsDev();
    var orderedAppScripts = pipes.builtAppScriptsDev();
    var appStyles = pipes.builtAppStylesDev();
    var vendorStyles = pipes.builtVendorStylesDev();

    return gulp.src(paths.index)
        .pipe(gulp.dest(config.development.dist)) // write first to get relative path for inject
        .pipe(inject(orderedVendorScripts, {
            relative: true,
            name: "bower"
        }))
        .pipe(inject(orderedAppScripts, {relative: true}))
        .pipe(inject(appStyles, {relative: true}))
        .pipe(inject(vendorStyles, {
            relative: true,
            name: "bower"
        }))
        .pipe(gulp.dest(config.development.dist));
};

/* unifies all related tasks to building the index and then pipes the finished product to distProd */
pipes.builtIndexPro = function () {

    var vendorScripts = pipes.builtVendorScriptsPro();
    var appScripts = pipes.builtAppScriptsPro();
    var appStyles = pipes.builtAppStylesPro();
    var vendorStyles = pipes.builtVendorStylesPro();

    return gulp.src(paths.index)
        .pipe(gulp.dest(config.production.dist)) // write first to get relative path for inject
        .pipe(inject(vendorScripts, {
            relative: true,
            name: "bower"
        }))
        .pipe(inject(appScripts, {relative: true}))
        .pipe(inject(vendorStyles, {
            relative: true,
            name: "bower"
        }))
        .pipe(inject(appStyles, {relative: true}))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(config.production.dist));
};

/* orchestrator pipes */

/* merge index, partials, and assets streams because there is no direct reference
 * to the partials or assets in the index.html
 */
pipes.builtAppDev = function () {
    return es.merge(pipes.builtIndexDev(), pipes.builtAssetsDevelopment(), pipes.builtPartialsDev());
};

/* only need to merge index and assets because partials are included in app scripts for prod */
pipes.builtAppPro = function () {
    return es.merge(pipes.builtIndexPro(), pipes.builtAssetsProduction());
};

pipes.watchSingleScript = function (vinyl) {
    pipes.pullFilePath(vinyl)
        .pipe(ngAnnotate())
        .pipe(gulp.dest(config.development.distApp))
        .pipe(browserSync.reload({stream: true}));
};

pipes.watchSinglePartial = function (vinyl) {
    pipes.pullFilePath(vinyl)
        .pipe(gulp.dest(config.development.distApp))
        .pipe(browserSync.reload({stream: true}));
};

pipes.watchSingleStyle = function (vinyl) {
    pipes.pullFilePath(vinyl)
        .pipe(gulp.dest(config.development.distApp))
        .pipe(browserSync.stream({match: "**/*.css"}));
};

/* tasks */

/*
 * removes all compiled files
 * use async library to ensure del has completed before allowing gulp to move on
 */
gulp.task("clean-dev", function () {
    var deferred = Q.defer();
    del(config.development.dist)
        .then(function () {
            deferred.resolve();
        });
    return deferred.promise;
});

gulp.task("clean-pro", function () {
    var deferred = Q.defer();
    del(config.production.dist)
        .then(function () {
            deferred.resolve();
        });
    return deferred.promise;
});

gulp.task("built-index-dev", pipes.builtIndexDev);

/* serve utilities */

/* watch tasks that will perform corresponding rebuilds and reload browserSync */
gulp.task("watch-index-dev", ["built-index-dev"], function () {
    browserSync.reload();
});

/* main tasks */

/* cleans and builds a complete dev environment */
gulp.task("build-dev", ["clean-dev"], pipes.builtAppDev);

gulp.task("build-pro", ["set-deps-minification", "clean-pro"], pipes.builtAppPro);

gulp.task("quality", ["set-deps-quality"], function () {
    var scripts = pipes.appScripts()
        .pipe(jshint(paths.jshintConfig))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter("fail"));

    var htmls = gulp.src("./src/**/*.html")
        .pipe(htmlhint.reporter())
        .pipe(htmlhint.failReporter());

    return es.merge(scripts, htmls);
});

function isOnlyChange(vinyl) {
    return vinyl.event === "change";
}

gulp.task("serve", ["set-deps-serve", "build-dev"], function () {

    browserSync.init({
        server: {
            baseDir: config.development.dist
        },
        ghostMode: false,
        port: 8080
    });

    /* watch index */
    watch(paths.index, function () {
        gulp.start("watch-index-dev");
    });

    /* watch app scripts */
    watch(paths.scripts, function (vinyl) {
        if(isOnlyChange(vinyl)) {
            pipes.watchSingleScript(vinyl);
        } else {
            gulp.start("watch-index-dev");
        }
    });

    /* watch html partials */
    watch(paths.partials, function (vinyl) {
        pipes.watchSinglePartial(vinyl);
    });

    /* watch styles */
    watch(paths.styles, function (vinyl) {
        if(isOnlyChange(vinyl)) {
            pipes.watchSingleStyle(vinyl);
        } else {
            gulp.start("watch-index-dev");
        }
    });
});

gulp.task("serve-pro", ["set-deps-serve", "build-pro"], function () {
    browserSync.init({
        server: {
            baseDir: config.production.dist
        },
        ghostMode: false,
        port: 8080
    });
});