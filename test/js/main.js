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
      return altCadesPlugin.getParam('CAdESCOM.About', 'PluginVersion');
    }).then(function(pluginVersion) {
      return $.when(altCadesPlugin.getParam(pluginVersion, 'MajorVersion'), altCadesPlugin.getParam(pluginVersion, 'MinorVersion'), altCadesPlugin.getParam(pluginVersion, 'BuildVersion'), $.get('/sites/default/files/products/cades/latest_2_0.txt'));
    }).then(function(majorVersion, minorVersion, buildVersion, currentVersion) {
      var installedVersion, ref;
      installedVersion = majorVersion + '.' + minorVersion + '.' + buildVersion;
      if (installedVersion === ((ref = currentVersion[0]) != null ? ref.trim() : void 0)) {
        $logBlock.append('<p>У вас последняя версия плагина (' + installedVersion + ')<p>');
      } else {
        return $.Deferred(function() {
          return this.reject('Плагин нужно обновить');
        });
      }
      return $signBlock.show();
    }).fail(function(message) {
      return $logBlock.append('<p style="color: #E23131">' + message + '<p>');
    });
  };
})(this);

$(init);
