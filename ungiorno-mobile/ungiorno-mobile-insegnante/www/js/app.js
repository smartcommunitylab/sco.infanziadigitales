// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('it.smartcommunitylab.infanziadigitales.teachers', [
    'ionic',
    'ngCordova',
    'pascalprecht.translate',
    'ionic-datepicker',
    'it.smartcommunitylab.infanziadigitales.teachers.filters',
    'it.smartcommunitylab.infanziadigitales.teachers.directives',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.common',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.home',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.communications',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.bus',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.babyprofile',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.calendar',
    'it.smartcommunitylab.infanziadigitales.teachers.services.conf',
    'it.smartcommunitylab.infanziadigitales.teachers.services.babyConfigurationService',
    'it.smartcommunitylab.infanziadigitales.teachers.services.dataServerService',
    'it.smartcommunitylab.infanziadigitales.teachers.services.profileService',
    'it.smartcommunitylab.infanziadigitales.teachers.services.sectionService',
    'it.smartcommunitylab.infanziadigitales.teachers.services.communicationService',
    'it.smartcommunitylab.infanziadigitales.teachers.services.teachersService',
    'it.smartcommunitylab.infanziadigitales.teachers.controllers.login',
		'it.smartcommunitylab.infanziadigitales.teachers.services.loginService',
		'it.smartcommunitylab.infanziadigitales.teachers.services.storageService',
		'it.smartcommunitylab.infanziadigitales.teachers.services.pushNotificationService',
		'it.smartcommunitylab.infanziadigitales.teachers.services.messagesService',
    'angularMoment',
  'monospaced.elastic'
])
.directive('select',function(){ //same as "ngSelect"
return {
    restrict: 'E',
    scope: false,
    link: function (scope, ele) {
        ele.on('touchmove touchstart',function(e){
            e.stopPropagation();
        })
    }
}
})
.run(function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $state, $translate, $q, $ionicHistory, $ionicConfig, $ionicLoading, Config,
  babyConfigurationService, profileService, dataServerService, loginService, Toast, $ionicSideMenuDelegate) {
  $ionicLoading.show();
  $rootScope.getUserId = function () {
    return localStorage.userId;
  };

  $rootScope.userIsLogged = function () {
    return (localStorage.userId != null && localStorage.userId != "null");
  };

  $rootScope.loginStarted = false;
  $rootScope.authWindow = null;

 newAppVersion = function () {
   //check if it is a new app version 
   var isNew =true;
   var thisversion =Config.getResetVersion();
   //if localstorage has version and it is equal to this return false else clear localstorage
   if (localStorage.getItem('reset_version'))
   {
     var oldVersion = localStorage.getItem('reset_version');
     if (thisversion==oldVersion)
      {
        return false
      }
   }
   localStorage.clear();
   localStorage.setItem('reset_version',thisversion);
   return true;
 }

  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.screenorientation) {
      //screen.lockOrientation('landscape');
    }
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
 
 
//  cordova.getAppVersion.getVersionNumber().then(function (version) {
       if (!newAppVersion() && loginService.userIsLogged()) {    
    // if (loginService.userIsLogged()) {
      //            $ionicHistory.clearCache().then(function () {
      //$ionicHistory.clearCache();
      console.log("user is logged");
      loginService.login('googlelocal').then(

        function (data) {
          $state.go('app.home');
          $ionicHistory.nextViewOptions({
            disableBack: true,
            historyRoot: true
              //                });
          });
        });

    }
  // })
    $ionicLoading.hide();
    // $rootScope.getConfiguration();

    //        if (!$rootScope.userIsLogged()) {
    //            $rootScope.login();
    //        } else {
    //            $state.go('app.home', {}, {
    //                reload: true
    //            });
    //        }
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
  $ionicConfigProvider.tabs.position('top');
  var view=ionic.Platform.isWebView();
  console.log(view);
  if(!view){
    $httpProvider.defaults.withCredentials=true;
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

  .state('app.section', {
      cache: false,
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
    .state('app.login', {
      cache: false,
      url: "/login",
      views: {
        'menuContent': {
          templateUrl: "templates/login.html",
          controller: 'LoginCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');

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
    menu_bus: 'Bus',
    menu_exit: 'Logout',
    menu_enter: 'Entra',
    menu_issue: 'Segnala problema ',
    menu_privacy: 'Privacy',
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
    note_teacher_label: "Messaggio da: ",
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
    all_section: "Tutte",
    logout: "Esci",
    parents_alerts: "Comunicazioni",
    enter_at: "Entra alle: ",
    exit_at: "Esce alle: ",
    is: "è",
    bus_stop_go: "Fermata bus andata: ",
    bus_stop_back: "Fermata bus ritorno: ",
    bus_stop_drops_off: "Scende a ",
    bus_stop_person_wait: "Ad aspettare c'è:",
    person_who_retire: "Persona incaricata del ritiro: ",
    parents_notes: "Messaggi ricevuti",
    teachers_notes: "Messaggi inviati",
    arguments: "Argomento",
    description: "Descrizione",
    send: "Invia",
    baby_info: "INFORMAZIONI UTILI",
    parent_one: "Genitore 1",
    parent_two: "Genitore 2",
    food_allergies: "Allergie alimentari: ",
    teachers: "Maestre",
    extra_delegation: "Questa è una delega straordinaria",
    view_delegation: "Vedi delega",
    home_anticipo: "Anticipo",
    home_orario_normale: "Orario Normale",
    home_posticipo: "Posticipo",
    exit: "Uscito",
    present: "Presente",
    today: "Oggi",
    select_argument: "Seleziona un argomento",
    type_description: "Immetti una descrizione",
    note_sent_success: "Nota registrata con successo",
    note_sent_fail: "Nota non mandata correttamente",
    baby_bus_2a: "\" salgono",
    baby_bus_2b: "\" sale",
    baby_bus_1: ", sul bus \"",
    baby_bus_3a: "bambini",
    baby_bus_3b: "bambino",
    buses: 'Bus',
    communication_description: 'Scrivi qui il testo della comunicazione',
    parent_communications: 'Comunicazioni ai genitori',
    communication_new: 'NUOVA COMUNICAZIONE',
    communication_edit: 'MODIFICA COMUNICAZIONE',
    communication_type: 'Tipo di comunicazione',
    communication_type_parents: 'Con richiesta ai genitori',
    communication_type_without_parents: 'Senza richiesta ai genitori',
    communication_of: 'Comunicazione del',
    communication_sent: 'Comunicazione inviata correttamente',
    communication_updated: 'Comunicazione aggiornata correttamente',
    communication_fail: 'Comunicazione non inviata',
    communication_check: 'Controlla consegne',
    communication_delete_title: 'Elimina comunicazione',
    communication_delete_confirm: 'Sei sicuro di voler eliminare la comunicazione?',
    communication_delete_fail: 'Comunicazione non eliminata',
    communication_deleted: 'Comunicazione eliminata',
    communication_function_not_possible: 'Impossibile modificare questo elemento',
    communication_annulla: 'ANNULLA',
    communication_invia: 'INVIA',
    communication_modifica: 'MODIFICA',
    communication_kind: 'Tipo di comunicazione:',
    retry: 'Riprova',
    deadline: 'Scadenza consegna',
    deadline_time: 'Data di scadenza',
    cancel: 'Annulla',
    ok: 'OK',
    because: 'per ',
    absent: 'Assente',
    new_note: 'Nuova voce',
    create_new_note: 'Crea una nuova voce',
    associate_to_childs: 'Associa bambini',
    new_note_fail: 'Nuova voce non inviata',
    new_note_sent: 'Nuova voce inviata',
    associated_kids: 'Bambini associati:',
    baby_name: 'Nome bambino',
    create_note: 'Crea voce',
    close: 'Chiudi',
    save: 'Salva',
    no_baby_bus: 'Nessun bambino su questo autobus',
    no_communications_home: "Non sono presenti comunicazioni con scadenza",
    no_communications: "Non sono presenti comunicazioni. Tocca + in alto a destra per aggiungerne una",
    no_notes_today: "Nessuna voce oggi",
    communication_modified: "Modifica registrata con successo",
    communication_not_modified: "La modifica non è stata registrata",
    profile_no_notes: "Nessuna nota presente",
    scadenze: " scadenze",
    login_title: 'Un Giorno A Scuola Insegnanti',
    login_subtitle: 'sperimentazione',
    login_google: 'Accedi',
    exit_to: 'Esce alle ',
    loading_data: 'Caricamento dati',
    authentication_error: 'Problemi di autenticazione. Verificare la connessione',
    class_diary: ' DIARIO DI CLASSE',
    send_note: 'Invia messaggio al genitore',
    communication_empty: 'Inserire una descrizione',
    popup_datepicker_title: 'Selezionare il giorno',
    popup_datepicker_today: 'Oggi',
    popup_datepicker_close: 'Annulla',
    popup_datepicker_set: 'Ok',
    popup_datepicker_jan: 'Gen',
    popup_datepicker_feb: 'Feb',
    popup_datepicker_mar: 'Mar',
    popup_datepicker_apr: 'Apr',
    popup_datepicker_may: 'Mag',
    popup_datepicker_jun: 'Giu',
    popup_datepicker_jul: 'Lug',
    popup_datepicker_ago: 'Ago',
    popup_datepicker_sep: 'Set',
    popup_datepicker_oct: 'Ott',
    popup_datepicker_nov: 'Nov',
    popup_datepicker_dic: 'Dic',
    popup_datepicker_mon: 'L',
    popup_datepicker_tue: 'M',
    popup_datepicker_wed: 'M',
    popup_datepicker_thu: 'G',
    popup_datepicker_fri: 'V',
    popup_datepicker_sat: 'S',
    popup_datepicker_sun: 'D',
    communication_discard: 'Annulla',
    communication_confirm: 'Conferma',
    send_note_type: 'Tipologia di nota: ',
    profile_no_parents_notes1: 'I genitori di ',
    profile_no_parents_notes2: ' non hanno inviato nessun messaggio oggi',
    profile_no_teacher_notes: 'Oggi non è stato inviato nessun messaggio ai genitori di ',
    baby_not_monitored: ' non è monitorato dal sistema ',
    communication_error: 'Errore di connessione',
    absence_type: 'Motivazione: ',
    not_allowed_popup_title: 'Errore',
    not_allowed_signin: 'Utente non autorizzato',
    child_not_partecipate: 'Il bambino non partecipa al servizio UGAS',
    home_scadenze: "Seleziona i bambini che hanno effettuato la consegna",
    data_updated: "Dati aggiornati",
    function_disabled: 'Funzione disabilitata',
    credits_project: 'Realizzato da:',
    title1: 'Un Giorno A Scuola - Insegnanti',
    //        title2: 'Genitore',
    credits_sponsored1: "Nell'ambito del progetto \"DIGI@school&family\" che fa seguito alla sperimentazione relativa al progetto",
  credits_sponsored2: "finanziato dal",
  credits_collaboration: "In collaborazione con il Dipartimento della Conoscenza della:",
  credits_collaboration_uni:"con la collaborazione di",
  credits_students: "Hanno partecipato allo sviluppo:",
  credits_parents: "Si ringraziano per la collaborazione:",
  credits_parents_2: "Gli insegnanti e i genitori delle Scuole dell’Infanzia di Cogolo e Povo (TN)",
  credits_info: "Per informazioni: ",
  credits_licenses_button: "VEDI LICENZE",
    menu_credits: "Credits",
    relation_parent: 'Genitore',
    comm_you_must_save_title: 'Attenzione',
    comm_you_must_save_text: 'Le modifiche effettuate sono state salvate localmente ma non sono definitive. Premi "SALVA" per confermarle.',
    parent: 'Genitore ',
    lbl_today: 'OGGI',
    lbl_yesterday: 'IERI',
    send_msg_placeholder: 'Scrivi messaggio',
    chat_teacher_label: 'Maestra ',
    chat_write_label: ' scrive...',
    no_messages: 'Non sono presenti messaggi',
    input_chat_placeholder: 'Scrivi messaggio',
    no_parents: 'Nessun genitore',
    no_allergies: 'Nessuna allergia',
    pop_up_expired_title: 'Avviso',
    pop_up__expired_template: 'Ci scusiamo ma non è più possibile utilizzare questa versione dell\'applicazione in quanto il periodo di prova è terminata',
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
    people_retire: 'Autorizzati al ritiro del bambino:',
    no_other_people: 'Nessuna altra persona',
    chat_lock_label: 'Digita qui il tuo PIN numerico',
    chat_lock_button: 'ENTRA NELLA CHAT',
    insert_pin_template: 'Per scrivere nella chat devi digitare il tuo PIN numerico.',
    insert_pin_title: 'Richiesta PIN',
    insert_pin_placeholder: 'Digita qui il tuo PIN',
    insert_pin_confim_button: 'Conferma',
    chat_exit_button: 'Esci',
    user_auth: 'Hai eseguito l\'accesso come ',
    user_not_auth: 'Utente non autenticato',
    user_exit_auth: 'Utente uscito correttamente',
    signal_send_no_connection_title: 'Attenzione!',
    signal_send_no_connection_template: 'Connessione assente! Controlla la connessione del dispositivo e ricarica la pagina',
    signal_send_toast_alarm: 'Errore di connessione',
    no_connection_message: 'Nessuna connessione',
    error_pin: 'PIN errato',
    home_number_deliveries: 'Consegne completate: ',
    home_out_of_deliveries: ' su ',
    entry_lbl:'E',
    exit_lbl:'U',
    invia:'Invia a',
    missing_school_config:"Manca Servizio Scolastico Regolare",
    all:'Tutti',
    com_dt:'Imposta scadenza comunicazione',
    com_del:'La comunicazione verrà eliminata nel giorno indicato',
    auth_person:"Incaricato del ritiro",
    none_f:"Nessuna fermata specificata",
    no_person:"Nessuna persona specificata"
  });

  $translateProvider.preferredLanguage("it");
  $translateProvider.fallbackLanguage("it");
});
