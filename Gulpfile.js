var gulp = require('gulp'),
    gulpPlugin = require('gulp-load-plugins')(),
    fs = require('fs'),
    del = require('del'),
    merge = require('merge-stream'),
    karma = require('karma').server,
    path = require('path');


function tplCache(item) {
  return gulpPlugin.angularTemplatecache('tpl.html.js', {
    module: item,
    root: item + '/'
  });
}

gulp.task('zip', ['clean'], function () {
  var output = merge();
  fs.readdirSync('./modules/').forEach(function(item) {

    var stream = gulp.src([
        './modules/' + item + '/**/*',
        '!./modules/' + item + '/test/*'
      ])
      .pipe(
        gulpPlugin.if('*.less', gulpPlugin.less())
      )
      .pipe(
        gulpPlugin.if('*.js', gulpPlugin.ngAnnotate())
      )
      .pipe(
        gulpPlugin.if('*.html', tplCache(item))
      )
      .pipe(gulpPlugin.zip(item + '.zip'))
      .pipe(gulp.dest('./zip/'));

      output = merge(output, stream);
  });
  return output;
});

gulp.task('clean', function(cb) {
  del(['zip/*'], cb);
});

gulp.task('build-clean', function(cb) {
  del(['test/*'], cb);
});

gulp.task('test-build', ['build-clean'], function(cb) {
  var modules = fs.readdirSync('./modules/');
  modules.forEach(function(item) {
    gulp.src([
      './modules/' + item + '/**/*.html'
    ])
    .pipe(gulpPlugin.angularTemplatecache('tpl.html.js', {
      module: item,
      root: item + '/'
    }))
    .pipe(gulp.dest('./modules/' + item + '/test/templates/'));
  });
  cb();
});

gulp.task('test', ['test-build'], function(done) {
  karma.start({
    configFile: __dirname + '/karma-conf.js'
  }, done);
});
