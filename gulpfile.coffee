gulp = require 'gulp'
sequence    = require('run-sequence').use(gulp)
coffee = require 'gulp-coffee'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
connect = require 'gulp-connect'

# запускает автосборщик, при этом вебсервер надо запускать отдельно
gulp.task 'default', ['build'], ->
  gulp.watch ['src/**/*.coffee'], ['api']
  gulp.watch ['test/coffee/**/*.coffee'], ['main']

# основная джоба
gulp.task 'build', (callback)->
  sequence 'api', 'main', 'libs', callback

# джоба для компиляции alt_cadesplugin_api.coffee в alt_cadesplugin_api.js
gulp.task 'api', (callback)->
  gulp.src './src/alt_cadesplugin_api.coffee'
  .pipe coffee()
  .pipe gulp.dest './src'
  .pipe gulp.dest './test/js'
  .pipe uglify()
  .pipe rename 'alt_cadesplugin_api.min.js'
  .pipe gulp.dest './src'

# джоба для компиляции main.coffee в main.js
gulp.task 'main', (callback)->
  gulp.src './test/coffee/main.coffee'
  .pipe coffee()
  .pipe gulp.dest './test/js'

# копирует jquery из node_modules
gulp.task 'libs', (callback)->
  gulp.src ['./node_modules/jquery/dist/jquery.js', './node_modules/bowser/src/bowser.js']
  .pipe gulp.dest './test/js'

# запускает вебсервер для тестирования
gulp.task 'webserver', (callback)->
  connect.server
    root: 'test'
    livereload: true