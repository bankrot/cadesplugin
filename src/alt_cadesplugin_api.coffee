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
  Конструктор
  @method constructor
  @param options {Object} Опции
  ###
  constructor: ->
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
    ###*
    Подключаем файл из плагина
    ###
    fileref = document.createElement('script')
    fileref.setAttribute 'type', 'text/javascript'
    fileref.setAttribute 'src', 'chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js'
    document.getElementsByTagName('head')[0].appendChild fileref

    deferred = $.Deferred()

    window.postMessage 'cadesplugin_echo_request', '*'

    ###*
    Отправляем событие что все ок.
    ###
    success = =>
      @checked = true
      deferred.resolve()

    ###*
    Отправляем событие что сломались.
    ###
    fail = (message)=>
      @checked = true
      deferred.reject(message)

    ###*
    Обработчик события по загрузке плагина
    ###
    listener = (event)->
      if event.data isnt 'cadesplugin_loaded'
        return
      cpcsp_chrome_nmcades.check_chrome_plugin success, fail
    window.addEventListener 'message', listener, false

    return deferred


###*
Делаем класс доступным глобально
###
window.AltCadesPlugin = AltCadesPlugin