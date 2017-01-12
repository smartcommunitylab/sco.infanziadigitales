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
    'ngIOS9UIWebViewPatch',
    'pascalprecht.translate',
    'it.smartcommunitylab.infanziadigitales.diario.parents.filters',
    'it.smartcommunitylab.infanziadigitales.diario.parents.directives',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.common',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.absence',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.babysetting',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.retire',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.authorization',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.communications',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.messages',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.conf',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.assenzaService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.retireService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.busService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.configurationService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.dataServerService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.profileService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.calendarService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.calendar',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.addNote',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.buses',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.canteen',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.login',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.canteenService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.loginService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.communicationsService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.messagesService',
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.notification',
    'angularMoment',
  'monospaced.elastic'
])

.run(function ($ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $filter, $cordovaSplashscreen, $state, $translate, $q, $window, $ionicHistory, $ionicConfig, Config,
  configurationService, profileService, dataServerService, loginService, pushNotificationService, Toast) {

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
    //        if (window.ParsePushPlugin) {
    //            window.ParsePushPlugin.unsubscribe('CarPooling_' + StorageSrv.getUserId(), function () {
    //                console.log("Success in channel " + 'CarPooling_' + StorageSrv.getUserId() + " unsubscribe");
    //            });
    //        }
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
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    Config.init().then(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
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
      if (loginService.userIsLogged()) {
        console.log("user is logged");
        //
        if (localStorage.provider == 'internal') {
          $rootScope.login();
        } else {
          loginService.login(localStorage.provider).then(
            function (data) {
              dataServerService.getBabyProfiles().then(function (data) {
                //pushNotificationService.register();
                $state.go('app.home');
                $ionicHistory.nextViewOptions({
                  disableBack: true,
                  historyRoot: true
                });

              }, function (error) {
                console.log("ERROR -> " + error);
                // Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                $ionicLoading.hide();
                if (error == 406) {
                  loginService.logout();
                  $ionicPopup.alert({
                    title: $filter('translate')('not_allowed_popup_title'),
                    template: $filter('translate')('not_allowed_signin')
                  });
                  $state.go('app.login');
                  $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                  });
                }
              });
            })
        };
      } else {
        $rootScope.login();
      }
    });

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

  .state('app.absence', {
    cache: false,
    url: '/assenza',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/absence.html",
        controller: 'AbsenceCtrl'
      }
    }
  })

  .state('app.retire', {
    cache: false,
    url: '/retire',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/retire.html",
        controller: 'RetireCtrl'
      }

    }
  })

  .state('app.canteen', {
    cache: false,
    url: '/canteen',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/canteen.html",
        controller: 'CanteenCtrl'
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

  .state('app.calendar', {
    cache: false,
    url: '/calendar',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/calendar.html",
        controller: "CalendarCtrl"
      }
    }
  })

  .state('app.authorization', {
    cache: false,
    url: '/authorization',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/authorization.html",
        controller: 'AuthorizationCtrl'
      }
    }
  })

  .state('app.addnote', {
    cache: false,
    url: '/addnote',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/note.html",
        controller: 'NoteCtrl'
      }
    }
  })

  .state('app.bus', {
    cache: false,
    url: '/bus',
    abstract: false,
    views: {
      'menuContent': {
        templateUrl: "templates/bus.html",
        controller: 'BusCtrl'
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
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

  $translateProvider.translations('it', {
    menu_home: 'Home',
    home_assenza: 'Assenza',
    home_retire: 'La giornata di ',
    home_bus: 'Bus',
    home_mensa: 'Mensa',
    home_calendario: 'Calendario',
    home_comunicazioni: 'Comunicazioni',
    home_comunicazioni_unread: 'Nuovi messaggi: ',
    home_messaggi: 'Messaggi',
    home_messaggi_unread: 'Messaggi non letti: ',
    home_contatta: 'Chiama la scuola',
    home_personal_information: 'La giornata di ',
    home_school_information: 'Comunicazioni della scuola',
    home_no_personal_information: 'Oggi la maestra non ha inviato nessun messaggio su ',
    home_no_school_information: 'La scuola non ha inviato nessuna comunicazione.',
    home_entry_to: ' Entra alle ore ',
    home_exit_to: ' ed esce alle ore ',
    home_absent: 'Assente',
    home_no_connection: 'Connessione assente! <br> Controlla la connessione del dispositivo',
    go_home_by_bus: ' e torna a casa con il bus.',
    menu_exit: 'Logout',
    menu_enter: 'Entra',
    menu_impostazioni: 'Informazioni',
    menu_issue: 'Segnala un problema',
    babysetting_intro: 'Informazioni relative al bambino.',
    babysetting_services: 'Servizi:',
    babysetting_hours: 'Orario di uscita predefinito:',
    babysetting_who: 'Autorizzati al ritiro del bambino:',
    babysetting_bus: 'Fermate bus:',
    babysetting_busGo: 'Fermata bus andata:',
    babysetting_busBack: 'Fermata bus ritorno:',
    retire: "Ritiro del bambino",
    retire_bus: "Utilizza il servizio bus",
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
    retire_popup_absent_title: "Attenzione",
    retire_popup_absent_text: "Per questa giornata è stata impostata un'assenza. Inserendo i dati di ritiro lo stato verrà modificato. Confermi?",
    retire_popup_absent_ok: "Conferma",
    retire_popup_absent_cancel: "Annulla",
    retire_popup_toolate_title: "Attenzione",
    retire_popup_toolate_text: "Non è più possibile modificare le modalità di ritiro per oggi. Modifica permessa entro le ore",
    setting_sendok: "Modifica configurazione registrata",
    setting_sendno: "Problemi di invio dati",
    send_note: "Messaggio",
    send_note_title: "Invia un messaggio all\'insegnante",
    communications_title: "Comunicazioni della scuola",
    messages_title: "Messaggi",
    text: "Testo",
    send: "Invia",
    contact_school: "Contatta la scuola",
    call: "Chiamata",
    bus_stop: "Fermata bus",
    baby_drops_off_to: "Il bambino scende in",
    whos_waiting_is: "Ad aspettare c'è",
    open: "Apertura",
    close: "Chiusura",
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
    absence_date_wrong: "La data di inizio dell'assenza non può essere posteriore a quella di fine dell'assenza.",
    assenza_sendok: 'Assenza inviata con successo',
    assenza_sendno: 'Assenza non inviata',
    absence_choose: 'Selezionare un motivo dell\'assenza.',
    assenza_popup_retire_title: 'Attenzione',
    assenza_popup_retire_text: "Per queste giornate è già stata impostata l'ora di ritiro. Impostando l'assenza i dati di ritiro veranno sovrascritti. Confermi?",
    assenza_popup_retire_cancel: "Annulla",
    assenza_popup_retire_ok: "Conferma",
    assenza_popup_toolate_title: "Attenzione",
    assenza_popup_toolate_text_1: "Non è più possibile inserire un'assenza per oggi. Modifica permessa entro le ore",
    assenza_popup_toolate_text_2: ". Si prega di contattare la scuola telefonicamente.",
    noinfo: "Nessuna informazione",
    settings: "Impostazioni di base",
    cancel: "Annulla",
    absence: "Inserisci assenza",
    period: "Periodo",
    period_from: "Dal",
    period_to: "Al",
    reason: "Motivazione",
    reason_other: "Altro...",
    absence_other: "Altro",
    ok: "OK",
    timepicker_close: "Chiudi",
    today: "Oggi",
    communication_error: "Errore di comunicazione con il server. Impossibile caricare i dati",
    lbl_login: 'Login',
    text_login_title: 'Un Giorno A Scuola - Genitori',
    text_login_use: 'oppure accedi con',
    login_signin: 'Entra',
    login_signup: 'REGISTRATI',
    error_popup_title: 'Errore',
    error_generic: 'La registrazione non è andata a buon fine. Riprova più tardi.',
    error_email_inuse: 'L\'indirizzo email è già in uso.',
    signup_signup: 'Registrati',
    signup_title: 'Registrati con',
    signup_subtitle: 'Registrati a Smart Community ',
    signup_name: 'Nome',
    signup_surname: 'Cognome',
    signup_email: 'Inserisci la tua email',
    signup_pwd: 'Inserisci la tua password',
    error_required_fields: 'Tutti i campi sono obbligatori',
    error_password_short: 'La lunghezza della password deve essere di almeno 6 caratteri',
    signup_success_title: 'Registrazione completata!',
    signup_success_text: 'Completa la registrazione cliccando sul link che trovi nella email che ti abbiamo inviato.',
    signup_resend: 'Re-inviare l\'email di conferma',
    signin_pwd_reset: 'Password dimenticata?',
    signin_google_title: 'Accedi con l\'account Google che hai fornito alla scuola:',
    signin_alternative_title: 'Oppure inserisci le tue credenziali Smart Community:',
    error_signin: 'Username/password non validi',
    not_allowed: 'Utente non registrato. Completare il profilo presso la scuola',
    home_absence_before: 'entro le ore ',
    home_retire_before: 'entro le ore ',
    not_allowed_popup_title: 'Errore',
    not_allowed_signin: 'Utente non autorizzato',
    menu_credits: "Credits",
    credits_project: 'Realizzato da:',
    title1: 'Un Giorno A Scuola - Genitori',
    //        title2: 'Genitore',
    credits_sponsored: 'Nell\'ambito del progetto "Inf@nzia DIGItales 3.6" finanziato dal:',
    credits_collaboration: 'In collaborazione con il Dipartimento della Conoscenza della:',
    credits_students: 'Hanno partecipato allo sviluppo:',
    credits_parents: 'Si ringraziano per la collaborazione:',
    credits_parents_2: 'Gli insegnanti e i genitori delle Scuole dell\'Infanzia di Cogolo di Peio (TN) e di Povo di Trento (TN).',
    credits_info: 'Per informazioni: ',
    credits_licenses_button: 'VEDI LICENZE',
    data_updated: 'Dati aggiornati',
    communication_before: 'Da fare entro:',
    communication_done: 'FATTO',
    communication_undone: 'DA FARE',
    lbl_today: 'OGGI',
    lbl_yesterday: 'IERI',
    retire_popup_absent_close: 'CHIUDI',
    input_chat_placeholder: 'Scrivi messaggio',
    pop_up_expired_title: 'Avviso',
    pop_up_expired_template_1: 'Questa versione beta di ',
    pop_up_expired_template_2: ' non è più utilizzabile dal ',
    pop_up_expired_template_3: 'giorni fa',
    pop_up_expired_template_4: '. Per ulteriori informazioni, scrivi a ',
    pop_up_not_expired_title: 'Avviso',
    pop_up_not_expired_template_1: 'Questa versione beta di ',
    pop_up_not_expired_template_2: ' sarà utilizzabile fino al ',
    pop_up_not_expired_template_3: 'mancano ',
    pop_up_not_expired_template_4: ' giorni',
    pop_up_not_expired_template_5: ". Per ulteriori informazioni, scrivi a ",
    popup_app_name: 'Un Giorno A Scuola - Genitori',
    retire_popup_person_cancel: 'Indica chi ritira il bambino',
    add_motivation: 'Aggiungi la motivazione',
    remove_motivation: 'Rimuovi la motivazione',
    type_illness: 'Tipo di malattia:',
    no_messages: 'Non sono presenti messaggi',
    babysetting_active: 'Attivo',
    babysetting_not_active: 'Non attivo'
  });

  $translateProvider.translations('en', {
    menu_home: 'Home',
    menu_issue: 'Segnala un problema',
    home_assenza: 'Assenza',
    home_retire: 'La giornata di ',
    home_bus: 'Bus',
    home_mensa: 'Mensa',
    home_calendario: 'Calendario',
    home_comunicazioni: 'Comunicazioni',
    home_messaggi: 'Messaggi',
    home_contatta: 'Chiama la scuola',
    home_personal_information: 'Informazioni su ',
    home_school_information: 'Informazioni di servizio',
    home_entry_to: ' Entra alle ore ',
    home_exit_to: ' ed esce alle ore ',
    home_absent: 'Assente',
    home_no_connection: 'Connessione assente, alcune funzionalitá sono disabilitate. Controlla la connessione del dispositivo e ',
    go_home_by_bus: ' e torna a casa con il bus.',
    menu_exit: 'Logout',
    menu_enter: 'Entra',
    menu_impostazioni: 'Informazioni',
    babysetting_intro: 'Definisci i seguenti dati relativi all\'orario scolastico del bambino.',
    babysetting_services: 'Servizi',
    babysetting_hours: 'Orario di uscita:',
    babysetting_who: 'Chi ritira il bambino:',
    babysetting_bus: 'Autobus',
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
    tuesday_reduced: "Mart",
    wednesday_reduced: "Merc",
    thursday_reduced: "Giov",
    friday_reduced: "Ven",
    saturday_reduced: "Sab",
    sunday_reduced: "Dom",
    home_disabledbutton: "Funzione disabilitata",
    retire_sendok: "Il ritiro del bambino e' stato confermato",
    retire_sendno: "Problemi di invio dati",
    retire_popup_absent_title: "Attenzione",
    retire_popup_absent_text: "Per la giornata di oggi è stata impostata l'asenza. Inserendo i dati di ritiro lo stato verrà modificato. Confermi?",
    retire_popup_absent_ok: "Conferma",
    retire_popup_absent_cancel: "Annulla",
    retire_popup_toolate_title: "Attenzione",
    retire_popup_toolate_text: "Non è più possibile modificare le modalità di ritiro per oggi. Modifica permessa entro le ore",
    setting_sendok: "Modifica configurazione registrata",
    setting_sendno: "Problemi di invio dati",
    call: "Chiamata",
    send_note: "Messaggio",
    send_note_title: "Invia un messaggio all\'insegnante",
    text: "Testo",
    send: "Invia",
    contact_school: "Contatta la scuola",
    bus_stop: "Fermata bus",
    baby_drops_off_to: "Il bambino scende in",
    whos_waiting_is: "Ad aspettare c'è",
    open: "Aperture",
    close: "Chiusure",
    timepicker_close: "Chiudi",
    period: "Period",
    period_from: "From",
    holiday: "Vacanza",
    meeting: "Riunione genitori",
    trip: "Gita",
    events: "Eventi sul territorio",
    kid_toggle: "Bambino",
    parents_toggle: "Genitori",
    meal: "Pasto",
    lunch: "Pranzo",
    break: "Merenda",
    meals_info: "Info pasti",
    show_type: "Tipo visualizzazione",
    daily: "Giornaliera",
    weekly: "Settimanale",
    monthly: "Mensile",
    absence_date_wrong: "La data di inizio dell'assenza non può essere posteriore a quella di fine dell'assenza.",
    assenza_sendok: 'Assenza inviata con successo',
    assenza_sendno: 'Assenza non inviata',
    absence_choose: 'Selezionare un motivo dell\'assenza.',
    absence_other: "Altro",
    assenza_popup_retire_title: 'Attenzione',
    assenza_popup_retire_text: "Per questa giornata è già stata impostata l'ora di ritiro. Impostando l'assenza i dati di ritiro veranno sovrascritti. Confermi?",
    assenza_popup_retire_cancel: "Annulla",
    assenza_popup_retire_ok: "Conferma",
    assenza_popup_toolate_title: "Attenzione",
    assenza_popup_toolate_text_1: "Non è più possibile inserire un'assenza per oggi. Modifica permessa entro le ore",
    assenza_popup_toolate_text_2: ". Si prega di contattare la scuola telefonicamente.",
    ok: "OK",
    today: "Oggi",
    communication_error: "Errore di comunicazione con il server. Impossibile caricare i dati",
    lbl_login: 'Login',
    text_login_title: 'Un Giorno A Scuola - Genitori',
    text_login_use: 'oppure accedi con',
    login_signin: 'Entra',
    login_signup: 'REGISTRATI',
    error_popup_title: 'Errore',
    error_generic: 'La registrazione non è andata a buon fine. Riprova più tardi.',
    error_email_inuse: 'L\'indirizzo email è già in uso.',
    signup_signup: 'Registrati',
    signup_title: 'Registrati con',
    signup_subtitle: 'Registrati a Smart Community per accedere ad InfanziaDigitales e a tutte le altre App',
    signup_name: 'Nome',
    signup_surname: 'Cognome',
    signup_email: 'Inserisci la tua email',
    signup_pwd: 'Inserisci la tua password',
    error_required_fields: 'Tutti i campi sono obbligatori',
    error_password_short: 'La lunghezza della password deve essere di almeno 6 caratteri',
    signup_success_title: 'Registrazione completata!',
    signup_success_text: 'Completa la registrazione cliccando sul link che trovi nella email che ti abbiamo inviato.',
    signup_resend: 'Re-inviare l\'email di conferma',
    signin_pwd_reset: 'Password dimenticata?',
    signin_google_title: 'Accedi con l\'account Google che hai fornito alla scuola:',
    signin_alternative_title: 'Oppure inserisci le tue credenziali Smart Community:',
    error_signin: 'Username/password non validi',
    not_allowed: 'Utente non registrato. Completare il profilo presso la scuola',
    home_absence_before: 'entro le ore ',
    home_retire_before: 'entro le ore ',
    not_allowed_popup_title: 'Errore',
    not_allowed_signin: 'Utente non autorizzato',
    menu_credits: "Credits",
    credits_project: 'Realizzato da:',
    title1: 'Un Giorno A Scuola - Genitori',
    //        title2: 'Genitore',
    credits_sponsored: 'Nell\'ambito del progetto "Inf@nzia DIGItales 3.6" finanziato dal:',
    credits_collaboration: 'In collaborazione con il Dipartimento della Conoscenza della:',
    credits_students: 'Hanno partecipato allo sviluppo:',
    credits_parents: 'Si ringraziano per la collaborazione:',
    credits_parents_2: 'Gli insegnanti e i genitori delle Scuole dell\'Infanzia di Cogolo di Peio (TN) e di Povo di Trento (TN).',
    credits_info: 'Per informazioni: ',
    credits_licenses_button: 'VEDI LICENZE',
    data_updated: 'Dati aggiornati',
    communications_title: "Comunicazioni della scuola",
    messages_title: "Messaggi",

    communication_before: 'Da fare entro:',
    communication_done: 'FATTO',
    communication_undone: 'DA FARE',
    lbl_today: 'OGGI',
    lbl_yesterday: 'IERI',
    input_chat_placeholder: 'Scrivi messaggio',
    retire_popup_absent_close: 'CHIUDI',
    pop_up_expired_title: 'Avviso',
    pop_up_expired_template_1: 'Questa versione beta di ',
    pop_up_expired_template_2: ' non è più utilizzabile dal ',
    pop_up_expired_template_3: 'giorni fa',
    pop_up_expired_template_4: '. Per ulteriori informazioni, scrivi a ',
    pop_up_not_expired_title: 'Avviso',
    pop_up_not_expired_template_1: 'Questa versione beta di ',
    pop_up_not_expired_template_2: ' sarà utilizzabile fino al ',
    pop_up_not_expired_template_3: 'mancano ',
    pop_up_not_expired_template_4: ' giorni',
    pop_up_not_expired_template_5: ". Per ulteriori informazioni, scrivi a ",
    popup_app_name: 'Un Giorno A Scuola - Genitori',
    retire_popup_person_cancel: 'Indica chi ritira il bambino',
    add_motivation: 'Aggiungi la motivazione',
    remove_motivation: 'Rimuovi la motivazione',
    type_illness: 'Tipo di malattia:',
    no_messages: 'Non sono presenti messaggi',
    babysetting_active: 'Attivo',
    babysetting_not_active: 'Non attivo'

  });

  $translateProvider.translations('de', {
    menu_home: 'Home',
    menu_issue: 'Segnala un problema',
    home_assenza: 'Assenza',
    home_retire: 'La giornata di ',
    home_bus: 'Bus',
    home_mensa: 'Mensa',
    home_calendario: 'Calendario',
    home_comunicazioni: 'Comunicazioni',
    home_messaggi: 'Messaggi',
    home_contatta: 'Chiama la scuola',
    home_personal_information: 'Informazioni su ',
    home_school_information: 'Informazioni di servizio',
    home_entry_to: ' Entra alle ore ',
    home_exit_to: ' ed esce alle ore ',
    home_absent: 'Assente',
    home_no_connection: 'Connessione assente, alcune funzionalitá sono disabilitate. Controlla la connessione del dispositivo e ',
    go_home_by_bus: ' e torna a casa con il bus.',
    menu_exit: 'Logout',
    menu_enter: 'Entra',
    menu_impostazioni: 'Informazioni',
    babysetting_intro: 'Definisci i seguenti dati relativi all\'orario scolastico del bambino.',
    babysetting_services: 'Servizi',
    babysetting_hours: 'Orario di uscita:',
    babysetting_who: 'Chi ritira il bambino:',
    babysetting_bus: 'Autobus',
    babysetting_busGo: 'Fermata bus andata:',
    babysetting_busBack: 'Fermata bus ritorno:',
    retire: "Ritiro",
    retire_bus: "Utilizza il servizio bus",
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
    tuesday_reduced: "Mart",
    wednesday_reduced: "Merc",
    thursday_reduced: "Giov",
    friday_reduced: "Ven",
    saturday_reduced: "Sab",
    sunday_reduced: "Dom",
    home_disabledbutton: "Funzione disabilitata",
    retire_sendok: "Il ritiro del bambino e' stato confermato",
    retire_sendno: "Problemi di invio dati",
    retire_popup_absent_title: "Attenzione",
    retire_popup_absent_text: "Per la giornata di oggi è stata impostata l'asenza. Inserendo i dati di ritiro lo stato verrà modificato. Confermi?",
    retire_popup_absent_ok: "Conferma",
    retire_popup_absent_cancel: "Annulla",
    retire_popup_toolate_title: "Attenzione",
    retire_popup_toolate_text: "Non è più possibile modificare le modalità di ritiro per oggi. Modifica permessa entro le ore",
    setting_sendok: "Modifica configurazione registrata",
    setting_sendno: "Problemi di invio dati",
    send_note: "Messaggio",
    send_note_title: "Invia un messaggio all\'insegnante",
    text: "Testo",
    send: "Invia",
    contact_school: "Contatta la scuola",
    call: "Chiamata",
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
    absence_date_wrong: "La data di inizio dell'assenza non può essere posteriore a quella di fine dell'assenza.",
    assenza_sendok: 'Assenza inviata con successo',
    assenza_sendno: 'Assenza non inviata',
    absence_choose: 'Selezionare un motivo dell\'assenza.',
    noinfo: "No information",
    settings: "Settings",
    cancel: "Cancel",
    timepicker_close: "Chiudi",
    absence: "Insert absence",
    period: "Period",
    period_from: "From",
    period_to: "To",
    reason: "Reason",
    reason_other: "Other...",
    absence_other: "Altro",
    assenza_popup_retire_title: 'Attenzione',
    assenza_popup_retire_text: "Per questa giornata è già stata impostata l'ora di ritiro. Impostando l'assenza i dati di ritiro veranno sovrascritti. Confermi?",
    assenza_popup_retire_cancel: "Annulla",
    assenza_popup_retire_ok: "Conferma",
    assenza_popup_toolate_title: "Attenzione",
    assenza_popup_toolate_text_1: "Non è più possibile inserire un'assenza per oggi. Modifica permessa entro le ore",
    assenza_popup_toolate_text_2: ". Si prega di contattare la scuola telefonicamente.",
    ok: "OK",
    today: "Oggi",
    communication_error: "Communication error",
    lbl_login: 'Login',
    text_login_title: 'Un Giorno A Scuola - Genitori',
    text_login_use: 'oppure accedi con',
    login_signin: 'Entra',
    login_signup: 'REGISTRATI',
    error_popup_title: 'Errore',
    error_generic: 'La registrazione non è andata a buon fine. Riprova più tardi.',
    error_email_inuse: 'L\'indirizzo email è già in uso.',
    signup_signup: 'Registrati',
    signup_title: 'Registrati con',
    signup_subtitle: 'Registrati a Smart Community per accedere ad InfanziaDigitales e a tutte le altre App',
    signup_name: 'Nome',
    signup_surname: 'Cognome',
    signup_email: 'Inserisci la tua email',
    signup_pwd: 'Inserisci la tua password',
    error_required_fields: 'Tutti i campi sono obbligatori',
    error_password_short: 'La lunghezza della password deve essere di almeno 6 caratteri',
    signup_success_title: 'Registrazione completata!',
    signup_success_text: 'Completa la registrazione cliccando sul link che trovi nella email che ti abbiamo inviato.',
    signup_resend: 'Re-inviare l\'email di conferma',
    signin_pwd_reset: 'Password dimenticata?',
    signin_google_title: 'Accedi con l\'account Google che hai fornito alla scuola:',
    signin_alternative_title: 'Oppure inserisci le tue credenziali Smart Community:',
    error_signin: 'Username/password non validi',
    not_allowed: 'Utente non registrato. Completare il profilo presso la scuola',
    home_absence_before: 'entro le ore ',
    home_retire_before: 'entro le ore ',
    not_allowed_popup_title: 'Errore',
    not_allowed_signin: 'Utente non autorizzato',
    menu_credits: "Credits",
    credits_project: 'Realizzato da:',
    title1: 'Un Giorno A Scuola - Genitori',
    credits_sponsored: 'Nell\'ambito del progetto "Inf@nzia DIGItales 3.6" finanziato dal:',
    credits_collaboration: 'In collaborazione con il Dipartimento della Conoscenza della:',
    credits_students: 'Hanno partecipato allo sviluppo:',
    credits_parents: 'Si ringraziano per la collaborazione:',
    credits_parents_2: 'Gli insegnanti e i genitori delle Scuole dell\'Infanzia di Cogolo di Peio (TN) e di Povo di Trento (TN).',
    credits_info: 'Per informazioni: ',
    credits_licenses_button: 'VEDI LICENZE',
    data_updated: 'Dati aggiornati',
    communications_title: "Comunicazioni della scuola",
    messages_title: "Messaggi",
    communication_before: 'Da fare entro:',
    communication_done: 'FATTO',
    communication_undone: 'DA FARE',
    lbl_today: 'OGGI',
    lbl_yesterday: 'IERI',
    input_chat_placeholder: 'Scrivi messaggio',
    retire_popup_absent_close: 'CHIUDI',
    pop_up_expired_title: 'Avviso',
    pop_up_expired_template_1: 'Questa versione beta di ',
    pop_up_expired_template_2: ' non è più utilizzabile dal ',
    pop_up_expired_template_3: 'giorni fa',
    pop_up_expired_template_4: '. Per ulteriori informazioni, scrivi a ',
    pop_up_not_expired_title: 'Avviso',
    pop_up_not_expired_template_1: 'Questa versione beta di ',
    pop_up_not_expired_template_2: ' sarà utilizzabile fino al ',
    pop_up_not_expired_template_3: 'mancano ',
    pop_up_not_expired_template_4: ' giorni',
    pop_up_not_expired_template_5: ". Per ulteriori informazioni, scrivi a ",
    popup_app_name: 'Un Giorno A Scuola - Genitori',
    retire_popup_person_cancel: 'Indica chi ritira il bambino',
    add_motivation: 'Aggiungi la motivazione',
    remove_motivation: 'Rimuovi la motivazione',
    type_illness: 'Tipo di malattia:',
    no_messages: 'Non sono presenti messaggi',
    babysetting_active: 'Attivo',
    babysetting_not_active: 'Non attivo'

  });

  $translateProvider.preferredLanguage("it");
  $translateProvider.fallbackLanguage("it");
});
