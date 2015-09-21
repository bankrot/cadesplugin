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
      var installedCspVersion;
      installedCspVersion = majorVersion + '.' + minorVersion + '.' + buildVersion;
      $logBlock.append('<p>Версия CSP (' + installedCspVersion + ')<p>');
      return $signBlock.show();
    }).fail(function(message) {
      return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
    });
  };
})(this);

$(init);
