;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.AltCadesPlugin = factory();
  }
}(this, function() {

  /**
   Библиотека для работы с плагином КриптоПРО
   Версия 0.0.6 (beta)
   Поддерживает плагин версии 2.0.12245
   Репозиторий https://github.com/bankrot/cadesplugin
   */

  /**
   Хранилище для инстанса
   @property altCadespluginApiInstance
   @type {AltCadesPlugin}
   */
  var AltCadesPlugin, altCadespluginApiInstance,
      bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      slice = [].slice;

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
     На основе webkit
     @property isWebkit
     @type {Boolean}
     */

    _Class.prototype.isWebkit = (function() {
      return navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/opera/i);
    })();

    /**
     FireFox
     @property isFireFox
     @type {Boolean}
     */

    _Class.prototype.isFireFox = (function() {
      return navigator.userAgent.match(/Firefox/i);
    })();


    /**
     Internet Explorer
     @property isIE
     @type {Boolean}
     */

    _Class.prototype.isIE = (function() {
      return (navigator.appName === 'Microsoft Internet Explorer') || navigator.userAgent.match(/Trident\/./i);
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
      } else if (this.isFireFox) {
        return this.initFireFox();
      } else {
        return this.initNpapi();
      }
    };


    /**
     Инициализирует плагин в webkit-браузерах
     @method initWebkit
     */

    _Class.prototype.initWebkit = function() {
      var deferred;
      deferred = $.Deferred();
      $.getScript('chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js').then((function(_this) {
        return function() {
          return window.postMessage('cadesplugin_echo_request', '*');
        };
      })(this)).fail((function(_this) {
        //добавляем поддержку плагина в яндекс браузере, если не подгрузился первый путь
        return function() {
          $.getScript('chrome-extension://epebfcehmdedogndhlcacafjaacknbcm/nmcades_plugin_api.js').then((function(_this) {
            return function() {
              return window.postMessage('cadesplugin_echo_request', '*');
            };
          })(this)).fail((function(_this) {
            return function() {
              return deferred.reject('plugin_not_installed');
            };
          })(this));
        };
      })(this));
      $(window).on('message', (function(_this) {
        return function(event) {
          var ref;
          if ((event != null ? (ref = event.originalEvent) != null ? ref.data : void 0 : void 0) !== 'cadesplugin_loaded') {
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
      })(this));
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
     Инициализирует плагин для FireFox
     @method initFireFox
     */
    _Class.prototype.initFireFox = function() {
      var deferred;
      deferred = $.Deferred();
      $.getScript('moz-extension://9b73b31f-72ed-414b-bb85-81302ec0b2b0/nmcades_plugin_api.js').then((function(_this) {
        return function() {
          return window.postMessage('cadesplugin_echo_request', '*');
        };
      })(this)).fail((function(_this) {
        return function() {
          return deferred.reject('plugin_not_installed');
        };
      })(this));
      $(window).on('message', (function(_this) {
        return function(event) {
          var ref;
          if ((event != null ? (ref = event.originalEvent) != null ? ref.data : void 0 : void 0) !== 'cadesplugin_loadedurl:moz-extension://9b73b31f-72ed-414b-bb85-81302ec0b2b0/nmcades_plugin_api.js') {
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
      })(this));
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
      var deferred;
      deferred = $.Deferred();
      var result;
      this.loadNpapiPlugin();
      this.checked = true;
      result = this.checkNpapiPlugin();
      if (result === true) {
        return deferred.resolve();
      } else {
        return deferred.reject(result);
      }

    };


    /**
     Загружает NPAPI плагин
     @method loadNpapiPlugin
     */

    _Class.prototype.loadNpapiPlugin = function() {
      var ieObject, object;
      object = $('<object id="cadesplugin_object" type="application/x-cades" style="visibility:hidden;"></object>');
      $('body').append(object);
      this.pluginObject = object[0];
      if (this.isIE) {
        ieObject = $('<object id="certEnrollClassFactory" classid="clsid:884e2049-217d-11da-b2a4-000e7bbb2b09" style="visibility:hidden;"></object>');
        return $('body').append(ieObject);
      }
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
      var error, error1;
      if (this.isIE) {
        if (name.match(/X509Enrollment/i)) {
          try {
            return $('certEnrollClassFactory')[0].CreateObject(name);
          } catch (error1) {
            error = error1;
            throw 'setup_https_for_x509enrollment';
          }
        }
        return new ActiveXObject(name);
      }
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
      try {
        if (this.isWebkit || this.isFireFox) {
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

          if (typeof objectName === 'string') {
            result = this.createObject(objectName);
            if (paramName) {
              result = this.extractParam(result, paramName);
            }
          } else {
            result = this.extractParam(objectName, paramName);
          }
          deferred.resolve(result);

        }
      } catch (error1) {
        error = error1;
        deferred.reject(error.message);
      }
      return deferred;
    };


    /**
     Возвращает параметр объекта либо результат выполнения метода объекта (если param это объект)
     @method extractParam
     @param object {Object} Объект из которого надо получить параметр
     @param param {Object|String} Какой параметр надо получить (или какой метод выполнить)
     */

    _Class.prototype.extractParam = function(object, param) {
      if (typeof param === 'object') {
        switch (param.args.length) {
          case 0:
            return object[param.method]();
          case 1:
            return object[param.method](param.args[0]);
          case 2:
            return object[param.method](param.args[0], param.args[1]);
          case 3:
            return object[param.method](param.args[0], param.args[1], param.args[2]);
          case 4:
            return object[param.method](param.args[0], param.args[1], param.args[2], param.args[3]);
        }
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
     @return {jQuery.Deferred}
     */

    _Class.prototype.set = function(object, paramName, value) {
      var deferred, error, error1, param;
      if (this.isWebkit || this.isFireFox) {
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


    /**
     Возвращает объект с версиями плагина
     @method getVersion
     @return {jQuery.Deferred} В первый аргумент колбэка передается объект с ключами major, minor, build, full
     */

    _Class.prototype.getVersion = function() {
      return $.when(this.get('CAdESCOM.About', 'PluginVersion', 'MajorVersion'), this.get('CAdESCOM.About', 'PluginVersion', 'MinorVersion'), this.get('CAdESCOM.About', 'PluginVersion', 'BuildVersion')).then(function(major, minor, build) {
        var result;
        result = {
          major: major,
          minor: minor,
          build: build,
          full: major + '.' + minor + '.' + build
        };
        return result;
      });
    };


    /**
     Возвращает версию КриптоПРО CSP
     @method getCSPVersion
     @return {jQuery.Deferred} В первый аргумент колбэка передается объект с ключами major, minor, build, full
     */

    _Class.prototype.getCSPVersion = function() {
      return $.when(this.get('CAdESCOM.About', {
        method: 'CSPVersion',
        args: ['', 75]
      }, 'MajorVersion'), this.get('CAdESCOM.About', {
        method: 'CSPVersion',
        args: ['', 75]
      }, 'MinorVersion'), this.get('CAdESCOM.About', {
        method: 'CSPVersion',
        args: ['', 75]
      }, 'BuildVersion')).then(function(major, minor, build) {
        var result;
        result = {
          major: major,
          minor: minor,
          build: build,
          full: major + '.' + minor + '.' + build
        };
        return result;
      });
    };


    /**
     Возвращает список сертификатов
     @method getCertificates
     @return {jQuery.Deferred} В первый аргумент колбэка передается массив,
     каждый элемент которого это объект со следующими ключами:
     subject: владелец сертификата
     issuer: издатель сертификата
     validFrom: дата начала действия сертификата, дата выдачи
     validTo: дата окночания действия сертификата
     algorithm: алгоритм шифрования
     hasPrivateKey: наличие закрытого ключа
     isValid: валидность
     thumbprint: слепок, хэш
     certificate: объект сертификата
     Если произошла ошибка, то передается строка с описанием ошибки:
     - certificates_not_found - Не найдено ни одного сертификата
     - valid_certificates_not_found - Не найдено ни одного валидного сертификата
     - certificate_read_error - Ошибка чтения одного из сертификатов
     */

    _Class.prototype.getCertificates = function() {
      var certificates, certificatesList, store;
      store = null;
      certificates = null;
      certificatesList = [];
      return this.get('CAdESCOM.Store').then((function(_this) {
        return function(_store) {
          store = _store;
          return _this.get(store, {
            method: 'Open',
            args: []
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.get(store, 'Certificates');
        };
      })(this)).then((function(_this) {
        return function(_certificates) {
          certificates = _certificates;
          return _this.get(certificates, 'Count');
        };
      })(this)).then((function(_this) {
        return function(count) {
          var chain, j, results;
          if (!count) {
            store.Close();
            return $.Deferred(function() {
              return this.reject('certificates_not_found');
            });
          }
          chain = $.when();
          $.each((function() {
            results = [];
            for (var j = 1; 1 <= count ? j <= count : j >= count; 1 <= count ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this), function(i, index) {
            var certificate;
            certificate = null;
            return chain = chain.then(function() {
              return _this.get(certificates, {
                method: 'Item',
                args: [index]
              });
            }).then(function(certificate_) {
              certificate = certificate_;
              return $.when(_this.get(certificate, 'SubjectName'), _this.get(certificate, 'IssuerName'), _this.get(certificate, 'ValidFromDate'), _this.get(certificate, 'ValidToDate'), _this.get(certificate, {
                method: 'PublicKey',
                args: []
              }, 'Algorithm', 'FriendlyName'), _this.get(certificate, {
                method: 'HasPrivateKey',
                args: []
              }), _this.get(certificate, {
                method: 'IsValid',
                args: []
              }, 'Result'), _this.get(certificate, 'Thumbprint'), _this.get(certificate, {
                method: 'PublicKey',
                args: []
              }, 'Algorithm', 'Value'));
            }).then(function (subject, issuer, validFrom, validTo, algorithm, hasPrivateKey, isValid, thumbprint, algorithmValue) {
              return certificatesList.push({
                subject: subject,
                issuer: issuer,
                validFrom: validFrom,
                validTo: validTo,
                algorithm: algorithm,
                hasPrivateKey: hasPrivateKey,
                isValid: isValid,
                thumbprint: thumbprint,
                certificate: certificate,
                algorithmValue: algorithmValue
              });
            }).then(null, function() {
              return $.Deferred(function() {
                return this.reject('certificate_read_error');
              });
            });
          });
          return chain;
        };
      })(this)).then((function(_this) {
        return function() {
          if (!certificatesList.length) {
            return $.Deferred(function() {
              return this.reject('valid_certificates_not_found');
            });
          } else {
            return certificatesList;
          }
        };
      })(this));
    };


    /**
     Подписывает данные
     @method signData
     @param data [String} Строка которую надо зашифровать (подписать)
     @param certificate {Object} Объект сертификата полученный из плагина
     @return {jQuery.Deferred} В первый аргумент колбэка передается зашифрованная строка
     */

    _Class.prototype.signData = function(data, certificate) {
      var signedData, signer;
      signer = null;
      signedData = null;
      return this.get('CAdESCOM.CPSigner').then((function(_this) {
        return function(signer_) {
          var attribute1, attribute2;
          signer = signer_;
          if (!_this.isWebkit && !_this.isFireFox) {
            return;
          }
          attribute1 = null;
          attribute2 = null;
          return _this.get('CAdESCOM.CPAttribute').then(function(attribute1_) {
            attribute1 = attribute1_;
            return _this.set(attribute1, 'Name', 0);
          }).then(function() {
            return _this.set(attribute1, 'Value', new Date());
          }).then(function() {
            return _this.get(signer, 'AuthenticatedAttributes2', {
              method: 'Add',
              args: [attribute1]
            });
          }).then(function() {
            return _this.get('CADESCOM.CPAttribute');
          }).then(function(attribute2_) {
            attribute2 = attribute2_;
            return _this.set(attribute2, 'Name', 1);
          }).then(function() {
            return _this.set(attribute2, 'Value', 'Document Name');
          }).then(function() {
            return _this.get(signer, 'AuthenticatedAttributes2', {
              method: 'Add',
              args: [attribute2]
            });
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.set(signer, 'Certificate', certificate);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.get('CAdESCOM.CadesSignedData');
        };
      })(this)).then((function(_this) {
        return function(signedData_) {
          signedData = signedData_;
          return _this.set(signedData, 'Content', data);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.set(signer, 'Options', 1);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.get(signedData, {
            method: 'SignCades',
            args: [signer, 1]
          });
        };
      })(this)).then((function(_this) {
        return function(signature) {
          return signature;
        };
      })(this));
    };

    _Class.prototype.signDataXml = function(data, certificate) {
      var thiz = this;
      var signedData, signer;
      signer = null;
      signedData = null;
      return this.get('CAdESCOM.CPSigner').then((function(_this) {
        return function(signer_) {
          var attribute1, attribute2;
          signer = signer_;
          if (!_this.isWebkit && !_this.isFireFox) {
            return;
          }
          attribute1 = null;
          attribute2 = null;
          return _this.get('CAdESCOM.CPAttribute').then(function(attribute1_) {
            attribute1 = attribute1_;
            return _this.set(attribute1, 'Name', 0);
          }).then(function() {
            return _this.set(attribute1, 'Value', new Date());
          }).then(function() {
            return _this.get(signer, 'AuthenticatedAttributes2', {
              method: 'Add',
              args: [attribute1]
            });
          }).then(null, function (message) {
            return thiz.checkMessage(message, 'Не удалось проставить метку времени');
          }).then(function() {
            return _this.get('CADESCOM.CPAttribute');
          }).then(function(attribute2_) {
            attribute2 = attribute2_;
            return _this.set(attribute2, 'Name', 1);
          }).then(function() {
            return _this.set(attribute2, 'Value', 'Document Name');
          }).then(function() {
            return _this.get(signer, 'AuthenticatedAttributes2', {
              method: 'Add',
              args: [attribute2]
            })
          }).then(null, function (message) {
            return thiz.checkMessage(message, 'Не удалось сформировать название подписываемого документа');
          });
        };
      })(this)).then(null, function (message) {
        return thiz.checkMessage(message, 'Не удалось инициализировать процессор ЭЦП (CAdESCOM.CPSigner)');
      }).then((function(_this) {
        return function() {
          return _this.set(signer, 'Certificate', certificate);
        };
      })(this)).then(null, function (message) {
        return thiz.checkMessage(message, 'Не удалось обработать сертификат');
      }).then((function(_this) {
        return function() {
          return _this.get('CAdESCOM.SignedXML');
        };
      })(this)).then(null, function (message) {
        return thiz.checkMessage(message, 'Не удалось получить подписанный документ (CAdESCOM.SignedXML)');
      }).then((function(_this) {
        return function(signedData_) {
          signedData = signedData_;
          return _this.set(signedData, 'SignatureType', 2);
        };
      })(this)).then(null, function (message) {
        return thiz.checkMessage(message, 'Не удалось установить корректный тип подписи');
      }).then((function(_this) {
        return function() {
          return _this.set(signedData, 'Content', data);
        };
      })(this)).then(null, function (message) {
        return thiz.checkMessage(message, 'Не удалось обработать данные документа на подпись');
      }).then((function(_this) {
        return function() {
          return _this.get(signedData, {
            method: 'Sign',
            args: [signer]
          });
        };
      })(this)).then(null, function (message) {
        return thiz.checkMessage(message, 'Не удалось сформировать ЭП');
      }).then((function(_this) {
        return function(signature) {
          return signature;
        };
      })(this));
    };

    _Class.prototype.checkMessage = function(message, customMessage) {
      var mes = null;
      if(!message || !message.customMessage) {
        mes = {
          customMessage: customMessage
        }
      }
      return $.Deferred().reject(mes ? mes : message);
    };

    _Class.prototype.verifyXml = function(data) {
      var oSignedXML, oData;
      oData = data;
      oSignedXML  = null;
      return this.get('CAdESCOM.SignedXML').then((function(_this) {
        return function(signer) {
          oSignedXML = signer;
          return _this.get(oSignedXML, {
            method: 'Verify',
            args: [oData]
          });
        };
      })(this)).then((function(_this) {
        return function(result) {
          return 'Проверка подписи прошла успешно';
        };
      })(this));
    };

    _Class.prototype.importCert = function(data) {
      var oStore, oSert;
      var pKey = data ;
      return this.get('CAdESCOM.Certificate').then((function(_this) {
        return function(cert) {
          oSert = cert;
          return _this.get(oSert, {
            method: 'Import',
            args: [pKey]
          });
        };
      })(this)).then((function(_this) {
        return function(sert) {
          return $.when(_this.get(oSert, 'SubjectName'), _this.get(oSert, 'IssuerName'), _this.get(oSert, 'ValidFromDate'), _this.get(oSert, 'ValidToDate'), _this.get(oSert, {
            method: 'PublicKey',
            args: []
          }, 'Algorithm', 'FriendlyName'), _this.get(oSert, {
            method: 'HasPrivateKey',
            args: []
          }), _this.get(oSert, {
            method: 'IsValid',
            args: []
          }, 'Result'), _this.get(oSert, 'Thumbprint'));
        };
      })(this)).then((function(_this) {
        return function(subject, issuer, validFrom, validTo, algorithm, hasPrivateKey, isValid, thumbprint) {
          if ((new Date()) < (new Date(validTo))) {
          }
          else
            return 'Сертификат полученных данных просрочен.'
        };
      })(this));
    };

    /**
     Подписывает данные и формирует отсоединённую подпись
     @method signDataDetach
     @param data [String} Строка которую надо зашифровать (подписать)
     @param certificate {Object} Объект сертификата полученный из плагина
     @param tspServerUrl [String} Адрес службы штампов времени
     @return {jQuery.Deferred} В первый аргумент колбэка передается зашифрованная строка
     */
    _Class.prototype.signDataDetach = function(data, certificate, tspServerUrl) {
      var signedData, signer;
      signer = null;
      signedData = null;
      return this.get('CAdESCOM.CPSigner').then((function(_this) {
        return function(signer_) {
          var attribute1, attribute2;
          signer = signer_;
          if (!_this.isWebkit && !_this.isFireFox) {
            return;
          }
          attribute1 = null;
          attribute2 = null;
          return _this.get('CAdESCOM.CPAttribute').then(function(attribute1_) {
            attribute1 = attribute1_;
            return _this.set(attribute1, 'Name', 0);
          }).then(function() {
            return _this.set(attribute1, 'Value', new Date());
          }).then(function() {
            return _this.get(signer, 'AuthenticatedAttributes2', {
              method: 'Add',
              args: [attribute1]
            });
          }).then(null, function (message) {
            return _this.checkMessage(message, 'Не удалось проставить метку времени');
          }).then(function() {
            return _this.get('CADESCOM.CPAttribute');
          }).then(function(attribute2_) {
            attribute2 = attribute2_;
            return _this.set(attribute2, 'Name', 1);
          }).then(function() {
            return _this.set(attribute2, 'Value', 'Document Name');
          }).then(function() {
            return _this.get(signer, 'AuthenticatedAttributes2', {
              method: 'Add',
              args: [attribute2]
            });
          }).then(null, function (message) {
            return _this.checkMessage(message, 'Не удалось сформировать название подписываемого документа');
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return (tspServerUrl) ? _this.set(signer, 'TSAAddress', tspServerUrl) : _this.get(signer, 'TSAAddress');
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.set(signer, 'Certificate', certificate);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.get('CAdESCOM.CadesSignedData');
        };
      })(this)).then((function(_this) {
        return function(signedData_) {
          signedData = signedData_;
          // Значение свойства ContentEncoding должно быть задано
          // до заполнения свойства Content
          return _this.set(signedData, 'ContentEncoding', 1);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.set(signedData, 'Content', data);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.get(signedData, {
            method: 'SignCades',
            args: [signer, tspServerUrl ? 5 : 1, true]
          });
        };
      })(this)).then((function(_this) {
        return function(signature) {
          return signature;
        };
      })(this));
    };

    return _Class;

  })();

  return AltCadesPlugin;
}));
