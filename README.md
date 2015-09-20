# cadesplugin
Альтернативная библиотека для работы с плагином от КриптоПРО.

Заменяет родную cadesplugin_api.js (http://www.cryptopro.ru/sites/default/files/products/cades/cadesplugin_api.js)

Отличия от родной библиотеки:
1. Не запускает проверку плагина сразу при загрузке файла
2. Использует jQuery.Deferred вместо нативных промисов
