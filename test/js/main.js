(function() {
  var init;

  init = (function(_this) {
    return function() {
      var altCadesPlugin, deferred;
      altCadesPlugin = new AltCadesPlugin();
      if (bowser.chrome && bowser.version >= 40) {
        deferred = altCadesPlugin.nonNpapiInit();
      } else {
        deferred = $.Deferred(function() {
          return this.reject('Browser unsupport');
        });
      }
      return deferred.then(function() {
        return alert('OK');
      }).fail(function(message) {
        return alert(message);
      });
    };
  })(this);

  $(init);

}).call(this);
