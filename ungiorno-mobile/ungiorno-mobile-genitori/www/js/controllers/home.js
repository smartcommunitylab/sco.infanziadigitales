angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $rootScope, $location, dataServerService, profileService, configurationService, $filter, retireService, busService, $state, Toast, $ionicModal, Config) {

    $scope.date = "";
    $scope.kidProfile = {};
    $scope.kidConfiguration = {};
    $scope.school = {};
    $scope.notes = {};
    $scope.fromTime = "";
    $scope.toTime = "";
    //build options
    $scope.elements = [];


    $scope.goTo = function (location) {
        window.location.assign(location);
    }

    $scope.getDateString = function () {
        var today = new Date();
        $scope.date = today.getTime();;
    }

    var isRetireSet = function () {
        if (retireService.getDailyRetire()) {
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
            return "button-positive"
        }
        if (button == "retire") {
            if (isRetireSet()) {
                return "button-positive";
            }
            return "button-assertive";

        }
        if (button == "bus") {
            if (isBusDisabled()) {
                return "button-stable";
            }
            if (isBusSet() || isRetireSet()) {
                return "button-positive";
            }
            return "button-assertive";

        }

    }

    var buildHome = function () {
        var style = null;
        //build the array
        $scope.elements = [];
        style = getButtonStyle("retire");
        $scope.elements.push({
            click: "app.retire",
            string: $filter('translate')('home_retire'),
            class: style,

        });
        //if bus is available put it
        if (profileService.getBabyProfile().services.bus.enabled) {
            style = getButtonStyle("bus");
            $scope.elements.push({
                click: "app.bus",
                string: $filter('translate')('home_bus'),
                class: style,
            });
        }
        style = getButtonStyle("default");
        $scope.elements.push({
            click: "app.calendar",
            string: $filter('translate')('home_calendario'),
            class: style,


        });
        if (profileService.getBabyProfile().services.mensa.enabled) {
            style = getButtonStyle("default");
            $scope.elements.push({
                click: "app.canteen",
                string: $filter('translate')('home_mensa'),
                class: style,

            });
        }

        style = getButtonStyle("default");
        $scope.elements.push({
            click: "app.absence",
            string: $filter('translate')('home_assenza'),
            class: style,

        });
        style = getButtonStyle("default");
        $scope.elements.push({
            click: function () {
                printlog();
            },
            string: $filter('translate')('home_contatta'),
            class: style,

        });
    }
    var printlog = function () {
        $ionicModal.fromTemplateUrl('templates/contacts.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        })
    }

    $scope.call = function (number) {
        window.plugins.CallNumber.callNumber(function () {
            alert("call swap");
        }, function (err) {
            alert(err);
        }, number);
    }
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

    $rootScope.loadConfiguration = function (schoolId, kidId) {
            $scope.kidProfile = profileService.getBabyProfile();
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

                    if (($scope.kidProfile.services.anticipo.enabled && !$scope.kidConfiguration) || ($scope.kidProfile.services.anticipo.enabled && $scope.kidConfiguration.services.anticipo.active)) {
                        $scope.fromTime = $scope.school.anticipoTiming.fromTime;
                    } else {
                        $scope.fromTime = $scope.school.regularTiming.fromTime;
                    }
                    if (($scope.kidProfile.services.posticipo.enabled && !$scope.kidConfiguration) || ($scope.kidProfile.services.posticipo.enabled && $scope.kidConfiguration.services.posticipo.active)) {
                        //tmp setto a ora precisa se impostata per il giorno
                        $scope.toTime = $scope.school.posticipoTiming.toTime;
                    } else {
                        $scope.toTime = $scope.school.regularTiming.toTime;

                    }
                    buildHome();
                });
                //recupero le note
                dataServerService.getNotes(schoolId, kidId, new Date().getTime()).then(function (data) {
                    $scope.notes = data[0];
                }, function (error) {
                    console.log("ERROR -> " + error);
                });
            });
        }
        //corretto tutte e tre annidate? cosa succede se una salta? ma come faccio a settare il profilo temporaneo senza avere conf, prof????
    $scope.getConfiguration = function () {
        //parto da getBabyProfiles()(appid incluso nel server e qui ottengo schoolId e kidId
        dataServerService.getBabyProfiles().then(function (data) {
            //in data ho tutti i profili dei kids: memorizzo in locale e ottengo le configurazioni
            //tmp default $scope.kidConfiguration = data[0]; poi dovro' gestire un refresh delle informazioni quando switcho da profilo ad un altro
            //se non settato prendo il primo
            if (profileService.getBabyProfile() == null) {
                $scope.kidProfile = data[0];
                profileService.setBabiesProfiles(data);
                profileService.setBabyProfile(data[0]);
            } else {
                $scope.kidProfile = profileService.getBabyProfile();
            }
            $scope.loadConfiguration($scope.kidProfile.schoolId, $scope.kidProfile.kidId);


        });


    }



    $scope.getConfiguration();

});
