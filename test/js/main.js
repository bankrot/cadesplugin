var init;

init = (function(_this) {
  return function() {
    var $logBlock, $signBlock, altCadesPlugin, deferred;
    $logBlock = $('#ui-log-block');
    $signBlock = $('#ui-sign-block');
    altCadesPlugin = new AltCadesPlugin();
    $logBlock.append('<h3>Проверка наличия плагина<h4>');
    if (bowser.chrome && bowser.version >= 40) {
      deferred = altCadesPlugin.nonNpapiInit();
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
        paramName: 'CSPVersion',
        options: ['', 75]
      }, 'MajorVersion'), altCadesPlugin.get('CAdESCOM.About', {
        paramName: 'CSPVersion',
        options: ['', 75]
      }, 'MinorVersion'), altCadesPlugin.get('CAdESCOM.About', {
        paramName: 'CSPVersion',
        options: ['', 75]
      }, 'BuildVersion'));
    }).then(function(majorVersion, minorVersion, buildVersion) {
      var certificates, certificatesList, installedCspVersion, store;
      installedCspVersion = majorVersion + '.' + minorVersion + '.' + buildVersion;
      $logBlock.append('<p>Версия CSP (' + installedCspVersion + ')<p>');
      store = null;
      certificates = null;
      certificatesList = [];
      return altCadesPlugin.createObject('CAdESCOM.Store').then(function(_store) {
        store = _store;
        return altCadesPlugin.get(store, {
          paramName: 'Open',
          options: []
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
          return chain = chain.then(function() {
            return altCadesPlugin.get(certificates, {
              paramName: 'Item',
              options: [index]
            });
          }).then(function(certificate) {
            return $.when(altCadesPlugin.get(certificate, 'ValidFromDate'), altCadesPlugin.get(certificate, 'ValidToDate'), altCadesPlugin.get(certificate, {
              paramName: 'HasPrivateKey',
              options: []
            }), altCadesPlugin.get(certificate, {
              paramName: 'IsValid',
              options: []
            }, 'Result'), altCadesPlugin.get(certificate, 'SubjectName'));
          }).then(function(validFromDate, validToDate, hasPrivateKey, isValid, subjectName) {
            var date;
            date = new Date();
            validToDate = new Date(validToDate);
            if (date < validToDate && hasPrivateKey && isValid) {
              return certificatesList.push({
                subjectName: subjectName,
                validFromDate: validFromDate
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
            return selectHtml += '<option>' + certificate.subjectName + ' ' + certificate.validFromDate + '</option>';
          });
          selectHtml += '</select></p>';
          return $logBlock.append(selectHtml);
        }
      });
    }).then(function() {
      return $signBlock.show();
    }).fail(function(message) {
      return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
    });
  };
})(this);

$(init);
