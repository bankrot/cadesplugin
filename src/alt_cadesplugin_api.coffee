###*
Библиотека для работы с плагином КриптоПРО
Версия 0.0.6 (beta)
Поддерживает плагин версии 2.0.12245
Репозиторий https://github.com/bankrot/cadesplugin
###

if jquery and not $
  $ = jquery

###*
Хранилизе для инстанса
@property altCadespluginApiInstance
@type {AltCadesPlugin}
###
altCadespluginApiInstance = null

###*
@class AltCadesPlugin
###
AltCadesPlugin = class

  ###*
  Если TRUE значит плагин уже был проверен (но не факт что удачно)
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
  Время ожидания ответа от плагина (для версии без NPAPI)
  @property timeout
  @type {Number}
  ###
  timeout: 20000

  ###*
  На основе webkit
  @property isWebkit
  @type {Boolean}
  ###
  isWebkit: do ->
    return navigator.userAgent.match(/chrome/i) or navigator.userAgent.match(/opera/i)

  ###*
  Internet Explorer
  @property isIE
  @type {Boolean}
  ###
  isIE: do ->
    return (navigator.appName is 'Microsoft Internet Explorer') or navigator.userAgent.match(/Trident\/./i)

  ###*
  Конструктор
  @method constructor
  @param options {Object} Опции
  @param [options.timeout] {Number} Время ожидания ответа плагина, в мс. По умолчанию 20000
  ###
  constructor: (options = {})->
    if altCadespluginApiInstance
      return altCadespluginApiInstance

    if options.timeout
      @timeout = options.timeout

    @cadesplugin.JSModuleVersion = '2.0'
    @cadesplugin.async_spawn = @asyncSpawn
    @cadesplugin.set = (object)=>
      @pluginObject = object
    window.cadesplugin = @cadesplugin

    altCadespluginApiInstance = @

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
  @method init
  @return {jQuery.Deferred} Deferred объект
  ###
  init: =>
    # если плагин уже проверен, то возвращаем resolved промис
    if @checked
      return $.when()

    if @isWebkit
      return @initWebkit()
    else
      return @initNpapi()

  ###*
  Инициализирует плагин в webkit-браузерах
  @method initWebkit
  ###
  initWebkit: ->

    # подключаем файл из плагина
    $.getScript 'chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js'
    window.postMessage 'cadesplugin_echo_request', '*'

    deferred = $.Deferred()

    # обработчик события по загрузке плагина
    $(window).on 'message', (event)=>
      if event?.originalEvent?.data isnt 'cadesplugin_loaded'
        return
      setTimeout (->
        cpcsp_chrome_nmcades.check_chrome_plugin (=>
          @checked = true
          deferred.resolve()
        ), ((message)=>
          @checked = true
          deferred.reject message
        )
      ), 0

    # если через @timeout мс плагин все еще не вернул ответ, значит ошибка
    setTimeout (=>
      unless @checked
        deferred.reject 'timeout'
    ), @timeout

    return deferred

  ###*
  Инициализирует плагин в режиме NPAPI
  @method initNpapi
  ###
  initNpapi: ->
    deferred = $.Deferred()
    $(window).on 'load', (event)=>
      @loadNpapiPlugin()
      @checked = true
      result = @checkNpapiPlugin()
      if result is true
        deferred.resolve()
      else
        deferred.reject result
    return deferred

  ###*
  Загружает NPAPI плагин
  @method loadNpapiPlugin
  ###
  loadNpapiPlugin: ->
    object = $ '<object id="cadesplugin_object" type="application/x-cades" style="visibility:hidden;"></object>'
    $('body').append object
    @pluginObject = object[0]

    if @isIE
      ieObject = $ '<object id="certEnrollClassFactory" classid="clsid:884e2049-217d-11da-b2a4-000e7bbb2b09" style="visibility=hidden"></object>'
      $('body').append ieObject

  ###*
  Проверяет плагин и возвращает true если проверка пройдена или строку с кодом ошибки
  @method checkNpapiPlugin
  ###
  checkNpapiPlugin: ->
    try
      @createObject 'CAdESCOM.About'
      return true
    catch error
      # Объект создать не удалось, проверим, установлен ли
      # вообще плагин. Такая возможность есть не во всех браузерах
      mimetype = navigator.mimeTypes['application/x-cades']
      if mimetype
        plugin = mimetype.enabledPlugin
        if plugin
          return 'plugin_not_loaded_but_object_cannot_create'
        else
          return 'error_on_plugin_load'
      else
        return 'plugin_unreachable'

  # Функция активации объектов КриптоПро ЭЦП Browser plug-in
  createObject: (name)->
    if @isIE
      # В Internet Explorer создаются COM-объекты
      if name.match /X509Enrollment/i
        try
          # Объекты CertEnroll создаются через CX509EnrollmentWebClassFactory
          return $('certEnrollClassFactory')[0].CreateObject name
        catch error
          throw 'setup_https_for_x509enrollment'

      # Объекты CAPICOM и CAdESCOM создаются обычным способом
      return new ActiveXObject(name)

    # В Firefox, Safari создаются объекты NPAPI
    return @pluginObject.CreateObject name

  ###*
  Возвращает параметр из объекта
  @method getParam
  @param objectName {Object|String} Уже созданный объект, или ранее полученный параметр, или название объекта
  @param paramName {Object|String} Имя параметра.
    Или объект с ключами method и args на случай если параметр нужно получить через выполнение функции
  @return {jQuery.Deferred} Deferred объект с разультатом выполнения в качестве аргумента колбэка
  ###
  getParam: (objectName, paramName)=>

    deferred = $.Deferred()

    if @isWebkit

      if typeof objectName is 'string'
        nativePromiseChain = @pluginObject.CreateObjectAsync objectName
        .then (object)=>
          if paramName
            @extractParam object, paramName
          else
            return object
      else
        nativePromiseChain = @extractParam objectName, paramName
      nativePromiseChain.then deferred.resolve, deferred.reject

    else

      try
        if typeof objectName is 'string'
          result = @createObject objectName
          if paramName
            result = @extractParam result, paramName
        else
          result = @extractParam objectName, paramName
        deferred.resolve result
      catch error
        deferred.reject error.message

    return deferred

  ###*
  @method extractParam
  @param object
  @param paramName
  ###
  extractParam: (object, param)->
    if typeof param is 'object'
      # Здесь можно было бы использовать object[param.method].apply object, param.args
      # Но в IE у внешних объектов нет матода .apply
      switch param.args.length
        when 0 then object[param.method]()
        when 1 then object[param.method](param.args[0])
        when 2 then object[param.method](param.args[0], param.args[1])
        when 3 then object[param.method](param.args[0], param.args[1], param.args[2])
        when 4 then object[param.method](param.args[0], param.args[1], param.args[2], param.args[3])
    else
      return object[param]

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

  ###*
  Записывает данные в передаваемый объект
  Если плагин работает без NPAPI, то параметр записывается через метод propset_ParamName
  @method set
  @param object {Object} Объект плагина куда надо записать данные
  @param paramName {String} Название записываемого параметра
  @param value Значение параметра
  ###
  set: (object, paramName, value)=>
    if @isWebkit
      param =
        method: 'propset_' + paramName
        args: [value]
      return @get object, param
    else
      deferred = $.Deferred()
      try
        object[paramName] = value
        deferred.resolve()
      catch error
        deferred.reject error.message
      return deferred