init = =>

  $logBlock = $ '#ui-log-block'
  $signBlock = $ '#ui-sign-block'

  altCadesPlugin = new AltCadesPlugin()

  # проверка наличия плагина
  $logBlock.append '<h3>Проверка наличия плагина<h4>'
  if bowser.chrome and bowser.version >= 40
    deferred = altCadesPlugin.nonNpapiInit()
  else
    deferred = $.Deferred -> @reject 'Браузер не поддерживается'

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

    store = null # хранилище сертификатов
    certificates = null # сертификаты
    #count = null # количество сертификатов
    certificatesList = []

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
      unless count
        store.Close()
        return $.Deferred -> @reject 'Не установлено ни одного сертификата'
      $logBlock.append '<p>Количество сертификатов ' + +count + '<p>'

      chain = $.when()
      $.each [1..count], (i, index)->
        chain = chain.then ->
          altCadesPlugin.get certificates, {paramName: 'Item', options: [index]}
        .then (certificate)->
          $.when(
            altCadesPlugin.get certificate, 'ValidFromDate'
            altCadesPlugin.get certificate, 'ValidToDate'
            altCadesPlugin.get certificate, {paramName: 'HasPrivateKey', options: []}
            altCadesPlugin.get certificate, {paramName: 'IsValid', options: []}, 'Result'
            altCadesPlugin.get certificate, 'SubjectName'
          )
        .then (validFromDate, validToDate, hasPrivateKey, isValid, subjectName)->
          date = new Date()
          validToDate = new Date(validToDate)
          if date < validToDate and hasPrivateKey and isValid
            certificatesList.push
              subjectName: subjectName
              validFromDate: validFromDate
        .then null, ->
          $logBlock.append '<p style="color: #C3940A">Ошибка при чтении сертификата<p>'

      return chain
    .then ->
      unless certificatesList.length
        return $.Deferred -> @reject 'Не найдено ни одного валидного сертификата'
      else
        $logBlock.append '<p>Количество валидных сертификатов ' + +certificatesList.length + '<p>'
        selectHtml = '<p><select id="ui-certificates-select">'
        $.each certificatesList, (index, certificate)->
          selectHtml += '<option>' + certificate.subjectName + ' ' + certificate.validFromDate + '</option>'
        selectHtml += '</select></p>'
        $logBlock.append selectHtml




  .then ->
    $signBlock.show()

  .fail (message)->
    $logBlock.append '<p style="color: #E23131">' + message + '<p>'

$ init