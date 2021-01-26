# Cadesplugin (0.0.8 beta)

### Альтернативная библиотека для работы с [браузерным плагином от КриптоПРО](https://www.cryptopro.ru/sites/default/files/products/cades/demopage/main.html).

Поддерживает плагин начиная с версии 2

Последняя версия библиотеки протестирована с плагином версии 2.0.14071

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

Для корректной работы скрипта необходимы следующие библиотеки

1. [jquery](https://github.com/jquery/jquery)
2. [es6-promise](https://github.com/jakearchibald/es6-promise)

#### Использование

Для начала создаем экземпляр класса AltCadesPlugin

    var altCadesPlugin;
    altCadesPlugin = new AltCadesPlugin()

#### Следующим шагом инициализировать

    altCadesPlugin.nonNpapiInit()
    .then(function(){
        Следующий код уже будет в колбэках промисов
        ...
    });

#### Получение данных (метод get)

    altCadesPlugin.get('CAdESCOM.About').then(function(aboutObject){
        В этом колбэке доступна переменная aboutObject, в которой хранится только что созданный объект
    });

#### Получение цепочки данных (метод get)

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

#### Запись данных (метод set)

Запишет значение 0 в параметр Name объекта CAdESCOM.CPAttribute

Если плагин работает без NPAPI то не надо заботиться о подставлении префикса propset_, это делается автоматически

    altCadesPlugin.get('CAdESCOM.CPAttribute')
    .then(function(attribute){
        altCadesPlugin.set(attribute, 'Name', 0);
    });

### Получение версии плагина (метод getVersion)

    altCadesPlugin.getVersion()
    .then(function(version){
        version.major; // 2
        version.minor; // 0
        version.build; // 12245
        version.full; // 2.0.12245
    });

### Получение версии КриптоПРО CSP (метод getCSPVersion)

    altCadesPlugin.getCSPVersion()
    .then(function(version){
        version.major; // 4
        version.minor; // 0
        version.build; // 9630
        version.full; // 4.0.9630
    });

### Получение списка сертификатов (метод getCertificates)

    altCadesPlugin.getCertificates()
    .then(function(certificates){
        certificates.subject; // владелец сертификата
        certificates.issuer; // издатель сертификата
        certificates.validFrom; // дата начала действия сертификата, дата выдачи
        certificates.validTo; // дата окночания действия сертификата
        certificates.algorithm; // алгоритм шифрования
        certificates.hasPrivateKey; // наличие закрытого ключа
        certificates.isValid; // валидность
        certificates.thumbprint; // слепок, хэш
        certificates.certificate; // объект сертификата
    });

### Подписывание данных (метод signData)

    altCadesPlugin.getCertificates()
    .then(function(certificates){
        certificate = certificates[0].certificate;
        altCadesPlugin.signData('Hello World!', certificate);
    }).then(function(signature){
        alert(signature);
    });

## Как запустить тестовый сервер для проверки

1. Скачиваем весь репозиторий или клонируем (git clone ...)
2. Устанавливаем (если не установлена) node.js
3. Устанавливаем глобально следующие npm-пакеты: gulp, gulp-cli

    `npm install -g gulp`

    `npm install -g gulp-cli`

4. Устанавливаем зависимости проекта

    `npm install`

5. Запускаем сервер

    `gulp webserver`

6. Тестовая страница будет доступна по адресу: http://localhost:8080/