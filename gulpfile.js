var gulp = require('gulp');

gulp.task('default', ['watch']);


gulp.task('watch', function() {
  gulp.watch('lib/*', function(event) {
   console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

