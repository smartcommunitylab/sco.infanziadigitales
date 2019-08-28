angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function ($provide) {
  'use strict';

  $provide.decorator('$browser', ['$delegate', '$window', function ($delegate, $window) {

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn = browser.url;

      browser.url = function () {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }

        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      window.addEventListener('popstate', clearPendingLocationUrl, false);
      window.addEventListener('hashchange', clearPendingLocationUrl, false);

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      return browser;
    }
  }]);
}]);
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('it.smartcommunitylab.infanziadigitales.diario.parents', [
  'ionic',
  'ngCordova',
  'angular.filter',
  'ngIOS9UIWebViewPatch',
  'pascalprecht.translate',
  'smartcommunitylab.services.login',
  'it.smartcommunitylab.infanziadigitales.diario.parents.filters',
  'it.smartcommunitylab.infanziadigitales.diario.parents.directives',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.common',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.babysetting',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.communications',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.messages',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.conf',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.configurationService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.dataServerService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.profileService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.login',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.communicationsService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.messagesService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.notification',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.week_planService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.services.logService',
  'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.week_plan',
  'it.smartcommunitylab.infanziadigitales.diario.parents.directives',
  'angularMoment',
  'ionic-timepicker',
  'ionic-modal-select',
  'ionic-numberpicker',
  'monospaced.elastic'
])
  .directive('select', function () { //same as "ngSelect"
    return {
      restrict: 'E',
      scope: false,
      link: function (scope, ele) {
        ele.on('touchmove touchstart', function (e) {
          e.stopPropagation();
        })
      }
    }
  })

  .run(function ($ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $filter, $cordovaSplashscreen, $state, $translate, $q, $window, $ionicHistory, $ionicConfig, Config,
    configurationService, profileService, dataServerService, pushNotificationService, Toast, LoginService, logService) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log(fromState.name + ' -> ' + toState.name);
    });

    $rootScope.getUserId = function () {
      return localStorage.userId;
    };

    $rootScope.userIsLogged = function () {
      return (localStorage.userId != null && localStorage.userId != "null");
    };

    $rootScope.loginStarted = false;
    $rootScope.authWindow = null;


    $rootScope.login = function () {
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });

      $state.go('app.login', null, {
        reload: true
      });
    };

    $rootScope.logout = function () {
      LoginService.logout().then(
        function (data) {
          //ionic.Platform.exitApp();
          window.location.reload(true);
          Utils.loading();
        },
        function (error) {
          Utils.toast(Utils.getErrorMsg(error));
        }
      );
    };
    //    $rootScope.login = function () {
    //        if ($rootScope.loginStarted) return;
    //
    //        $rootScope.loginStarted = true;
    //        loginService.login().then(
    //            function (data) {
    //                $rootScope.loginStarted = false;
    //                localStorage.userId = data.userId;
    //                $state.go('app.home', {}, {
    //                    reload: true
    //                });
    //            },
    //            function (error) {
    //                //The user denied access to the app
    //                $rootScope.loginStarted = false;
    //                localStorage.userId = null;
    //                //TODO toast
    //                alert('autenticazione non riuscita');
    //                ionic.Platform.exitApp();
    //            }
    //        );
    //    };


    $rootScope.logout = function () {
      LoginService.logout().then(
        function (data) {
          localStorage.userId = null;
          window.location.hash = '/login';
          window.location.reload(true);
        },
        function (error) {
          //TODO toast
          //Utils.toast();
          localStorage.userId = null;
        }
      );
    };

    newAppVersion = function () {
      //check if it is a new app version 
      var isNew = true;
      var thisversion = Config.getResetVersion();
      //if localstorage has version and it is equal to this return false else clear localstorage
      if (localStorage.getItem('reset_version')) {
        var oldVersion = localStorage.getItem('reset_version');
        if (thisversion == oldVersion) {
          return false
        }
      }
      localStorage.clear();
      localStorage.setItem('reset_version', thisversion);
      return true;
    }

    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      Config.init().then(function () {
        var baseUrl = Config.URL() + '/' + Config.app();
        var cookieInitOptions = {
          loginType: LoginService.LOGIN_TYPE.COOKIE,
          googleWebClientId: CONF.googleWebClientId,
          customConfig: {
            BASE_URL: baseUrl,
            AUTHORIZE_URL: baseUrl + '/userlogin',
            SUCCESS_REGEX: /userloginsuccess\?profile=(.+)$/,
            ERROR_REGEX: /userloginerror\?error=(.+)$/,
            LOGIN_URL: baseUrl + '/userlogininternal',
            REGISTER_URL: baseUrl + '/register',
            REVOKE_URL: baseUrl + '/logout',
            RESET_URL: Config.getAACURL() + '/internal/reset',
            REDIRECT_URL: 'http://localhost',


          }
        };
        LoginService.init(cookieInitOptions);

        //update notifications
        var notificationInit = function () {
          //scrivo le ultime di una settimana
          if (localStorage.getItem(Config.getAppId() + '_lastUpdateTime') == null) {
            date = new Date();
            //date.setDate(date.getDate() - 7);
            lastUpdateTime = date.getTime();
          } else {
            lastUpdateTime = localStorage.getItem(Config.getAppId() + '_lastUpdateTime');
          }
          notificationService.getNotifications(lastUpdateTime, 0, 10).then(function (items) { //solo le nuove
            if (items) {
              $rootScope.countNotification = items.length;

              //last update time is the last time of notification
              if (items.length > 0) {

                lastUpdateTime = items[0].updateTime + 1;
              }
              localStorage.setItem(Config.getAppId() + '_lastUpdateTime', lastUpdateTime);
            }
          }, function (err) {

            $rootScope.countNotification = 0;

          });
        }

        document.addEventListener("resume", function () {
          //notificationInit();
        }, false);


        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleLightContent();
        }

        if (typeof navigator.globalization !== "undefined") {
          // TODO reenable for translation
          // navigator.globalization.getPreferredLanguage(function (language) {
          //   $translate.use((language.value).split("-")[0]).then(function (data) {
          //     console.log("SUCCESS -> " + data);
          //     $rootScope.lang = data;
          //   }, function (error) {
          //     console.log("ERROR -> " + error);
          //   });
          // }, null);
        }
        $rootScope.platform = ionic.Platform;
        $rootScope.backButtonStyle = $ionicConfig.backButton.icon();
        // $rootScope.getConfiguration();

        $rootScope.login_googlelocal = 'google';
        $rootScope.login_facebooklocal = 'facebook';

        //        if (!!window.plugins && !!window.plugins.googleplus) {
        //            window.plugins.googleplus.isAvailable(
        //                function (available) {
        //                    if (available) $rootScope.login_googlelocal = 'googlelocal';
        //                    console.log('login_googlelocal available!');
        //                }
        //            );
        //        }

        //        if (window.cordova && window.cordova.platformId == 'browser') {
        //            facebookConnectPlugin.browserInit('1031028236933030');
        //            //facebookConnectPlugin.browserInit(appId, version);
        //            // version is optional. It refers to the version of API you may want to use.
        //        }
        if (!newAppVersion() && LoginService.userIsLogged()) {
          console.log("user is logged");
          Config.setAppId(localStorage.userId);
          dataServerService.getBabyProfiles().then(function (data) {
            //pushNotificationService.register();
            if (data) {
              $state.go('app.home');
              $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
              });
            }
            else {
              $rootScope.login();
            }
          },
            function (error) {
              console.log("ERROR -> " + error);
              //Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
              $ionicLoading.hide();
              if (error == 406) {
                $rootScope.allowed = false;
              }
              $rootScope.login();
              //$state.go('app.home');// go to home in order to see the message 'Ricarica Pagina'
            })
        } else {
          $rootScope.login();
        }
      });
    });


    // for BlackBerry 10, WP8, iOS
    setTimeout(function () {
      if (window.$cordovaSplashscreen) $cordovaSplashscreen.hide();
      //navigator.splashscreen.hide();
    }, 3000);

    $rootScope.locationWatchID = undefined;
    //  ionic.Platform.fullScreen(false,true);
    if (typeof (Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function () {
        return this * Math.PI / 180;
      }
    }

    $rootScope.appName = Config.cityName;

  })

  .config(function ($stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider, $httpProvider) {
    $ionicConfigProvider.backButton.text('').previousTitleText(false);
    $ionicConfigProvider.views.swipeBackEnabled(false);

    var view = ionic.Platform.isWebView();
    console.log(view);
    if (!view) {
      $httpProvider.defaults.withCredentials = true;
    }
    $stateProvider.state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })


      .state('app.home', {
        cache: false,
        url: "/home",
        views: {
          'menuContent': {
            templateUrl: "templates/home.html",
            controller: 'HomeCtrl'
          }
        }
      })

      .state('app.babysetting', {
        cache: false,
        url: '/babysetting',
        abstract: false,
        views: {
          'menuContent': {
            templateUrl: "templates/babysetting.html",
            controller: 'BabySettingCtrl'
          }
        }
      })

      .state('app.login', {
        cache: false,
        url: '/login',
        abstract: false,
        views: {
          'menuContent': {
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl'
          }
        }
      })
      .state('app.signup', {
        url: '/signup',
        views: {
          'menuContent': {
            templateUrl: 'templates/signup.html',
            controller: 'RegisterCtrl'
          }
        }
      })
      .state('app.signupsuccess', {
        url: '/signupsuccess',
        views: {
          'menuContent': {
            templateUrl: 'templates/signupsuccess.html',
            controller: 'RegisterCtrl'
          }
        }
      }).state('app.communications', {
        url: '/communications',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/communications.html',
            controller: 'CommunicationsCtrl'
          }
        }
      }).state('app.messages', {
        url: '/messages',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/messages.html',
            controller: 'MessagesCtrl'
          }
        }
      }).state('app.week_plan', {
        url: '/week_plan',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/week_plan.html',
            controller: 'WeekPlanCtrl'
          }
        }
      }).state('app.default_week_plan', {
        url: '/default_week_plan',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/week_default.html',
            controller: 'DefaultWeekPlanCtrl'
          }
        }
      }).state('app.week_default_edit_day', {
        url: '/week_default_edit_day',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/week_default_edit_day.html',
            controller: 'WeekDefaultEditDayCtrl'
          }
        }
      }).state('app.week_edit_day', {
        url: '/week_edit_day',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/week_edit_day.html',
            controller: 'WeekEditDayCtrl'
          }
        }
      }).state('app.settings_promemoria', {
        url: '/settings_promemoria',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/settings_promemoria.html',
            controller: 'Promemoria'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

    //  $translateProvider.useUrlLoader('js/locales/it.json');
    $translateProvider.useStaticFilesLoader({
      prefix: 'js/locales/',
      suffix: '.json'
    });
    // $translateProvider.useLocalStorage();
    $translateProvider.preferredLanguage("it");
    $translateProvider.fallbackLanguage("it");
  });
