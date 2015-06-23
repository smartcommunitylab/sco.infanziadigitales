// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('it.smartcommunitylab.infanziadigitales.diario.parents', [
    'ionic',
    'ngCordova',
    'pascalprecht.translate',
    'it.smartcommunitylab.infanziadigitales.diario.parents.filters',
    'it.smartcommunitylab.infanziadigitales.diario.parents.directives',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.common',
     'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.assenza',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.conf',
        'it.smartcommunitylab.infanziadigitales.diario.parents.services.assenzaService',
        'it.smartcommunitylab.infanziadigitales.diario.parents.services.ritiroService',
            'it.smartcommunitylab.infanziadigitales.diario.parents.services.configurationService',
            'it.smartcommunitylab.infanziadigitales.diario.parents.services.dataFromServerService',
        'it.smartcommunitylab.infanziadigitales.diario.parents.services.profileService'



])

.run(function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $state, $translate, $q, $ionicHistory, $ionicConfig, Config, configurationService, profileService, dataFromServerService) {
    $rootScope.userIsLogged = (localStorage.userId != null && localStorage.userId != "null");

    $rootScope.getUserId = function () {
        if ($rootScope.userIsLogged) {
            return localStorage.userId;
        }
        return null;
    };

    $rootScope.getConfiguration = function () {
        dataFromServerService.getBabyConfiguration().then(function (data) {
            configurationService.setBabyConfiguration(data[0]);
            configurationService.getBabyConfiguration();

            console.log("SUCCESS -> " + data);
        }, function (error) {
            console.log("ERROR -> " + error);
        });
        dataFromServerService.getBabyProfile().then(function (data) {
            profileService.setBabyProfile(data[0]);
            console.log("SUCCESS -> " + data);
        }, function (error) {
            console.log("ERROR -> " + error);
        });
        dataFromServerService.getSchoolProfile().then(function (data) {
            profileService.setSchoolProfile(data[0]);
            console.log("SUCCESS -> " + data);
        }, function (error) {
            console.log("ERROR -> " + error);
        });

    }

    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        if (typeof navigator.globalization !== "undefined") {
            navigator.globalization.getPreferredLanguage(function (language) {
                $translate.use((language.value).split("-")[0]).then(function (data) {
                    console.log("SUCCESS -> " + data);
                    $rootScope.lang = data;
                }, function (error) {
                    console.log("ERROR -> " + error);
                });
            }, null);
        }
        $rootScope.platform = ionic.Platform;
        $rootScope.backButtonStyle = $ionicConfig.backButton.icon();
        $rootScope.getConfiguration();
    });


    // for BlackBerry 10, WP8, iOS
    setTimeout(function () {
        $cordovaSplashscreen.hide();
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

.config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
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



    .state('app.assenza', {
            cache: false,
            url: '/assenza',
            abstract: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/assenza.html",
                    controller: 'AssenzaCtrl'
                }
            }
        })
        .state('app.ritiro', {
            cache: false,
            url: '/ritiro',
            abstract: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/ritiro.html",
                    controller: 'RitiroCtrl'
                }
            }
        })
        .state('app.delegate', {
            cache: false,
            url: '/delegate',
            abstract: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/delega.html",
                    controller: 'DelegateCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');

    $translateProvider.translations('it', {
        menu_home: 'Home',
        home_assenza: 'Assenza',
        home_ritiro: 'Ritiro',
        home_bus: 'Bus',
        home_mensa: 'Mensa',
        home_calendario: 'Calendario',
        home_contatta: 'Contatta'
    });

    $translateProvider.translations('en', {
        menu_home: 'Home',
        home_assenza: 'Assenza',
        home_ritiro: 'Ritiro',
        home_bus: 'Bus',
        home_mensa: 'Mensa',
        home_calendario: 'Calendario',
        home_contatta: 'Contatta'
    });

    $translateProvider.translations('de', {
        menu_home: 'Home',
        home_assenza: 'Assenza',
        home_ritiro: 'Ritiro',
        home_bus: 'Bus',
        home_mensa: 'Mensa',
        home_calendario: 'Calendario',
        home_contatta: 'Contatta'
    });

    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
});
