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
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.absence',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.babysetting',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.retire',
    'it.smartcommunitylab.infanziadigitales.diario.parents.controllers.authorization',
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
    'it.smartcommunitylab.infanziadigitales.diario.parents.services.canteenService',
		'it.smartcommunitylab.infanziadigitales.diario.parents.services.loginService',
    'angularMoment'
])

.run(function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $state, $translate, $q, $window, $ionicHistory, $ionicConfig, Config, 
								configurationService, profileService, dataServerService, loginService, Toast) {

	$rootScope.getUserId = function () {
			return localStorage.userId;
	};

	$rootScope.userIsLogged = function() {
		return (localStorage.userId != null && localStorage.userId != "null");	
	};
	
	$rootScope.loginStarted = false;
	$rootScope.authWindow = null;
	
	$rootScope.login = function () {
		if ($rootScope.loginStarted) return;

		$rootScope.loginStarted = true;
		loginService.login().then(
			function (data) {
				$rootScope.loginStarted = false;
				localStorage.userId = data.userId;
				$state.go('app.home', {}, {
        	reload: true
        });				
			},
			function (error) {
				//The user denied access to the app
				$rootScope.loginStarted = false;
				localStorage.userId = null;
				alert('autenticazione non riuscita');
				ionic.Platform.exitApp();
			}
		);
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

		if(!$rootScope.userIsLogged()) {
			$rootScope.login();
		} else {
			$state.go('app.home', {}, {
				reload: true
			});				
		}
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

	.state('login', {
			cache: false,
			url: '/login',
			abstract: false,
			views: {
					'menuContent': {
							templateUrl: "templates/login.html",
							controller: 'AppCtrl'
					}
			}
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');

	$translateProvider.translations('it', {
			menu_home: 'Home',
			home_assenza: 'Assenza',
			home_retire: 'Ritiro',
			home_bus: 'Bus',
			home_mensa: 'Mensa',
			home_calendario: 'Calendario',
			home_contatta: 'Contatta',
			home_personal_information: 'Note della maestra',
			home_school_information: 'Comunicazioni ',
			home_entry_to: ' entra alle ore ',
			home_exit_to: ' ed esce alle ore ',
			menu_exit: 'Esci',
			menu_enter: 'Entra',
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
			absence_date_wrong: "La data d'inizio dell'assenza succede quella della fine. Modificare le date.",
			assenza_sendok: 'Assenza inviata con successo',
			assenza_sendno: 'Assenza non inviata',
			absence_choose: 'Selezionare un motivo dell\'assenza',
			noinfo: "Nessuna informazione",
			settings: "Impostazioni di base",
			cancel: "Annulla",
			absence: "Inserisci assenza",
			period: "Periodo",
			period_from: "Da",
			period_to: "A",
			reason: "Motivazione",
			reason_other: "Altro...",
			absence_other: "Altro"
	});

	$translateProvider.translations('en', {
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
			setting_sendok: "Modifica configurazione registrata",
			setting_sendno: "Problemi di invio dati",
			call: "Chiama",
			send_note: "Invia una nota",
			text: "Testo",
			send: "Invia",
			contact_school: "Contatta la scuola",
			bus_stop: "Fermata bus",
			baby_drops_off_to: "Il bambino scende in",
			whos_waiting_is: "Ad aspettare c'è",
			open: "Aperture",
			close: "Chiusure",
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
			absence_date_wrong: "La data d'inizio dell'assenza succede quella della fine. Modificare le date.",
			assenza_sendok: 'Assenza inviata con successo',
			assenza_sendno: 'Assenza non inviata',
			absence_choose: 'Selezionare un motivo dell\'assenza',
			absence_other: "Altro"

	});

	$translateProvider.translations('de', {
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
			babysetting_bus: 'Autobus',
			babysetting_busGo: 'Fermata bus andata:',
			babysetting_busBack: 'Fermata bus ritorno:',
			retire: "Ritiro",
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
			absence_date_wrong: "La data d'inizio dell'assenza succede quella della fine. Modificare le date.",
			assenza_sendok: 'Assenza inviata con successo',
			assenza_sendno: 'Assenza non inviata',
			absence_choose: 'Selezionare un motivo dell\'assenza',
			noinfo: "No information",
			settings: "Settings",
			cancel: "Cancel",
			absence: "Insert absence",
			period: "Period",
			period_from: "From",
			period_to: "To",
			reason: "Reason",
			reason_other: "Other...",
			absence_other: "Altro"


	});

	$translateProvider.preferredLanguage("it");
	$translateProvider.fallbackLanguage("it");
});
