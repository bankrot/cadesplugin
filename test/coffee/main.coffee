altCadesPlugin = null
certificatesList = null
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
  certificateIndex = +$('#ui-certificates-select').val()
  data = $('#ui-data-input').val()
  unless data
    alert 'Введите данные для подписывания'
    return
  altCadesPlugin.signData data, certificatesList[certificateIndex].certificate
  .then (signature)->
    $logBlock.append '<pre>' + signature + '</pre>'
  .fail (message)->
    if message
      $logBlock.append '<p style="color: #E23131">' + message + '<p>'

$ init