(function() {
  var init;

  init = (function(_this) {
    return function() {
      var $logBlock, altCadesPlugin, deferred;
      $logBlock = $('#ui-log-block');
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
        return $logBlock.append('<p>Плагин подключен<p>');
      }).fail(function(message) {
        return $logBlock.append('<p>' + message + '<p>');
      });
    };
  })(this);

  $(init);

}).call(this);
