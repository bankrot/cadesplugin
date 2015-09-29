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
      altCadesPlugin.getVersion()
      $.get '/sites/default/files/products/cades/latest_2_0.txt'
    )

  # проверка версии CSP
  .then (installedVersion, currentVersion)->
    if installedVersion.full is currentVersion[0]?.trim()
      $logBlock.append '<p>У вас последняя версия плагина (' + installedVersion.full + ')<p>'
    else
      $logBlock.append '<p>У вас не последняя версия плагина. Рекомендуем обновить.<p>'

    altCadesPlugin.getCSPVersion()
  .then (cspVersion)->
    $logBlock.append '<p>Версия CSP (' + cspVersion.full + ')<p>'

    altCadesPlugin.getCertificates()
  .then (certificatesList_)->
    certificatesList = certificatesList_

    $logBlock.append '<p>Количество валидных сертификатов ' + +certificatesList.length + '<p>'
    selectHtml = '<p><select id="ui-certificates-select">'
    $.each certificatesList, (index, certificate)->
      selectHtml += '<option value="' + index + '">' + certificate.subject + ' ' +
          certificate.validFrom + '</option>'
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