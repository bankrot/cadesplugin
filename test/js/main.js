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
      var certificates, installedCspVersion, store;
      installedCspVersion = majorVersion + '.' + minorVersion + '.' + buildVersion;
      $logBlock.append('<p>Версия CSP (' + installedCspVersion + ')<p>');
      store = null;
      certificates = null;
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
        return $logBlock.append('<p>Количество сертификатов ' + +count + '<p>');
      });
    }).then(function() {
      return $signBlock.show();
    }).fail(function(message) {
      return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
    });
  };
})(this);

$(init);
