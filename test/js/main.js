(function() {
  var init;

  init = (function(_this) {
    return function() {
      var altCadesPlugin;
      altCadesPlugin = new AltCadesPlugin();
      return altCadesPlugin.chromeInit().then(function() {
        return alert('OK');
      }).fail(function() {
        return aler('fail');
      });
    };
  })(this);

  $(init);

}).call(this);
