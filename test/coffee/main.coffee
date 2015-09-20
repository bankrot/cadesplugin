init = =>

  altCadesPlugin = new AltCadesPlugin()

  altCadesPlugin.chromeInit()
  .then ->
    alert 'OK'
  .fail ->
    aler 'fail'

$ init