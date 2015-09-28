var $logBlock, altCadesPlugin, certificates, certificatesList, init, signData, store;

altCadesPlugin = null;

store = null;

certificates = null;

certificatesList = [];

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
      return $.when(altCadesPlugin.get('CAdESCOM.About', 'PluginVersion', 'MajorVersion'), altCadesPlugin.get('CAdESCOM.About', 'PluginVersion', 'MinorVersion'), altCadesPlugin.get('CAdESCOM.About', 'PluginVersion', 'BuildVersion'), $.get('/sites/default/files/products/cades/latest_2_0.txt'));
    }).then(function(majorVersion, minorVersion, buildVersion, currentVersion) {
      var installedVersion, ref;
      installedVersion = majorVersion + '.' + minorVersion + '.' + buildVersion;
      if (installedVersion === ((ref = currentVersion[0]) != null ? ref.trim() : void 0)) {
        $logBlock.append('<p>У вас последняя версия плагина (' + installedVersion + ')<p>');
      } else {
        $logBlock.append('<p>У вас не последняя версия плагина. Рекомендуем обновить.<p>');
      }
      return $.when(altCadesPlugin.get('CAdESCOM.About', {
        method: 'CSPVersion',
        args: ['', 75]
      }, 'MajorVersion'), altCadesPlugin.get('CAdESCOM.About', {
        method: 'CSPVersion',
        args: ['', 75]
      }, 'MinorVersion'), altCadesPlugin.get('CAdESCOM.About', {
        method: 'CSPVersion',
        args: ['', 75]
      }, 'BuildVersion'));
    }).then(function(majorVersion, minorVersion, buildVersion) {
      var installedCspVersion;
      installedCspVersion = majorVersion + '.' + minorVersion + '.' + buildVersion;
      $logBlock.append('<p>Версия CSP (' + installedCspVersion + ')<p>');
      return altCadesPlugin.get('CAdESCOM.Store').then(function(_store) {
        store = _store;
        return altCadesPlugin.get(store, {
          method: 'Open',
          args: []
        });
      }).then(function() {
        return altCadesPlugin.get(store, 'Certificates');
      }).then(function(_certificates) {
        certificates = _certificates;
        return altCadesPlugin.get(certificates, 'Count');
      }).then(function(count) {
        var chain, j, results;
        if (!count) {
          store.Close();
          return $.Deferred(function() {
            return this.reject('Не установлено ни одного сертификата');
          });
        }
        $logBlock.append('<p>Количество сертификатов ' + +count + '<p>');
        chain = $.when();
        $.each((function() {
          results = [];
          for (var j = 1; 1 <= count ? j <= count : j >= count; 1 <= count ? j++ : j--){ results.push(j); }
          return results;
        }).apply(this), function(i, index) {
          var certificate;
          certificate = null;
          return chain = chain.then(function() {
            return altCadesPlugin.get(certificates, {
              method: 'Item',
              args: [index]
            });
          }).then(function(certificate_) {
            certificate = certificate_;
            return $.when(altCadesPlugin.get(certificate, 'ValidFromDate'), altCadesPlugin.get(certificate, 'ValidToDate'), altCadesPlugin.get(certificate, {
              method: 'HasPrivateKey',
              args: []
            }), altCadesPlugin.get(certificate, {
              method: 'IsValid',
              args: []
            }, 'Result'), altCadesPlugin.get(certificate, 'SubjectName'), altCadesPlugin.get(certificate, 'Thumbprint'));
          }).then(function(validFromDate, validToDate, hasPrivateKey, isValid, subjectName, thumbprint) {
            var date;
            date = new Date();
            validToDate = new Date(validToDate);
            if (date < validToDate && hasPrivateKey && isValid) {
              return certificatesList.push({
                subjectName: subjectName,
                validFromDate: validFromDate,
                thumbprint: thumbprint,
                certificate: certificate
              });
            }
          }).then(null, function() {
            return $logBlock.append('<p style="color: #C3940A">Ошибка при чтении сертификата<p>');
          });
        });
        return chain;
      }).then(function() {
        var selectHtml;
        if (!certificatesList.length) {
          return $.Deferred(function() {
            return this.reject('Не найдено ни одного валидного сертификата');
          });
        } else {
          $logBlock.append('<p>Количество валидных сертификатов ' + +certificatesList.length + '<p>');
          selectHtml = '<p><select id="ui-certificates-select">';
          $.each(certificatesList, function(index, certificate) {
            return selectHtml += '<option value="' + index + '">' + certificate.subjectName + ' ' + certificate.validFromDate + '</option>';
          });
          selectHtml += '</select></p>';
          return $logBlock.append(selectHtml);
        }
      });
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
  var attribute, attribute2, certificateIndex, data, signedData, signer;
  signer = null;
  attribute = null;
  attribute2 = null;
  certificateIndex = +$('#ui-certificates-select').val();
  data = $('#ui-data-input').val();
  signedData = null;
  if (!data) {
    alert('Введите данные для подписывания');
    return;
  }
  return $.when(altCadesPlugin.get('CAdESCOM.CPSigner'), altCadesPlugin.get('CAdESCOM.CPAttribute')).then(function(signer_, attribute_) {
    signer = signer_;
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    attribute = attribute_;
    return altCadesPlugin.set(attribute, 'Name', 0);
  }).then(function() {
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    return altCadesPlugin.set(attribute, 'Value', new Date());
  }).then(function() {
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    return altCadesPlugin.get(signer, 'AuthenticatedAttributes2', {
      method: 'Add',
      args: [attribute]
    });
  }).then(function() {
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    return altCadesPlugin.get('CADESCOM.CPAttribute');
  }).then(function(attribute2_) {
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    attribute2 = attribute2_;
    return altCadesPlugin.set(attribute2, 'Name', 1);
  }).then(function() {
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    return altCadesPlugin.set(attribute2, 'Value', 'Document Name');
  }).then(function() {
    if (!altCadesPlugin.isWebkit) {
      return;
    }
    return altCadesPlugin.get(signer, 'AuthenticatedAttributes2', {
      method: 'Add',
      args: [attribute2]
    });
  }).then(function() {
    return altCadesPlugin.set(signer, 'Certificate', certificatesList[certificateIndex].certificate);
  }).then(function() {
    return altCadesPlugin.get('CAdESCOM.CadesSignedData');
  }).then(function(signedData_) {
    signedData = signedData_;
    return altCadesPlugin.set(signedData, 'Content', data);
  }).then(function() {
    return altCadesPlugin.set(signer, 'Options', 1);
  }).then(function() {
    return altCadesPlugin.get(signedData, {
      method: 'SignCades',
      args: [signer, 1]
    });
  }).then(function(signature) {
    return $logBlock.append('<pre>' + signature + '</pre>');
  }).fail(function(message) {
    if (message) {
      return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
    }
  });
};

$(init);
