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

    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.conf',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.common',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.postgallery',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.login',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.register',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.gallery',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.dataServerService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.profileService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.teachersService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.galleryService',

 'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.loginService',
    'it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.diaryservice',
    'pickadate',
    'ionic-datepicker',
    'angularMoment'
])

.run(function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $state, $translate, $q, $ionicHistory, $ionicConfig, $ionicSideMenuDelegate, loginService, dataServerService, $ionicLoading, profileService) {

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
        loginService.logout().then(
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

    $rootScope.logout = function () {
        loginService.logout().then(
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

    $ionicPlatform.ready(function () {
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
        $rootScope.login_googlelocal = 'google';
        $rootScope.login_facebooklocal = 'facebook';

        if (loginService.userIsLogged()) {
            console.log("user is logged");
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            profileService.getUserProfile().then(function (data) {
                $state.go('app.home');

            }, function (error) {
                console.log("ERROR -> " + error);
                $ionicLoading.hide();
                if (error == 406) {
                    loginService.logout();
                    $ionicPopup.alert({
                        title: $filter('translate')('not_allowed_popup_title'),
                        template: $filter('translate')('not_allowed_signin')
                    });
                    $state.go('app.login');
                }
            });
            //            if (localStorage.provider == 'internal') {
            //                $rootScope.login();
            //            } else {
            //                loginService.login(localStorage.provider).then(
            //                    function (data) {
            //                        profileService.getUserProfile().then(function (data) {
            //                            $state.go('app.home');
            //                            $ionicHistory.nextViewOptions({
            //                                disableBack: true,
            //                                historyRoot: true
            //                            });
            //
            //                        }, function (error) {
            //                            console.log("ERROR -> " + error);
            //                            // Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            //                            $ionicLoading.hide();
            //                            if (error == 406) {
            //                                loginService.logout();
            //                                $ionicPopup.alert({
            //                                    title: $filter('translate')('not_allowed_popup_title'),
            //                                    template: $filter('translate')('not_allowed_signin')
            //                                });
            //                                $state.go('app.login');
            //                                $ionicHistory.nextViewOptions({
            //                                    disableBack: true,
            //                                    historyRoot: true
            //                                });
            //                            }
            //                        });
            //                        //                        $state.go('app.home');
            //                        //                        $ionicHistory.nextViewOptions({
            //                        //                            disableBack: true,
            //                        //                            historyRoot: true
            //                        //                                //                });
            //                        //                        });
            //                    })
            //            };
        } else {
            $rootScope.login();
        }
    });


    // for BlackBerry 10, WP8, iOS
    setTimeout(function () {
        if ($cordovaSplashscreen != null) {
            $cordovaSplashscreen.hide();
        }
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

.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}])

.config(function ($stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider, pickadateI18nProvider) {


    $ionicConfigProvider.tabs.position('top');
    $ionicConfigProvider.backButton.text('').previousTitleText(false);

    pickadateI18nProvider.translations = {
        prev: '<i class="icon ion-chevron-left"></i>',
        next: '<i class="icon ion-chevron-right"></i>'
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

    .state('app.signupsuccess', {
        url: '/signupsuccess',
        views: {
            'menuContent': {
                templateUrl: 'templates/signupsuccess.html',
                controller: 'RegisterCtrl'
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


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

    $translateProvider.translations('it', {
        menu_home: 'Home',
        diary_details: 'Dettagli diario',
        diary_create: 'Crea un diario',
        data: 'Dati del bambino',
        data_family: 'Dati famiglia',
        name: 'Nome del bambino',
        pname: 'Nome',
        psname: 'Cognome',
        setLabel: 'Set',
        todayLabel: 'Today',
        closeLabel: 'Close',
        surname: 'Cognome del bambino',
        date_birth: 'Data di nascita',
        add_family_component: 'Aggiungi un componente',
        add_authorized: 'Aggiungi una persona',
        acces_diary: 'Hanno accesso al diario',
        has: 'ha',
        name_parents: 'Nome del genitore',
        create_post: 'Crea nuova voce',
        description: 'Inserisci il testo',
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
        grandfather: 'Nonno',
        grandmother: 'Nonna',
        uncle: 'Zio',
        aunt: 'Zia',
        cousinM: 'Cugino',
        cousinF: 'Cugina',
        asterisk: 'Indica che i campi sono obbligatori.',
        new_people: 'Aggiungi una persona',
        email: 'Email',
        fullName: 'Nome completo',
        parent: 'Genitore',
        teacher: 'Insegnante',
        nothing_note: 'Nessuna voce presente.',
        gender: 'Sesso',
        male: 'Maschio',
        female: 'Femmina',
        gmail_login: 'Google',
        facebook_login: 'Facebook',
        register: 'Registrazione',
        gallery: 'Galleria',
        logout: 'Esci',
        home: 'Home',
        create_diary: 'Crea diario',
        change_profile: 'Cambia profilo',
        profile_teacher_used: 'Stai utilizzando il profilo insegnante',
        profile_parent_used: 'Stai utilizzando il profilo genitore',
        no_profiles: 'Nessun profilo presente',
        access_with: 'Oppure accedi con:',
        access_with_credentials: 'Accedi con le tue credenziali:',
        signup_email: 'Email',
        signup_pwd: 'Password',
        signin_pwd_reset: 'Password dimenticata?',
        login_signin: 'Entra',
        login_signup: 'REGISTRATI',
        signup_signup: 'Registrati',
        signup_subtitle: 'Registrati a Smart Community ',
        signup_name: 'Nome',
        signup_surname: 'Cognome',
        signup_email: 'Email',
        signup_pwd: 'Password',
        cancel_signup: "ANNULLA",
        error_popup_title: 'Errore',
        error_generic: 'La registrazione non è andata a buon fine. Riprova piÃ¹ tardi.',
        error_email_inuse: 'L\'indirizzo email è giÃ  in uso.',
        error_required_fields: 'Tutti i campi sono obbligatori',
        error_password_short: 'La lunghezza della password deve essere di almeno 6 caratteri',
        signup_success_title: 'Registrazione completata!',
        signup_success_text: 'Completa la registrazione cliccando sul link che trovi nella email che ti abbiamo inviato.',
        signup_resend: 'Re-inviare l\'email di conferma',
        signin_pwd_reset: 'Password dimenticata?',
        error_signin: 'Username/password non validi',
        delete_confirm: 'Conferma',
        delete_cancel: 'Annulla',
        delete_done: 'Voce cancellata',
        add_post_done: 'Nuova voce aggiunta',
        add_post_error: 'Errore nella creazione di una nuova voce',
        delete_error: 'Errore nella cancellazione della voce',
        add_post_empty_text: 'Inserire un testo per aggiungere una nuova voce',
        get_tags_error: 'Errore nella ricezione dei tags dal server',
        insert_new_tag: 'Inserire un nuovo tag',
        add_pic_gallery: 'Galleria',
        add_pic_camera: 'Fotocamera',
        credits_project: 'Realizzato da:',
        title1: 'Diario condiviso',
        credits_sponsored: 'Nell\'ambito del progetto "Inf@nzia DIGI tales 3.6" finanziato dal:',
        credits_collaboration: 'In collaborazione con il Dipartimento della Conoscenza della:',
        credits_students: 'Hanno partecipato allo sviluppo:',
        credits_parents: 'Si ringraziano per la collaborazione:',
        credits_info: 'Per informazioni: ',
        credits_licenses_button: 'VEDI LICENZE',
        menu_credits: "Credits",
    });

    $translateProvider.preferredLanguage("it");
    $translateProvider.fallbackLanguage("it");
});
