angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $rootScope, $location, $state, $filter, $q, $ionicPopup, $ionicLoading, dataServerService, profileService, configurationService, retireService, busService, Toast, Config, pushNotificationService, messagesService, communicationsService) {

    $scope.date = "";
    $scope.kidProfile = {};
    $scope.kidConfiguration = {};
    $scope.school = {};
    $scope.notes = {};
    $scope.communications = [];
    $rootScope.numberCommunicationsUnread = {};
    $rootScope.numberMessageUnread = {};
    $scope.fromTime = "";
    $scope.toTime = "";
    //build options
    $scope.elements = [];
    $scope.dailyFermata = null;
    $scope.dailyRitiro = null;
    $rootScope.allowed = true;
    //$rootScope.absenceLimitHours = 9;
    //$rootScope.absenceLimitMinutes = 15;
    $rootScope.retireLimit = 10;
    $scope.refresh = function () {
        //window.location.reload(true);
        $scope.getConfiguration();
    }

    $scope.goTo = function (location) {

        window.location.assign(location);
    }

    $scope.getDateString = function () {
        var today = new Date();
        $scope.date = today.getTime();;
    }

    var isRetireSet = function () {
        if ($scope.dailyFermata || $scope.dailyRitiro) {
            return true
        }
        return false
    }
    var isBusDisabled = function () {
        if (!$scope.kidConfiguration.services.bus.active) {
            return true
        }
        return false
    }
    var isBusSet = function () {
        if (busService.getDailyBusStop()) {
            return true
        }
        return false
    }
    var getButtonStyle = function (button) {
            if (button == "default") {
                return "button-norm"
            }
            if (button == "retire") {
                if (isRetireSet()) {
                    return "button-norm";
                }
                return "button-alrt";
            }
            if (button == "bus") {
                if (isBusDisabled()) {
                    return "button-stab";
                }
                if (isRetireSet()) {
                    return "button-norm";
                }
                return "button-alrt";

            }
            if (button == "disabled") {
                return "button-norm disabled";
            }
        }
        //!dailyFermata">
        //        {{'home_entry_to' | translate}} {{fromTime}}{{'home_exit_to' | translate}}{{toTime}}</div>
        //    <div ng-if="dailyFermata">
        //        {{'home_entry_to' | translate}} {{fromTime}}{{'go_home_by_bus' | translate}}
        //
    var buildHome = function () {
        var style = null;
        //build the array
        $scope.elements = [];
        style = getButtonStyle("retire");
        $scope.elements.push({
            click: "app.retire",
            string: $filter('translate')('home_retire') + $scope.kidProfile.firstName,
            note: ($scope.dailyFermata ? $filter('translate')('home_entry_to') + $scope.fromTime + $filter('translate')('go_home_by_bus') : $filter('translate')('home_entry_to') + $scope.fromTime + $filter('translate')('home_exit_to') + $scope.toTime),
            class: style,
            img: 'img/ritiro.png',
            disabled: false
        });
        style = getButtonStyle("default");
        $scope.elements.push({
            click: "app.absence",
            string: $filter('translate')('home_assenza'),
            //            note: $filter('translate')('home_absence_before') + $rootScope.absenceLimitHours + '.' + $rootScope.absenceLimitMinutes,
            class: style,
            img: 'img/assenza.png',
            disabled: false
        });


        style = ($rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId] ? "button-alrt" : "button-norm");
        $rootScope.buttonHomeCommunication = {
            click: "app.communications",
            string: $filter('translate')('home_comunicazioni'),
            note: $filter('translate')('home_comunicazioni_unread') + $rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId],
            class: style,
            img: 'img/comunicazioni.png',
            disabled: false
        };

        $scope.elements.push($rootScope.buttonHomeCommunication);
        style = ($rootScope.numberMessageUnread[$scope.kidProfile.kidId] ? "button-alrt" : "button-norm");
        $rootScope.buttonHomeMessage = {
            click: "app.messages",
            string: $filter('translate')('home_messaggi'),
            note: $filter('translate')('home_messaggi_unread') + $rootScope.numberMessageUnread[$scope.kidProfile.kidId],
            class: style,
            img: 'img/chat.png',
            disabled: false
        };

        $scope.elements.push($rootScope.buttonHomeMessage);
        style = getButtonStyle("default");
        $scope.elements.push({
            click: function () {
                $scope.call();
            },
            string: $filter('translate')('home_contatta'),
            class: style,
            img: 'img/contattaLaScuola.png',
            disabled: false
        });
        /*//if bus is available put it
        if (profileService.getBabyProfile().services.bus.enabled) {
            style = getButtonStyle("bus");
            $scope.elements.push({
                click: "app.bus",
                string: $filter('translate')('home_bus'),
                class: style,
                img: 'img/bus.png'
            });
        }*/
        /*if (profileService.getBabyProfile().services.mensa.enabled) {
            style = getButtonStyle("default");
            $scope.elements.push({
                click: "app.canteen",
                string: $filter('translate')('home_mensa'),
                class: style,
                img: 'img/mensa.png'
            });
        }*/
        $ionicLoading.hide();

    }
    var contact = function () {
        $scope.contactPopup = $ionicPopup.show({
            templateUrl: 'templates/contacts.html',
            title: $filter('translate')('contact_school'),
            scope: $scope,
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: $filter('translate')('cancel'),
                type: 'button-norm',
                onTap: function (e) {
                    $scope.contactPopup.close();
                    $scope.call();
                }
              }]
        });
    }
    $scope.call = function () {
        var num = profileService.getSchoolProfile().contacts.telephone[0];
        window.open('tel:' + num);
        $scope.contactPopup.close();
    }
    $scope.createNote = function () {
        $state.go('app.addnote');
        $scope.contactPopup.close();
    };

    $scope.execute = function (element) {
        if (element.class != "button-stable") {
            if (typeof element.click == "string") {
                $state.go(element.click);
            } else {
                element.click();
            }
        } else {
            Toast.show($filter('translate')('home_disabledbutton'), 'short', 'bottom');
        }
    }

    var checkNewCommunication = function (Allcommunications, schoolId) {
        //return number of comunications from localstorage (all the new omunication not visualized get from push)
        return pushNotificationService.getNewComunications(schoolId);
    }

    $rootScope.loadConfiguration = function () {
        var deferred = $q.defer();
        $ionicLoading.show();
        $scope.kidProfile = profileService.getBabyProfile();
        var schoolId = $scope.kidProfile.schoolId;
        var kidId = $scope.kidProfile.kidId;
        dataServerService.getBabyConfigurationById(schoolId, kidId).then(function (data) {
            var config = data;

            $scope.kidConfiguration = config;
            configurationService.setBabyConfiguration(config);
            //getSchoolProfile(appId, schoolId) puo' essere diversa in base al bambino
            //ottengo
            //ottengo la scuola in base alla schoolId del bambino
            dataServerService.getSchoolProfile(schoolId, kidId).then(function (data) {
                var profile = data;
                profileService.setSchoolProfile(profile);
                $scope.school = profile;
                dataServerService.getRitiro($scope.kidProfile.schoolId, $scope.kidProfile.kidId, new Date().getTime()).then(function (data) {
                    $scope.dailyRitiro = data;
                    dataServerService.getFermata($scope.kidProfile.schoolId, $scope.kidProfile.kidId, new Date().getTime()).then(function (data) {
                        $scope.dailyFermata = data;
                        if (config == null) {
                            //use default data from profile to create config
                            var exitTime = null;
                            if (!$scope.kidProfile.services.posticipo.enabled) {
                                exitTime = $filter('date')(new Date(profileService.getSchoolProfile().regularTiming.toTime), 'H:mm');
                            } else {
                                exitTime = $filter('date')(new Date(profileService.getSchoolProfile().posticipoTiming.toTime), 'H:mm');
                            }
                            config = {
                                "appId": Config.appId(),
                                "schoolId": schoolId,
                                "kidId": kidId,
                                "services": {
                                    "anticipo": {
                                        "active": $scope.kidProfile.services.anticipo.enabled
                                    },
                                    "posticipo": {
                                        "active": $scope.kidProfile.services.posticipo.enabled
                                    },
                                    "bus": {
                                        "active": $scope.kidProfile.services.bus.enabled,
                                        "defaultIdGo": $scope.kidProfile.services.bus.stops[0].stopId,
                                        "defaultIdBack": $scope.kidProfile.services.bus.stops[0].stopId
                                    },
                                    "mensa": {
                                        "active": $scope.kidProfile.services.mensa.enabled
                                    }
                                },
                                "exitTime": exitTime,
                                "defaultPerson": $scope.kidProfile.persons[0].personId,
                                "receiveNotification": true,
                                "extraPersons": null
                            }
                            $scope.kidConfiguration = config;
                            configurationService.setBabyConfiguration(config);
                        }
                        dataServerService.getAbsence($scope.kidProfile.schoolId, $scope.kidProfile.kidId, new Date().getTime()).then(function (data) {
                            if (data.data == null) {
                                $scope.isPresent = true;

                                if (($scope.kidProfile.services.anticipo.enabled && !$scope.kidConfiguration) || ($scope.kidProfile.services.anticipo.enabled && $scope.kidConfiguration.services.anticipo.active)) {
                                    $scope.fromTime = $scope.school.anticipoTiming.fromTime;
                                } else {
                                    $scope.fromTime = $scope.school.regularTiming.fromTime;
                                }

                                if ($scope.dailyRitiro) {
                                    $scope.toTime = new Date($scope.dailyRitiro.date).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substr(0, 5);
                                } else {
                                    if (!$scope.kidProfile.services.posticipo.enabled) {
                                        $scope.toTime = profileService.getSchoolProfile().regularTiming.toTime;
                                    } else {
                                        $scope.toTime = profileService.getSchoolProfile().posticipoTiming.toTime;
                                    }
                                    if ($scope.dailyFermata) {
                                        //                                            $scope.toTime = $scope.toTime + " con il servizio bus";
                                        $scope.toTime = " con il servizio bus";
                                    }
                                }
                            } else {
                                //il ragazzo e' assente
                                $scope.isPresent = false;

                            }
                            buildHome();

                            //Toast.show($filter('translate')('data_updated'), 'short', 'bottom');
                            deferred.resolve();

                        }, function (error) {
                            console.log("ERROR -> " + error);
                            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');

                            $ionicLoading.hide();
                            deferred.reject();

                        });
                    }, function (error) {
                        console.log("ERROR -> " + error);
                        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');

                        $ionicLoading.hide();
                        deferred.reject();

                    });
                }, function (error) {
                    console.log("ERROR -> " + error);
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');

                    $ionicLoading.hide();
                    deferred.reject();
                });
            });



        }, function (error) {
            console.log("ERROR -> " + error);
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
        });
        return deferred.promise;
    }
    var registerPushNotification = function (data) {
        if (data) {
            var arrayOfSchoolId = [];
            for (var i = 0; i < data.length; i++) {
                if (arrayOfSchoolId.indexOf(data[i].schoolId) == -1) {
                    arrayOfSchoolId.push(data[i].schoolId);
                }
            }
            pushNotificationService.register(arrayOfSchoolId);

        }
    }
    var getMessages = function () {
        var messagePromises = [];
        for (var i = 0; i < profileService.getBabiesProfiles().length; i++) {
            var kidProfile = profileService.getBabiesProfiles()[i];
            messagePromises.push(messagesService.getUnreadMessages(kidProfile.schoolId, kidProfile.kidId));
        }
        $q.all(messagePromises).then(function (values) {
            for (var i = 0; i < values.length; i++) {
                $rootScope.numberMessageUnread[profileService.getBabiesProfiles()[i].kidId] = values[i];
            }
        });
    }
    var getCommunications = function () {
            var communicationPromises = [];

            for (var i = 0; i < profileService.getBabiesProfiles().length; i++) {
                var kidProfile = profileService.getBabiesProfiles()[i];
                communicationPromises.push(communicationsService.getCommunications($scope.kidProfile.schoolId, $scope.kidProfile.kidId));
            }
            $q.all(communicationPromises).then(function (values) {
                for (var i = 0; i < values.length; i++) {
                    $rootScope.numberCommunicationsUnread[profileService.getBabiesProfiles()[i].schoolId] = checkNewCommunication(values[i], profileService.getBabiesProfiles()[i].schoolId);
                }
            });
        }
        //corretto tutte e tre annidate? cosa succede se una salta? ma come faccio a settare il profilo temporaneo senza avere conf, prof????
    $scope.getConfiguration = function () {
        if (profileService.getBabiesProfiles().length == 0) {
            //parto da getBabyProfiles()(appid incluso nel server e qui ottengo schoolId e kidId
            $ionicLoading.show();
            dataServerService.getBabyProfiles().then(function (data) {
                    //in data ho tutti i profili dei kids: memorizzo in locale e ottengo le configurazioni
                    //tmp default $scope.kidConfiguration = data[0]; poi dovro' gestire un refresh delle informazioni quando switcho da profilo ad un altro
                    //se non settato prendo il primo
                    if (profileService.getBabyProfile() == null) {
                        $scope.kidProfile = data[0];
                        profileService.setBabiesProfiles(data);
                        profileService.setBabyProfile(data[0]);
                        registerPushNotification(data);
                    } else {
                        $scope.kidProfile = profileService.getBabyProfile();
                    }
                    //                    $scope.loadConfiguration($scope.kidProfile.schoolId, $scope.kidProfile.kidId);
                    $scope.loadConfiguration();
                    $rootScope.allowed = true;

                    //get messages from last time
                    //load all message from all profiles
                    getMessages();


                    //get communication from last time
                    getCommunications();


                },
                function (error) {
                    console.log("ERROR -> " + error);
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                    $ionicLoading.hide();
                    if (error == 406) {
                        $rootScope.allowed = false;
                    }
                });
        } else {
            $scope.loadConfiguration();
            $rootScope.allowed = true;
            getMessages();
            getCommunications();

        }
    }

    //watch the root variables which changes in case of notifications
    $scope.$watch('numberCommunicationsUnread', function () {
        if ($scope.kidProfile && $scope.kidProfile.kidId) {
            var style = ($rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId] ? "button-alrt" : "button-norm");
            if ($rootScope.buttonHomeCommunication) {
                $rootScope.buttonHomeCommunication.note = $filter('translate')('home_comunicazioni_unread') + $rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId];
                $rootScope.buttonHomeCommunication.class = style;
            }
        }
    }, true);
    $scope.$watch('numberMessageUnread', function () {
        if ($scope.kidProfile && $scope.kidProfile.kidId) {
            var style = ($rootScope.numberMessageUnread[$scope.kidProfile.kidId] ? "button-alrt" : "button-norm");
            if ($rootScope.buttonHomeMessage) {
                $rootScope.buttonHomeMessage.note = $filter('translate')('home_messaggi_unread') + $rootScope.numberMessageUnread[$scope.kidProfile.kidId];
                $rootScope.buttonHomeMessage.class = style;
            }
        }
    }, true);
    Config.init().then(function () {
        $rootScope.absenceLimitHours = Config.getAbsenceLimitHours();
        $rootScope.absenceLimitMinutes = Config.getAbsenceLimitMinutes();
    });

    $scope.getConfiguration();

});
