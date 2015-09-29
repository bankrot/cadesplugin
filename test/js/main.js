var $logBlock, altCadesPlugin, certificatesList, init, signData;

altCadesPlugin = null;

certificatesList = null;

$logBlock = null;

init = (function(_this) {
  return function() {
    var deferred;
    $logBlock = $('#ui-log-block');
    altCadesPlugin = new AltCadesPlugin();
    $logBlock.append('<h3>Проверка наличия плагина<h3>');
    if (bowser.chrome || bowser.firefox || bowser.msie) {
      deferred = altCadesPlugin.init();
    } else {
      deferred = $.Deferred(function() {
        return this.reject('Браузер не поддерживается');
      });
    }
    return deferred.then(function() {
      $logBlock.append('<p>Плагин подключен<p>');
      return $.when(altCadesPlugin.getVersion(), $.get('/sites/default/files/products/cades/latest_2_0.txt'));
    }).then(function(installedVersion, currentVersion) {
      var ref;
      if (installedVersion.full === ((ref = currentVersion[0]) != null ? ref.trim() : void 0)) {
        $logBlock.append('<p>У вас последняя версия плагина (' + installedVersion.full + ')<p>');
      } else {
        $logBlock.append('<p>У вас не последняя версия плагина. Рекомендуем обновить.<p>');
      }
      return altCadesPlugin.getCSPVersion();
    }).then(function(cspVersion) {
      $logBlock.append('<p>Версия CSP (' + cspVersion.full + ')<p>');
      return altCadesPlugin.getCertificates();
    }).then(function(certificatesList_) {
      var selectHtml;
      certificatesList = certificatesList_;
      $logBlock.append('<p>Количество валидных сертификатов ' + +certificatesList.length + '<p>');
      selectHtml = '<p><select id="ui-certificates-select">';
      $.each(certificatesList, function(index, certificate) {
        return selectHtml += '<option value="' + index + '">' + certificate.subject + ' ' + certificate.validFrom + '</option>';
      });
      selectHtml += '</select></p>';
      return $logBlock.append(selectHtml);
    }).then(function() {
      $logBlock.append("<p>\n  Введите данные которые надо подписать\n  <br>\n  <input id=\"ui-data-input\" style=\"width: 500px;\" value=\"Hello World\">\n</p>\n<p>\n  <button type=\"button\" id=\"ui-sign-button\">Подписать</button>\n</p>");
      return $('#ui-sign-button').on('click', signData);
    }).fail(function(message) {
      if (message) {
        return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
      }
    });
  };
})(this);


/**
Подписывает данные введенные в поле ввода
@method signData
 */

signData = function() {
  var certificateIndex, data;
  certificateIndex = +$('#ui-certificates-select').val();
  data = $('#ui-data-input').val();
  if (!data) {
    alert('Введите данные для подписывания');
    return;
  }
  return altCadesPlugin.signData(data, certificatesList[certificateIndex].certificate).then(function(signature) {
    return $logBlock.append('<pre>' + signature + '</pre>');
  }).fail(function(message) {
    if (message) {
      return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
    }
  });
};

$(init);
