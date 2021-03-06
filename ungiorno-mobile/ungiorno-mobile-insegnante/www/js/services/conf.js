angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.conf', [])

.factory('Config', function ($q, $http, $window, $filter, $rootScope) {

  var DEVELOPMENT = false;
  var URL = 'https://' + (DEVELOPMENT ? 'dev' : 'tn') + '.smartcommunitylab.it';//192.168.43.202
  // var URL = 'http://localhost:8080';
  var timeout = 100000;
  var fakeId = '23655';

  var app = 'ungiorno'
    //var appId = 'trento'

  var APP_BUILD = '';

  var mapJsonConfig = null;
  //    var credits = 'credits.html';
  var APP_VERSION = '3.0.3';
  var RESET_VERSION = '3.0.0';
  return {
    init: function () {
      var deferred = $q.defer();
      if (mapJsonConfig != null) deferred.resolve(true);
      else $http.get('data/config.json').success(function (response) {
        mapJsonConfig = response;
        deferred.resolve(true);
      });
      return deferred.promise;
    },
    getSenderID: function () {
      return mapJsonConfig['senderID'];;
    },
    getMessagingAppId: function () {
      return mapJsonConfig['messagingAppId']
    },
    getFakeId: function () {
      return fakeId;
    },
    setAppId: function (userId) {
      if (userId == this.getFakeId()) {
        $rootScope.appId = 'test';
      } else {
        $rootScope.appId = 'trento';
      }
    },
    getVersion: function () {
      return 'v ' + APP_VERSION + (APP_BUILD && APP_BUILD != '' ? '<br/>(' + APP_BUILD + ')' : '');
    },
        getResetVersion: function () {
      return  RESET_VERSION;
    },
    getLang: function () {
      var browserLanguage = '';
      // works for earlier version of Android (2.3.x)
      var androidLang;
      if ($window.navigator && $window.navigator.userAgent && (androidLang = $window.navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
        browserLanguage = androidLang[1];
      } else {
        // works for iOS, Android 4.x and other devices
        browserLanguage = $window.navigator.userLanguage || $window.navigator.language;
      }
      var lang = browserLanguage.substring(0, 2);
      if (lang != 'it' && lang != 'en' && lang != 'de') lang = 'en';
      return lang;
    },
    getLanguage: function () {

      navigator.globalization.getLocaleName(
        function (locale) {
          alert('locale: ' + locale.value + '\n');
        },
        function () {
          alert('Error getting locale\n');
        }
      );

    },
    keys: function () {
      return keys;
    },
    URL: function () {
      return URL;
    },

    httpTimout: function () {
      return timeout;
    },
    getServerURL: function () {
      return URL + '/' + app;
    },
    app: function () {
      return app;
    },
    appId: function () {
      return $rootScope.appId;
    },
    service: function () {
      return service;
    },
    schemaVersion: function () {
      return SCHEMA_VERSION;
    },
    savedImagesDirName: function () {
      return 'Ungiorno-ImagesCache';
    },
    loadingOverlayTimeoutMillis: function () {
      return 20 * 1000; /* seconds before automatically hiding loading overlay */
    },
    fileDatadirMaxSizeMB: function () {
      return 100;
    },
    fileCleanupTimeoutSeconds: function () {
      return 60 * 60 * 12; /* 60 times 60 seconds = 1 HOUR --> x12 = TWICE A DAY */
    },
    fileCleanupOverlayTimeoutMillis: function () {
      return 20 * 1000; /* seconds before automatically hiding cleaning overlay */
    },
    textTypesList: function () {
      return textTypes;
    },
    imagePath: function () {
      return imagePath;
    },
    doProfiling: function () {
      return false;
    },
    getExpirationDate: function () {
      return mapJsonConfig["expirationDate"];

    },
    getAuthenticationTimer: function () {
      return mapJsonConfig['authenticationTimer'];
    }
  }
})

.factory('Profiling', function (Config) {
    var reallyDoProfiling = Config.doProfiling();
    var startTimes = {};
    return {
      start2: function (label) {
        startTimes[label] = (new Date).getTime();
      },
      start: function (label) {
        if (reallyDoProfiling) this.start2(label);
      },

      _do2: function (label, details, info) {
        var startTime = startTimes[label] || -1;
        if (startTime != -1) {
          var nowTime = (new Date).getTime();
          console.log('PROFILING: ' + label + (details ? '(' + details + ')' : '') + '=' + (nowTime - startTime));
          //if (details) startTimes[label]=nowTime;
          if (!!info) console.log(info);
        }
      },
      _do: function (label, details, info) {
        if (reallyDoProfiling) this._do2(label, details);
      }
    };
  })
  .factory('addingDelegateService', function () {
      var delegate = null;
      var addingDelegateService = {}
      addingDelegateService.insert = function (InputObj) {
          delegate = InputObj;
        },
        addingDelegateService.estract = function () {
          return delegate;
        }

      return addingDelegateService;
    }

  )
