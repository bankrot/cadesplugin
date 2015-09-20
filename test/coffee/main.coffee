init = =>

  $logBlock = $ '#ui-log-block'

  altCadesPlugin = new AltCadesPlugin()

  # проверка наличия плагина
  $logBlock.append '<h3>Проверка наличия плагина<h4>'
  if bowser.chrome and bowser.version >= 40
    deferred = altCadesPlugin.nonNpapiInit()
  else
    deferred = $.Deferred ->
      @reject 'Браузер не поддерживается'

  deferred.then ->
    $logBlock.append '<p>Плагин подключен<p>'
  .fail (message)->
    $logBlock.append '<p>' + message + '<p>'

$ init