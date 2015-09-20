(function() {
  var AltCadesPlugin,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  AltCadesPlugin = (function() {

    /**
    Если TRUE значит плагин уже был проверен
    @property checked
    @type {Boolean}
    @default false
     */
    _Class.prototype.checked = false;


    /**
    К этому объекту будет обращаться скрипт плагина
    @property cadesplugin
    @type {Object}
     */

    _Class.prototype.cadesplugin = {};


    /**
    DOM элемент плагина
    @property pluginObject
     */

    _Class.prototype.pluginObject = null;


    /**
    Конструктор
    @method constructor
    @param options {Object} Опции
     */

    function _Class() {
      this.chromeInit = bind(this.chromeInit, this);
      this.cadesplugin.JSModuleVersion = '2.0';
      this.cadesplugin.async_spawn = this.asyncSpawn;
      this.cadesplugin.set = (function(_this) {
        return function(object) {
          return _this.pluginObject = object;
        };
      })(this);
      window.cadesplugin = this.cadesplugin;
    }


    /**
    Необходимый метод, его вызывает скрипт плагина
    @method asyncSpawn
    @param generatorFunc {Function} Колбэк
     */

    _Class.prototype.asyncSpawn = function(generatorFunc) {
      var continuer, generator, onFulfilled, onRejected;
      continuer = function(verb, arg) {
        var err, error, result;
        try {
          result = generator[verb](arg);
        } catch (error) {
          err = error;
          return Promise.reject(err);
        }
        if (result.done) {
          return result.value;
        } else {
          return Promise.resolve(result.value).then(onFulfilled, onRejected);
        }
      };
      generator = generatorFunc(Array.prototype.slice.call(arguments, 1));
      onFulfilled = continuer.bind(continuer, 'next');
      onRejected = continuer.bind(continuer, 'throw');
      return onFulfilled();
    };


    /**
    Инициализирует работу плагина в браузере Google Chrome
    @method chromeInit
    @return {jQuery.Deferred} Deferred объект
     */

    _Class.prototype.chromeInit = function() {

      /**
      Подключаем файл из плагина
       */
      var deferred, fail, fileref, listener, success;
      fileref = document.createElement('script');
      fileref.setAttribute('type', 'text/javascript');
      fileref.setAttribute('src', 'chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js');
      document.getElementsByTagName('head')[0].appendChild(fileref);
      deferred = $.Deferred();
      window.postMessage('cadesplugin_echo_request', '*');

      /**
      Отправляем событие что все ок.
       */
      success = (function(_this) {
        return function() {
          _this.checked = true;
          return deferred.resolve();
        };
      })(this);

      /**
      Отправляем событие что сломались.
       */
      fail = (function(_this) {
        return function(message) {
          _this.checked = true;
          return deferred.reject(message);
        };
      })(this);

      /**
      Обработчик события по загрузке плагина
       */
      listener = function(event) {
        if (event.data !== 'cadesplugin_loaded') {
          return;
        }
        return cpcsp_chrome_nmcades.check_chrome_plugin(success, fail);
      };
      window.addEventListener('message', listener, false);
      return deferred;
    };

    return _Class;

  })();


  /**
  Делаем класс доступным глобально
   */

  window.AltCadesPlugin = AltCadesPlugin;

}).call(this);
