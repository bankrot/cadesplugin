gulp = require 'gulp'
sequence    = require('run-sequence').use(gulp)
coffee = require 'gulp-coffee'
umd = require 'gulp-umd'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
connect = require 'gulp-connect'
proxy = require 'http-proxy-middleware'

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
  .pipe coffee({bare: true}).on 'error', (error)->
    console.log error
  .pipe umd
    exports: (file)->
      return 'AltCadesPlugin'
    namespace: (file)->
      return 'AltCadesPlugin'
  .pipe gulp.dest './src'
  .pipe gulp.dest './test/js'
  .pipe uglify()
  .pipe rename 'alt_cadesplugin_api.min.js'
  .pipe gulp.dest './src'

# джоба для компиляции main.coffee в main.js
gulp.task 'main', (callback)->
  gulp.src './test/coffee/main.coffee'
  .pipe coffee({bare: true}).on 'error', (error)->
    console.log error
  .pipe gulp.dest './test/js'

# копирует jquery из node_modules
gulp.task 'libs', (callback)->
  gulp.src [
    './node_modules/jquery/dist/jquery.js'
    './node_modules/bowser/src/bowser.js'
    './node_modules/es6-promise/dist/es6-promise.js'
  ]
  .pipe gulp.dest './test/js'

# запускает вебсервер для тестирования
gulp.task 'webserver', (callback)->
  connect.server
    root: 'test'
    livereload: true
    middleware: (connect, opt)->
      return [
        proxy('/sites', {
          target: 'http://www.cryptopro.ru'
          changeOrigin: true
          ws: true
        })
      ]