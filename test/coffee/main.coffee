altCadesPlugin = null
store = null # хранилище сертификатов
certificates = null # сертификаты
certificatesList = []
$logBlock = null

init = =>

  $logBlock = $ '#ui-log-block'

  altCadesPlugin = new AltCadesPlugin()

  # проверка наличия плагина
  $logBlock.append '<h3>Проверка наличия плагина<h3>'
  if bowser.chrome or bowser.firefox or bowser.msie
    deferred = altCadesPlugin.init()
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
      altCadesPlugin.get 'CAdESCOM.About', {method: 'CSPVersion', args: ['', 75]}, 'MajorVersion'
      altCadesPlugin.get 'CAdESCOM.About', {method: 'CSPVersion', args: ['', 75]}, 'MinorVersion'
      altCadesPlugin.get 'CAdESCOM.About', {method: 'CSPVersion', args: ['', 75]}, 'BuildVersion'
    )

  # получение списка сертификатов
  .then (majorVersion, minorVersion, buildVersion)->
    installedCspVersion = majorVersion + '.' + minorVersion + '.' + buildVersion
    $logBlock.append '<p>Версия CSP (' + installedCspVersion + ')<p>'

    altCadesPlugin.get 'CAdESCOM.Store'
    .then (_store)->
      store = _store
      altCadesPlugin.get store, {method: 'Open', args: []}
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
        certificate = null
        chain = chain.then ->
          altCadesPlugin.get certificates, {method: 'Item', args: [index]}
        .then (certificate_)->
          certificate = certificate_
          $.when(
            altCadesPlugin.get certificate, 'ValidFromDate'
            altCadesPlugin.get certificate, 'ValidToDate'
            altCadesPlugin.get certificate, {method: 'HasPrivateKey', args: []}
            altCadesPlugin.get certificate, {method: 'IsValid', args: []}, 'Result'
            altCadesPlugin.get certificate, 'SubjectName'
            altCadesPlugin.get certificate, 'Thumbprint'
          )
        .then (validFromDate, validToDate, hasPrivateKey, isValid, subjectName, thumbprint)->
          date = new Date()
          validToDate = new Date(validToDate)
          if date < validToDate and hasPrivateKey and isValid
            certificatesList.push
              subjectName: subjectName
              validFromDate: validFromDate
              thumbprint: thumbprint
              certificate: certificate
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
          selectHtml += '<option value="' + index + '">' + certificate.subjectName + ' ' +
              certificate.validFromDate + '</option>'
        selectHtml += '</select></p>'
        $logBlock.append selectHtml

  .then ->
    $logBlock.append """
      <p>
        Введите данные которые надо подписать
        <br>
        <input id="ui-data-input" style="width: 500px;" value="Hello World">
      </p>
      <p>
        <button type="button" id="ui-sign-button">Подписать</button>
      </p>
    """
    $('#ui-sign-button').on 'click', signData

  .fail (message)->
    if message
      $logBlock.append '<p style="color: #E23131">' + message + '<p>'

###*
Подписывает данные введенные в поле ввода
@method signData
###
signData = ->
  signer = null
  attribute = null
  attribute2 = null
  certificateIndex = +$('#ui-certificates-select').val()
  data = $('#ui-data-input').val()
  signedData = null
  unless data
    alert 'Введите данные для подписывания'
    return
  $.when(
    altCadesPlugin.get 'CAdESCOM.CPSigner'
    altCadesPlugin.get 'CAdESCOM.CPAttribute'
  ).then (signer_, attribute_)->
    signer = signer_
    unless altCadesPlugin.isWebkit
      return
    attribute = attribute_
    altCadesPlugin.set attribute, 'Name', 0
  .then ->
    unless altCadesPlugin.isWebkit
      return
    altCadesPlugin.set attribute, 'Value', new Date()
  .then ->
    unless altCadesPlugin.isWebkit
      return
    altCadesPlugin.get signer, 'AuthenticatedAttributes2', {method: 'Add', args: [attribute]}
  .then ->
    unless altCadesPlugin.isWebkit
      return
    altCadesPlugin.get 'CADESCOM.CPAttribute'
  .then (attribute2_)->
    unless altCadesPlugin.isWebkit
      return
    attribute2 = attribute2_
    altCadesPlugin.set attribute2, 'Name', 1
  .then ->
    unless altCadesPlugin.isWebkit
      return
    altCadesPlugin.set attribute2, 'Value', 'Document Name'
  .then ->
    unless altCadesPlugin.isWebkit
      return
    altCadesPlugin.get signer, 'AuthenticatedAttributes2', {method: 'Add', args: [attribute2]}
  .then ->
    altCadesPlugin.set signer, 'Certificate', certificatesList[certificateIndex].certificate
  .then ->
    altCadesPlugin.get 'CAdESCOM.CadesSignedData'
  .then (signedData_)->
    signedData = signedData_
    altCadesPlugin.set signedData, 'Content', data
  .then ->
    altCadesPlugin.set signer, 'Options', 1
  .then ->
    altCadesPlugin.get signedData, {method: 'SignCades', args: [signer, 1]}
  .then (signature)->
    $logBlock.append '<pre>' + signature + '</pre>'

  .fail (message)->
    if message
      $logBlock.append '<p style="color: #E23131">' + message + '<p>'

$ init