init = =>

  $logBlock = $ '#ui-log-block'
  $signBlock = $ '#ui-sign-block'

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
    altCadesPlugin.getParam 'CAdESCOM.About', 'PluginVersion'

  .then (pluginVersion)->
    $.when(
      altCadesPlugin.getParam pluginVersion, 'MajorVersion'
      altCadesPlugin.getParam pluginVersion, 'MinorVersion'
      altCadesPlugin.getParam pluginVersion, 'BuildVersion'
      $.get '/sites/default/files/products/cades/latest_2_0.txt'
    )

  .then (majorVersion, minorVersion, buildVersion, currentVersion)->
    installedVersion = majorVersion + '.' + minorVersion + '.' + buildVersion
    if installedVersion is currentVersion[0]?.trim()
      $logBlock.append '<p>У вас последняя версия плагина (' + installedVersion + ')<p>'
    else
      return $.Deferred -> @reject 'Плагин нужно обновить'
    $signBlock.show()

  .fail (message)->
    $logBlock.append '<p style="color: #E23131">' + message + '<p>'

$ init