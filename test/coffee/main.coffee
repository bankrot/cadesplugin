init = =>

  altCadesPlugin = new AltCadesPlugin()

  if bowser.chrome and bowser.version >= 40
    deferred = altCadesPlugin.nonNpapiInit()
  else
    deferred = $.Deferred ->
      @reject 'Browser unsupport'

  deferred.then ->
    alert 'OK'
  .fail (message)->
    alert message

$ init