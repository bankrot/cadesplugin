# Cadesplugin (В разработке, не для продакшна)

### Альтернативная библиотека для работы с [браузерным плагином от КриптоПРО](https://www.cryptopro.ru/sites/default/files/products/cades/demopage/main.html).

Поддерживает плагин начиная с версии 2

Последняя версия библиотеки протестирована с плагином версии 2.0.12245

Заменяет родную библиотеку [cadesplugin_api.js](http://www.cryptopro.ru/sites/default/files/products/cades/cadesplugin_api.js)

### Отличия от родной библиотеки

1. Не запускает проверку плагина сразу при загрузке файла
2. Использует jQuery.Deferred вместо нативных промисов
3. Может подключаться к проекту как обычная библиотека, а также как amd/commonjs/node модуль

### Как использовать

#### Загрузить скрипт можно напрямую из репозитория или с помощью bower

В репозитории библитека находится в папке src

src/alt_cadesplugin_api.js

src/alt_cadesplugin_api.min.js

    bower install cadesplugin

#### Подключение скрипта к проекту

    <script src="your_site_name/path_to_script/alt_cadesplugin_api.js"></script>

#### Зависимости

Для корректной работы скрипта нужна библиотека jQuery

#### Использование

Для начала надо создать экземпляр класса AltCadesPlugin

    var altCadesPlugin;
    altCadesPlugin = new AltCadesPlugin()

#### Следующим шагом инициализировать

    altCadesPlugin.nonNpapiInit()
    .then(function(){
        Следующий код уже будет в колбэках промисов
        ...
    });

#### Получение данных

    altCadesPlugin.get('CAdESCOM.About').then(function(aboutObject){
        В этом колбэке доступна переменная aboutObject, в которой хранится только что созданный объект
    });

#### Получение цепочки данных

    altCadesPlugin.get('CAdESCOM.About', 'PluginVersion', 'MajorVersion').then(function(majorVersion){
        В этом колбэке доступна переменная majorVersion, в которой хранится major-версия плагина
    });

При использовании нативной библиотеки код выглядел бы так:

    var about = yield cadesplugin.CreateObjectAsync('CAdESCOM.About');
    var pluginVersion = yield about.PluginVersion;
    var majorVersion = yield pluginVersion.MajorVersion;

#### Если вместо параметра метод

Иногда чтобы получить очередной параметр надо вызвать метод, например (родной код):

    var signingTimeAttr = yield cadesplugin.CreateObjectAsync('CADESCOM.CPAttribute');
    yield signingTimeAttr.propset_Name(0);
    yield signingTimeAttr.propset_Value(timeNow);

С этой библиотекой будет выглядеть так

    var attribute;
    altCadesPlugin.get('CADESCOM.CPAttribute').then(function(attribute_){
        attribute = attribute_;
        altCadesPlugin.get(attribute, {method: 'propset_Name', args: [0]});
    }).then(function(){
        altCadesPlugin.get(attribute, {method: 'propset_Value', args: [timeNow]});
    });

## Как запустить тестовый сервер для проверки

1. Скачиваем весь репозиторий или клонируем (git clone ...)
2. Устанавливаем (если не установлена) node.js
3. Устанавливаем глобально следующие npm-пакеты: gulp, gulp-cli

    `npm install -g gulp`

    `npm install -g gulp-cli`

4. Устанавливаем зависимости проекта

    `npm install`

5. Запускаем сборку

    `gulp build`

6. Запускаем сервер

    `gulp webserver`

7. Тестовая страница будет доступна по адресу: http://localhost:8080/