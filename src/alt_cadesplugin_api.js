;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.AltCadesPlugin = factory(root.$);
  }
}(this, function(jquery) {

/**
Библиотека для работы с плагином КриптоПРО
Версия 0.0.5 (beta)
Поддерживает плагин версии 2.0.12245
Репозиторий https://github.com/bankrot/cadesplugin
 */
var $, AltCadesPlugin, altCadespluginApiInstance,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  slice = [].slice;

if (jquery && !$) {
  $ = jquery;
}


/**
Хранилизе для инстанса
@property altCadespluginApiInstance
@type {AltCadesPlugin}
 */

altCadespluginApiInstance = null;


/**
@class AltCadesPlugin
 */

AltCadesPlugin = (function() {

  /**
  Если TRUE значит плагин уже был проверен (но не факт что удачно)
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
  Время ожидания ответа от плагина (для версии без NPAPI)
  @property timeout
  @type {Number}
   */

  _Class.prototype.timeout = 20000;


  /**
  Нативные промисы поддерживаются
  @property isPromise
  @type {Boolean}
   */

  _Class.prototype.isPromise = !!window.Promise;


  /**
  На основе webkit
  @property isWebkit
  @type {Boolean}
   */

  _Class.prototype.isWebkit = (function() {
    return navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/opera/i);
  })();


  /**
  Конструктор
  @method constructor
  @param options {Object} Опции
  @param [options.timeout] {Number} Время ожидания ответа плагина, в мс. По умолчанию 20000
   */

  function _Class(options) {
    if (options == null) {
      options = {};
    }
    this.set = bind(this.set, this);
    this.get = bind(this.get, this);
    this.getParam = bind(this.getParam, this);
    this.init = bind(this.init, this);
    if (altCadespluginApiInstance) {
      return altCadespluginApiInstance;
    }
    if (options.timeout) {
      this.timeout = options.timeout;
    }
    this.cadesplugin.JSModuleVersion = '2.0';
    this.cadesplugin.async_spawn = this.asyncSpawn;
    this.cadesplugin.set = (function(_this) {
      return function(object) {
        return _this.pluginObject = object;
      };
    })(this);
    window.cadesplugin = this.cadesplugin;
    altCadespluginApiInstance = this;
  }


  /**
  Необходимый метод, его вызывает скрипт плагина
  @method asyncSpawn
  @param generatorFunc {Function} Колбэк
   */

  _Class.prototype.asyncSpawn = function(generatorFunc) {
    var continuer, generator, onFulfilled, onRejected;
    continuer = function(verb, arg) {
      var err, error1, result;
      try {
        result = generator[verb](arg);
      } catch (error1) {
        err = error1;
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
  Инициализирует работу плагина в браузере без NPAPI (Например Google Chrome)
  @method init
  @return {jQuery.Deferred} Deferred объект
   */

  _Class.prototype.init = function() {
    if (this.checked) {
      return $.when();
    }
    if (this.isWebkit) {
      return this.initWebkit();
    } else {
      return this.initNpapi();
    }
  };


  /**
  Инициализирует плагин в webkit-браузерах
  @method initWebkit
   */

  _Class.prototype.initWebkit = function() {
    var deferred, listener;
    $.getScript('chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js');
    window.postMessage('cadesplugin_echo_request', '*');
    deferred = $.Deferred();
    listener = (function(_this) {
      return function(event) {
        if (event.data !== 'cadesplugin_loaded') {
          return;
        }
        return setTimeout((function() {
          return cpcsp_chrome_nmcades.check_chrome_plugin(((function(_this) {
            return function() {
              _this.checked = true;
              return deferred.resolve();
            };
          })(this)), ((function(_this) {
            return function(message) {
              _this.checked = true;
              return deferred.reject(message);
            };
          })(this)));
        }), 0);
      };
    })(this);
    window.addEventListener('message', listener, false);
    setTimeout(((function(_this) {
      return function() {
        if (!_this.checked) {
          return deferred.reject('timeout');
        }
      };
    })(this)), this.timeout);
    return deferred;
  };


  /**
  Инициализирует плагин в режиме NPAPI
  @method initNpapi
   */

  _Class.prototype.initNpapi = function() {
    var deferred, eventName;
    deferred = $.Deferred();
    if (this.isPromise) {
      eventName = 'load';
    } else {
      eventName = 'message';
    }
    $(window).on(eventName, (function(_this) {
      return function(event) {
        var result;
        if ((!_this.isPromise) && (event.data !== 'cadesplugin_echo_request')) {
          return;
        }
        _this.loadNpapiPlugin();
        _this.checked = true;
        result = _this.checkNpapiPlugin();
        if (result === true) {
          return deferred.resolve();
        } else {
          return deferred.reject(result);
        }
      };
    })(this));
    return deferred;
  };


  /**
  Загружает NPAPI плагин
  @method loadNpapiPlugin
   */

  _Class.prototype.loadNpapiPlugin = function() {
    var object;
    object = $('<object id="cadesplugin_object" type="application/x-cades" style="visibility:hidden;"></object>');
    $('body').append(object);
    return this.pluginObject = object[0];
  };


  /**
  Проверяет плагин и возвращает true если проверка пройдена или строку с кодом ошибки
  @method checkNpapiPlugin
   */

  _Class.prototype.checkNpapiPlugin = function() {
    var error, error1, mimetype, plugin;
    try {
      this.createObject('CAdESCOM.About');
      return true;
    } catch (error1) {
      error = error1;
      mimetype = navigator.mimeTypes['application/x-cades'];
      if (mimetype) {
        plugin = mimetype.enabledPlugin;
        if (plugin) {
          return 'plugin_not_loaded_but_object_cannot_create';
        } else {
          return 'error_on_plugin_load';
        }
      } else {
        return 'plugin_unreachable';
      }
    }
  };

  _Class.prototype.createObject = function(name) {
    return this.pluginObject.CreateObject(name);
  };


  /**
  Возвращает параметр из объекта
  @method getParam
  @param objectName {Object|String} Уже созданный объект, или ранее полученный параметр, или название объекта
  @param paramName {Object|String} Имя параметра.
    Или объект с ключами method и args на случай если параметр нужно получить через выполнение функции
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
   */

  _Class.prototype.getParam = function(objectName, paramName) {
    var deferred, error, error1, nativePromiseChain, result;
    deferred = $.Deferred();
    if (this.isWebkit) {
      if (typeof objectName === 'string') {
        nativePromiseChain = this.pluginObject.CreateObjectAsync(objectName).then((function(_this) {
          return function(object) {
            if (paramName) {
              return _this.extractParam(object, paramName);
            } else {
              return object;
            }
          };
        })(this));
      } else {
        nativePromiseChain = this.extractParam(objectName, paramName);
      }
      nativePromiseChain.then(deferred.resolve, deferred.reject);
    } else {
      try {
        if (typeof objectName === 'string') {
          result = this.pluginObject.CreateObject(objectName);
          if (paramName) {
            result = this.extractParam(result, paramName);
          }
        } else {
          result = this.extractParam(objectName, paramName);
        }
        deferred.resolve(result);
      } catch (error1) {
        error = error1;
        deferred.reject(error.message);
      }
    }
    return deferred;
  };


  /**
  @method extractParam
  @param object
  @param paramName
   */

  _Class.prototype.extractParam = function(object, param) {
    if (typeof param === 'object') {
      return object[param.method].apply(object, param.args);
    } else {
      return object[param];
    }
  };


  /**
  Возвращает последний параметр из цепочки
  Например вызов altCadesPlugin.get('CAdESCOM.About', 'PluginVersion', 'MajorVersion') вернет MajorVersion в колбэк
  @method get
  @param objectName {Object|String} Уже созданный объект, или ранее полученный параметр, или название объекта
  @param paramName {String} Имя параметра. Таких параметров можно передавать неограниченное количество.
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
   */

  _Class.prototype.get = function() {
    var args, objectName, paramName;
    objectName = arguments[0], paramName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.getParam(objectName, paramName).then((function(_this) {
      return function(object) {
        if (args.length > 0) {
          args.unshift(object);
          return _this.get.apply(_this, args);
        } else {
          return object;
        }
      };
    })(this));
  };


  /**
  Записывает данные в передаваемый объект
  Если плагин работает без NPAPI, то параметр записывается через метод propset_ParamName
  @method set
  @param object {Object} Объект плагина куда надо записать данные
  @param paramName {String} Название записываемого параметра
  @param value Значение параметра
   */

  _Class.prototype.set = function(object, paramName, value) {
    var deferred, error, error1, param;
    if (this.isWebkit) {
      param = {
        method: 'propset_' + paramName,
        args: [value]
      };
      return this.get(object, param);
    } else {
      deferred = $.Deferred();
      try {
        object[paramName] = value;
        deferred.resolve();
      } catch (error1) {
        error = error1;
        deferred.reject(error.message);
      }
      return deferred;
    }
  };

  return _Class;

})();

return AltCadesPlugin;
}));
