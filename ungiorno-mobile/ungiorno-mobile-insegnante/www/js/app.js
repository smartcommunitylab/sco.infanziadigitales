// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers', [
    'ionic',
    'ngCordova',
    'pascalprecht.translate',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.filters',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.directives',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.common',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.home',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.bus',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.calendar',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.notes',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.services.conf',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.services.babyConfigurationService',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.services.dataServerService',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.services.profileService',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.services.sectionService',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.services.teachersService',
    'it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.login',
    'angularMoment'
])

.run(function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $state, $translate, $q, $ionicHistory, $ionicConfig, Config, babyConfigurationService, profileService, dataServerService, Toast, $ionicSideMenuDelegate) {
    $rootScope.userIsLogged = (localStorage.userId != null && localStorage.userId != "null");

    $rootScope.getUserId = function () {
        if ($rootScope.userIsLogged) {
            return localStorage.userId;
        }
        return null;
    };

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

    $rootScope.appName = Config.cityName;

})

.config(function ($stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('top');

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

    .state('app.section', {
            url: '/section/:id',
            views: {
                'section': {
                    templateUrl: 'templates/section.html',
                    controller: 'SectionCtrl'
                }
            }

        })
        .state('app.communications', {
            cache: false,
            url: "/communications",
            views: {
                'menuContent': {
                    templateUrl: "templates/communications.html",
                    controller: 'communicationsCtrl'
                }
            }
        })
        .state('app.bus', {
            cache: false,
            url: "/bus",
            views: {
                'menuContent': {
                    templateUrl: "templates/bus.html",
                    controller: 'busCtrl'
                }
            }
        })
        .state('app.calendar', {
            cache: false,
            url: "/calendar",
            views: {
                'menuContent': {
                    templateUrl: "templates/calendar.html",
                    controller: 'calendarCtrl'
                }
            }
        })
        .state('app.babyprofile', {
            cache: false,
            url: "/babyprofile",
            views: {
                'menuContent': {
                    templateUrl: "templates/babyprofile.html",
                    controller: 'babyprofileCtrl'
                }
            }
        })
        .state('app.notes', {
            cache: false,
            url: "/notes",
            views: {
                'menuContent': {
                    templateUrl: "templates/notes.html",
                    controller: 'notesCtrl'
                }
            }
        })


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');

    $translateProvider.translations('it', {
        menu_home: 'Home',
        home_assenza: 'Assenza',
        home_retire: 'Ritiro',
        home_bus: 'Bus',
        home_mensa: 'Mensa',
        home_calendario: 'Calendario',
        home_contatta: 'Contatta',
        home_personal_information: 'Informazioni su ',
        home_school_information: 'Informazioni di servizio',
        home_entry_to: ' entra alle ore ',
        home_exit_to: ' ed esce alle ore ',
        menu_exit: 'Esci',
        menu_enter: 'Entra',
        babysetting_intro: 'Definisci i seguenti dati relativi all\'orario scolastico del bambino.',
        babysetting_services: 'Servizi',
        babysetting_hours: 'Orario di uscita:',
        babysetting_who: 'Chi ritira il bambino:',
        babysetting_busGo: 'Fermata bus andata:',
        babysetting_busBack: 'Fermata bus ritorno:',
        retire: "Ritiro del bambino",
        date: "Data",
        hour: "Ora",
        who_takes_baby: "Chi ritira il bambino?",
        nav_delegate: "Delega straordinaria",
        delegate_status: "Validità delega",
        note: "Note",
        note_description: "Inserisci una nota...",
        delegate: "Delega straordinaria",
        delegate_description: "Dati del delegato",
        name: "Nome del delegato",
        surname: "Cognome del delegato",
        add_image: "Aggiungi documento del delegato",
        delegate_auth: "Autorizzazione",
        delegate_majority: "Il delegato è maggiorenne",
        auth_take_baby: "Autorizzo il soggetto sopraindicato a ritirare mio figlio da scuola",
        babysetting_save: "Salva",
        add_image_completed: "Documento aggiunto correttamente",
        calendar: "Calendario",
        monday: "Lunedì",
        tuesday: "Martedì",
        wednesday: "Mercoledì",
        thursday: "Giovedì",
        friday: "Venerdì",
        saturday: "Sabato",
        sunday: "Domenica",
        monday_reduced: "Lun",
        tuesday_reduced: "Mar",
        wednesday_reduced: "Mer",
        thursday_reduced: "Gio",
        friday_reduced: "Ven",
        saturday_reduced: "Sab",
        sunday_reduced: "Dom",
        home_disabledbutton: "Funzione disabilitata",
        retire_sendok: "Il ritiro del bambino e' stato confermato",
        retire_sendno: "Problemi di invio dati",
        setting_sendok: "Modifica configurazione registrata",
        setting_sendno: "Problemi di invio dati",
        send_note: "Invia una nota",
        text: "Testo",
        send: "Invia",
        contact_school: "Contatta la scuola",
        call: "Chiama",
        bus_stop: "Fermata bus",
        baby_drops_off_to: "Il bambino scende in",
        whos_waiting_is: "Ad aspettare c'è",
        open: "Aperture",
        close: "Chiusure",
        holiday: "Vacanza",
        meeting: "Riunione genitori",
        trip: "Gita",
        events: "Eventi sul territorio",
        kid: "Bambino",
        parents: "Genitori",
        meal: "Pasto",
        lunch: "Pranzo",
        break: "Merenda",
        meals_info: "Info pasti",
        show_type: "Tipo visualizzazione",
        daily: "Giornaliera",
        weekly: "Settimanale",
        monthly: "Mensile",
        // new!!
        teacher: "Maestra",
        all_section: "Tutte le sezioni",
        logout: "Esci",
        parents_alerts: "Comunicazioni",
        enter_at: "Entra ad ore: ",
        exit_at: "Esce ad ore: ",
        is: "è",
        bus_stop_go: "Fermata bus andata: ",
        bus_stop_back: "Fermata bus ritorno: ",
        person_who_retire: "Persona incaricata del ritiro: ",
        parents_notes: "Note del genitore: ",
        teachers_notes: "Note della maestra: ",
        arguments: "Argomento",
        description: "Descrizione",
        send: "Invia",
        baby_info: "Info generali bambino",
        parent_one: "Genitore 1",
        parent_two: "Genitore 2",
        food_allergies: "Allergie alimentari: ",
        teachers: "Maestre",
        extra_delegation: "Questa è una delega straordinaria",
        view_delegation: "Vedi delega",
        home_anticipo: "Anticipo",
        home_pranzo: "Pranzo",
        home_posticipo: "Posticipo",
        exit: "Uscito",
        present: "Presente"


    });

    $translateProvider.preferredLanguage("it");
    $translateProvider.fallbackLanguage("it");
});
