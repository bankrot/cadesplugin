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
Версия 0.0.1 (в разработке)
Поддерживает плагин версии 2.0.12245
Репозиторий https://github.com/bankrot/cadesplugin
 */
var $, AltCadesPlugin,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  slice = [].slice;

if (jquery && !$) {
  $ = jquery;
}

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
  Время ожидания ответа от плагина
  @property timeout
  @type {Number}
   */

  _Class.prototype.timeout = 20000;


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
    this.get = bind(this.get, this);
    this.getParam = bind(this.getParam, this);
    this.createObject = bind(this.createObject, this);
    this.nonNpapiInit = bind(this.nonNpapiInit, this);
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
  Инициализирует работу плагина в браузере без NPAPI (Например Google Chrome)
  @method nonNpapiInit
  @return {jQuery.Deferred} Deferred объект
   */

  _Class.prototype.nonNpapiInit = function() {
    var deferred, fail, listener, success;
    $('head').append('<script src="chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js"></script>');
    deferred = $.Deferred();
    window.postMessage('cadesplugin_echo_request', '*');
    success = (function(_this) {
      return function() {
        _this.checked = true;
        return deferred.resolve();
      };
    })(this);
    fail = (function(_this) {
      return function(message) {
        _this.checked = true;
        return deferred.reject(message);
      };
    })(this);
    listener = function(event) {
      if (event.data !== 'cadesplugin_loaded') {
        return;
      }
      return cpcsp_chrome_nmcades.check_chrome_plugin(success, fail);
    };
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

  _Class.prototype.createObject = function(name) {
    var deferred;
    deferred = $.Deferred();
    this.pluginObject.CreateObjectAsync(name).then(function(value) {
      return deferred.resolve(value);
    }, function(value) {
      return deferred.reject(value);
    });
    return deferred;
  };


  /**
  Возвращает параметр из объекта
  @method getParam
  @param objectName {Object|String} Уже созданный объект, или ранее полученный параметр, или название объекта
  @param paramName {Object|String} Имя параметра.
    Или объект с ключами paramName и options на случай если параметр нужно получить через выполнение функции
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
   */

  _Class.prototype.getParam = function(objectName, paramName) {
    var chain, deferred, param;
    param = function(_object, _param) {
      var p;
      if (typeof _param === 'object') {
        return _object[_param.paramName].apply(null, _param.options);
      } else {
        p = _object[_param];
        return p;
      }
    };
    deferred = $.Deferred();
    if (typeof objectName === 'string') {
      chain = this.pluginObject.CreateObjectAsync(objectName).then(function(object) {
        return param(object, paramName);
      });
    } else {
      chain = param(objectName, paramName);
    }
    chain.then(function(value) {
      return deferred.resolve(value);
    }, function(value) {
      return deferred.reject(value);
    });
    return deferred;
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

  return _Class;

})();

return AltCadesPlugin;
}));
