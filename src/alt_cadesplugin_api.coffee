###*
Библиотека для работы с плагином КриптоПРО
Версия 0.0.1 (в разработке)
Поддерживает плагин версии 2.0.12245
Репозиторий https://github.com/bankrot/cadesplugin
###

if jquery and not $
  $ = jquery

AltCadesPlugin = class

  ###*
  Если TRUE значит плагин уже был проверен
  @property checked
  @type {Boolean}
  @default false
  ###
  checked: false

  ###*
  К этому объекту будет обращаться скрипт плагина
  @property cadesplugin
  @type {Object}
  ###
  cadesplugin: {}

  ###*
  DOM элемент плагина
  @property pluginObject
  ###
  pluginObject: null

  ###*
  Время ожидания ответа от плагина
  @property timeout
  @type {Number}
  ###
  timeout: 20000

  ###*
  Конструктор
  @method constructor
  @param options {Object} Опции
  @param [options.timeout] {Number} Время ожидания ответа плагина, в мс. По умолчанию 20000
  ###
  constructor: (options = {})->
    if options.timeout
      @timeout = options.timeout

    @cadesplugin.JSModuleVersion = '2.0'
    @cadesplugin.async_spawn = @asyncSpawn
    @cadesplugin.set = (object)=>
      @pluginObject = object
    window.cadesplugin = @cadesplugin

  ###*
  Необходимый метод, его вызывает скрипт плагина
  @method asyncSpawn
  @param generatorFunc {Function} Колбэк
  ###
  asyncSpawn: (generatorFunc)->
    continuer = (verb, arg)->
      try
        result = generator[verb](arg)
      catch err
        return Promise.reject(err)
      if result.done
        return result.value
      else
        return Promise.resolve(result.value).then onFulfilled, onRejected
    generator = generatorFunc(Array.prototype.slice.call(arguments, 1))
    onFulfilled = continuer.bind continuer, 'next'
    onRejected = continuer.bind continuer, 'throw'
    return onFulfilled()

  ###*
  Инициализирует работу плагина в браузере без NPAPI (Например Google Chrome)
  @method nonNpapiInit
  @return {jQuery.Deferred} Deferred объект
  ###
  nonNpapiInit: =>
    # подключаем файл из плагина
    $('head').append '<script src="chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js"></script>'

    deferred = $.Deferred()

    window.postMessage 'cadesplugin_echo_request', '*'

    # sucess callback
    success = =>
      @checked = true
      deferred.resolve()

    # fail callback
    fail = (message)=>
      @checked = true
      deferred.reject message

    # обработчик события по загрузке плагина
    listener = (event)->
      if event.data isnt 'cadesplugin_loaded'
        return
      cpcsp_chrome_nmcades.check_chrome_plugin success, fail

    window.addEventListener 'message', listener, false

    # если через @timeout мс плагин все еще не вернул ответ, значит ошибка
    setTimeout (=>
      unless @checked
        deferred.reject 'timeout'
    ), @timeout

    return deferred

  ###*
  Создает объект плагина по названию
  @method createObject
  @param name {String} Название объекта
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
  ###
  createObject: (name)=>
    deferred = $.Deferred()
    @pluginObject.CreateObjectAsync name
    .then (value)->
      deferred.resolve value
    , (value)->
      deferred.reject value
    return deferred

  ###*
  Возвращает параметр из объекта
  @method getParam
  @param objectName {Object|String} Уже созданный объект, или ранее полученный параметр, или название объекта
  @param paramName {Object|String} Имя параметра.
    Или объект с ключами paramName и options на случай если параметр нужно получить через выполнение функции
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
  ###
  getParam: (objectName, paramName)=>

    param = (_object, _param)->
      if typeof _param is 'object'
        return _object[_param.paramName].apply null, _param.options
      else
        p = _object[_param]
        return p

    deferred = $.Deferred()

    if typeof objectName is 'string'
      chain = @pluginObject.CreateObjectAsync objectName
      .then (object)->
        param object, paramName
    else
      chain = param objectName, paramName

    chain.then (value)->
      deferred.resolve value
    , (value)->
      deferred.reject value
    return deferred

  ###*
  Возвращает последний параметр из цепочки
  Например вызов altCadesPlugin.get('CAdESCOM.About', 'PluginVersion', 'MajorVersion') вернет MajorVersion в колбэк
  @method get
  @param objectName {Object|String} Уже созданный объект, или ранее полученный параметр, или название объекта
  @param paramName {String} Имя параметра. Таких параметров можно передавать неограниченное количество.
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
  ###
  get: (objectName, paramName, args...)=>
    @getParam objectName, paramName
    .then (object)=>
      if args.length > 0
        args.unshift object
        return @get.apply @, args
      else
        return object