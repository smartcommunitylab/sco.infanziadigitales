angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.buses', [])

.controller('BusCtrl', function ($scope, $ionicHistory, configurationService, profileService, dataServerService, Toast) {
    var babyProfile = profileService.getBabyProfile();
    $scope.babyConfiguration = configurationService.getBabyConfiguration();
    $scope.persons = [];
    $scope.busStops = [];


    $scope.initialize = function () {
        $scope.busStop = {
            date: new Date()
        }
        $scope.initByDate($scope.busStop.date);

    }

    $scope.initByDate = function (date) {


        //appId,schoolId, kidId, timestamp
        dataServerService.getFermata(babyProfile.schoolId, babyProfile.kidId, date.getTime()).then(function (data) {
            $scope.persons = [];
            $scope.busStops = [];
            var fermata = data;
            if (babyProfile.services.bus.enabled) {
                if (fermata) {
                    retireStop = fermata.stopId;
                } else {
                    retireStop = $scope.babyConfiguration.services.bus.defaultIdBack;
                }
                //$scope.busStops = babyProfile.services.bus.stops;
                for (var k in babyProfile.services.bus.stops) {
                    $scope.busStops.push({
                        stopId: babyProfile.services.bus.stops[k].stopId,
                        address: babyProfile.services.bus.stops[k].address,
                        checked: (retireStop == babyProfile.services.bus.stops[k].stopId)


                    })
                }
            }

            if (babyProfile.persons) {
                var retirePerson = null;
                //se fermata e' null uso default
                if (fermata) {
                    retirePerson = fermata.personId;
                } else {
                    retirePerson = $scope.babyConfiguration.defaultPerson;
                }
                for (var k in babyProfile.persons) {
                    $scope.persons.push({
                        personId: babyProfile.persons[k].personId,
                        fullName: babyProfile.persons[k].fullName,
                        authorizationDeadline: babyProfile.persons[k].authorizationDeadline,
                        checked: (retirePerson == babyProfile.persons[k].personId)


                    })
                }
                for (var k in $scope.babyConfiguration.extraPersons) {
                    $scope.persons.push({
                        personId: $scope.babyConfiguration.extraPersons[k].personId,
                        fullName: $scope.babyConfiguration.extraPersons[k].fullName,
                        authorizationDeadline: $scope.babyConfiguration.extraPersons[k].authorizationDeadline,
                        checked: (retirePerson == $scope.babyConfiguration.extraPersons[k].personId)

                    });
                }
            }

            if ($scope.babyConfiguration.services.bus.active) {
                $scope.stopId = $scope.babyConfiguration.services.bus.defaultIdBack;
            }

            if ($scope.babyConfiguration.defaultPerson) {
                $scope.personId = $scope.babyConfiguration.defaultPerson;
            }
        }, function (error) {
            Toast.show("Impossibile recuprerare le informazioni per il ritiro", 'short', 'bottom');
        });

    }

    function getSelectedPersonId() {
        for (var i = 0; i < $scope.persons.length; i++) {
            if ($scope.persons[i].checked == true) {
                return $scope.persons[i].personId;
            }
        }
        return null;

    }

    $scope.changeStops = function (element) {
        angular.forEach($scope.busStops, function (item) {
            item.checked = false;
        });
        element.checked = true;

        if (element.checked) {
            $scope.stopId = element.value;
        }
    };

    $scope.changePersons = function (element) {
        var tmp = $scope.persons;
        tmp.push($scope.babyConfiguration.extraPersons);
        angular.forEach(tmp, function (item) {
            item.checked = false;
        });
        element.checked = true;

        if (element.checked) {
            $scope.personId = element.value;
        }
    };

    $scope.changeDate = function (element) {
        //reinitialize with another date
        $scope.initByDate($scope.busStop.date);
    };
    $scope.$watch('busStop.date', function () {
        $scope.initByDate($scope.busStop.date);
    });

    $scope.selectPerson = function (person) {
        for (var i = 0; i < $scope.persons.length; i++) {
            if ($scope.persons[i].personId == person.personId) {
                $scope.persons[i].checked = true;
            } else {
                $scope.persons[i].checked = false;
            }
        }
    }

    $scope.selectStop = function (person) {}

    $scope.send = function () {
        var dataConfiguration = {
            appId: $scope.babyConfiguration.appId,
            schoolId: $scope.babyConfiguration.schoolId,
            kidId: $scope.babyConfiguration.kidId,
            date: new Date($scope.busStop.date).setHours(0, 0, 0, 0),
            stopId: $scope.stopId,
            personId: getSelectedPersonId()
        }
        if (dataConfiguration.date < new Date().setHours(0, 0, 0, 0)) {
            alert("Selezionare una data successiva o uguale al giorno corrente");
            return;
            console.log(dataConfiguration.date);
        }

        if (!dataConfiguration.stopId) {
            alert("Indica la fermata a cui scende il bambino");
            return;
        }

        if (!dataConfiguration.personId) {
            alert("Indica la persona che aspetta il bambino");
            return;
        }

        dataServerService.sendFermata(babyProfile.schoolId, babyProfile.kidId, dataConfiguration).then(function (data) {
            Toast.show("Invio Riuscito!!", 'short', 'bottom');
            console.log("SENDING OK -> " + data);
            $ionicHistory.goBack();
        }, function (error) {
            Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
            console.log("SENDING ERROR -> " + error);
        });
    };


})
