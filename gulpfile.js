var gulp = require('gulp');

var wrap = require("gulp-wrap");

var uglify = require('gulp-uglify');

var rename = require("gulp-rename");
var open = require("gulp-open");
var watch = require("gulp-watch");
var serve = require("gulp-serve");


gulp.task('serve', serve('./'));

gulp.task("open", function(){
  console.log(11);
  var options = {
    url: "http://localhost:3000",
    app: "google-chrome"
  };
  gulp.src("./index.html")
  .pipe(open("", options));
});


gulp.task('build', function() {
  gulp.src('./src/**/*.js')
    .pipe(wrap('!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b(require,exports,module):a.tpl=b()}(this,function(){<%= contents %>});'))
    .pipe(uglify({
      "output": {
        "beautify": true
      }
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify({
      "mangle": true
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('default', ['serve', 'open']);