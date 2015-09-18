// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso', [
    'ionic',
    'ngCordova',
    'pascalprecht.translate',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.filters',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.directives',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.common',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.postgallery',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.login',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.register',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.gallery',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.babyConfigurationService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.dataServerService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.profileService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.teachersService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.galleryService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.diaryservice',
    'angularMoment'
])

.run(function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $state, $translate, $q, $ionicHistory, $ionicConfig, $ionicSideMenuDelegate) {
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
        // $rootScope.getConfiguration();
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

})

.config(function ($stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('top');
    $ionicConfigProvider.backButton.text('').previousTitleText(false);

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

    .state('app.login', {
        cache: false,
        url: "/login",
        views: {
            'menuContent': {
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl'
            }
        }

    })

    .state('app.dettaglidiario', {
        cache: false,
        url: "/dettaglidiario",
        views: {
            'menuContent': {
                templateUrl: "templates/dettagliDiario.html",
                controller: 'dettaglidiarioCtrl'
            }
        }

    })

    .state('app.postgallery', {
        cache: false,
        url: "/postgallery",
        views: {
            'menuContent': {
                templateUrl: "templates/postGallery.html",
                controller: 'PostGalleryCtrl'
            }
        }

    })

    .state('app.gallery', {
        cache: false,
        url: "/gallery",
        views: {
            'menuContent': {
                templateUrl: "templates/gallery.html",
                controller: 'GalleryCtrl'
            }
        }

    })

    .state('app.register', {
        cache: false,
        url: "/register",
        views: {
            'menuContent': {
                templateUrl: "templates/register.html",
                controller: 'RegisterCtrl'
            }
        }

    })



    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');

    $translateProvider.translations('it', {
        menu_home: 'Home',
        diary_details: 'Dettagli diario',
        diary_create: 'Crea un diario',
        data: 'Dati del bambino',
        data_family: 'Dati famiglia',
        name: 'Nome del bambino',
        surname: 'Cognome del mambino',
        date_birth: 'Data di nascita',
        add_family_component: 'Aggiungi un componente',
        add_authorized: 'Aggiungi una persona',
        acces_diary: 'Hanno accesso al diario',
        has: 'ha',
        name_parents: 'Nome del genitore',
        create_post: 'Crea un elemento',
        description: 'Descrizione',
        add_photo: 'Aggiungi foto',
        number_parents: 'n° di telefono ',
        mail_parents: 'Indirizzo email ',
        notes: 'Note',
        insert_note: 'Aggiungi ulteriori dettagli o note personali',
        new_component: 'Aggiungi un componente',
        add_tag: 'Aggiungi',
        add_tag_title: 'Aggiungi etichetta',
        add_tag_description: 'non è presente nell\'elenco delle etichette. Scegli Aggiungi per inserire la nuova etichetta nell\'elenco',
        role: 'Ruolo',
        parent1: 'Genitore 1',
        parent2: 'Genitore 2',
        brother: 'Fratello',
        sister: 'Sorella',
        asterisk: '* Indica che i campi sono obbligatori.',
        new_people: 'Aggiungi una persona',
        email: 'Email',
        fullName: 'Nome completo',
        parent: 'Genitore',
        teacher: 'Insegnante',
        nothing_note: 'Nessuna nota presente',
        gender: 'Sesso',
        male: 'Maschio',
        female: 'Femmina',

        register: 'Registrazione',
        gallery: 'Galleria',
        logout: 'Esci',
        home: 'Home',
        create_diary: 'Crea diario',
        change_profile: 'Cambia profilo',
        profile_teacher_used: 'Stai utilizzando il profilo isegnante',
        profile_parent_used: 'Stai utilizzando il profilo genitore',
        no_profiles: 'Nessun profilo presente'
    });

    $translateProvider.preferredLanguage("it");
    $translateProvider.fallbackLanguage("it");
});
