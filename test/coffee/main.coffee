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

  # проверка версии плагина
  deferred.then ->
    $logBlock.append '<p>Плагин подключен<p>'
    $.when(
      altCadesPlugin.get 'CAdESCOM.About', 'PluginVersion', 'MajorVersion'
      altCadesPlugin.get 'CAdESCOM.About', 'PluginVersion', 'MinorVersion'
      altCadesPlugin.get 'CAdESCOM.About', 'PluginVersion', 'BuildVersion'
      $.get '/sites/default/files/products/cades/latest_2_0.txt'
    )

  # проверка версии CSP
  .then (majorVersion, minorVersion, buildVersion, currentVersion)->
    installedVersion = majorVersion + '.' + minorVersion + '.' + buildVersion
    if installedVersion is currentVersion[0]?.trim()
      $logBlock.append '<p>У вас последняя версия плагина (' + installedVersion + ')<p>'
    else
      $logBlock.append '<p>У вас не последняя версия плагина. Рекомендуем обновить.<p>'

    $.when(
      altCadesPlugin.get 'CAdESCOM.About', {paramName: 'CSPVersion', options: ['', 75]}, 'MajorVersion'
      altCadesPlugin.get 'CAdESCOM.About', {paramName: 'CSPVersion', options: ['', 75]}, 'MinorVersion'
      altCadesPlugin.get 'CAdESCOM.About', {paramName: 'CSPVersion', options: ['', 75]}, 'BuildVersion'
    )

  # получение списка сертификатов
  .then (majorVersion, minorVersion, buildVersion)->
    installedCspVersion = majorVersion + '.' + minorVersion + '.' + buildVersion
    $logBlock.append '<p>Версия CSP (' + installedCspVersion + ')<p>'

    store = null
    certificates = null
    altCadesPlugin.createObject 'CAdESCOM.Store'
    .then (_store)->
      store = _store
      altCadesPlugin.get store, {paramName: 'Open', options: []}
    .then ->
      altCadesPlugin.get store, 'Certificates'
    .then (_certificates)->
      certificates = _certificates
      altCadesPlugin.get certificates, 'Count'
    .then (count)->
      $logBlock.append '<p>Количество сертификатов ' + +count + '<p>'

  .then ->
    $signBlock.show()

  .fail (message)->
    $logBlock.append '<p style="color: #E23131">' + message + '<p>'

$ init