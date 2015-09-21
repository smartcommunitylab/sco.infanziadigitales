angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.retire', [])

.controller('RetireCtrl', function ($scope, configurationService, profileService, dataServerService, Toast, $ionicHistory, retireService, $filter) {
    var retireConfiguration;
    $scope.retirePersons = [];
    $scope.babyProfile = null;
    $scope.babyConfiguration = null;
    $scope.temporary = null;

    function getTime() {
        var dateInsert = new Date($scope.temporary.date);
        var timeInsert = new Date($scope.temporary.time);
        dateInsert.setHours(timeInsert.getHours(), timeInsert.getMinutes(), 0, 0);
        return dateInsert.getTime();
    }

    function setTime(value) {
        if (value) {
            var date = new Date(value);
            // $scope.temporary.date = date;
            $scope.temporary.time = date;
        }
    }

    function setDefaultPErsonId() {
        radio[1].checked = true;
    }

    function getSelectedPersonId() {
        for (var i = 0; i < $scope.retirePersons.length; i++) {
            if ($scope.retirePersons[i].checked == true) {
                return $scope.retirePersons[i].personId;
            }
        }
        return null;

    }


    $scope.selectPerson = function (newperson) {
        for (var i = 0; i < $scope.retirePersons.length; i++) {
            if ($scope.retirePersons[i].personId == newperson.personId) {
                $scope.retirePersons[i].checked = true;
            } else {
                $scope.retirePersons[i].checked = false;
            }
        }
    }


    $scope.setRetire = function () {
        var extraperson = false;
        for (var k in $scope.babyConfiguration.extraPersons) {
            if (getSelectedPersonId() == $scope.babyConfiguration.extraPersons[k].personId) {
                extraperson = true;
            }

        }

        retireConfiguration = {
            appId: $scope.babyConfiguration.appId,
            schoolId: $scope.babyConfiguration.schoolId,
            kidId: $scope.babyConfiguration.kidId,
            date: getTime(),
            personId: getSelectedPersonId(),
            exceptional: extraperson,
            note: $scope.temporary.note
        };

        retireService.setRetire(retireConfiguration);
    };


    $scope.getRetireByDate = function (date) {
        if (date)
            dataServerService.getRitiro($scope.babyProfile.schoolId, $scope.babyProfile.kidId, date.getTime()).then(function (data) {
                $scope.retirePersons = [];
                //retireConfiguration = retireService.getRetire();
                retireConfiguration = data;
                if (retireConfiguration) {
                    setTime(retireConfiguration.date);
                    //set people to retire
                    $scope.temporary.note = retireConfiguration.note;
                } else {
                    //set default time
                    var tmpdate = new Date($scope.temporary.date);
                    if (!$scope.babyProfile.services.posticipo.enabled) {
                        //creo data nuova con ora configurata e setto il model della pagina
                        tmpdate.setHours(profileService.getSchoolProfile().regularTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);
                        //$scope.temporary.time = Date.parse(profileService.getSchoolProfile.regularTiming.toTime);
                    } else {
                        $scope.temporary.time = Date.parse(profileService.getSchoolProfile().posticipoTiming.toTime);
                        tmpdate.setHours(profileService.getSchoolProfile().posticipoTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);

                    }
                    $scope.temporary.time = tmpdate;

                }
                var retirePerson = null;
                //se fermata e' null uso default
                if (retireConfiguration) {
                    retirePerson = retireConfiguration.personId;
                } else {
                    retirePerson = $scope.babyConfiguration.defaultPerson;
                }
                for (var k in $scope.babyProfile.persons) {
                    $scope.retirePersons.push({
                        personId: $scope.babyProfile.persons[k].personId,
                        fullName: $scope.babyProfile.persons[k].fullName,
                        authorizationDeadline: $scope.babyProfile.persons[k].authorizationDeadline,
                        checked: (retirePerson == $scope.babyProfile.persons[k].personId)


                    })
                }

                for (var k in $scope.babyConfiguration.extraPersons) {
                    $scope.retirePersons.push({
                        personId: $scope.babyConfiguration.extraPersons[k].personId,
                        fullName: $scope.babyConfiguration.extraPersons[k].fullName,
                        authorizationDeadline: $scope.babyConfiguration.extraPersons[k].authorizationDeadline,
                        checked: (retirePerson == $scope.babyConfiguration.extraPersons[k].personId)

                    });
                }
            });

    };

    $scope.getRetire = function () {
        $scope.babyProfile = profileService.getBabyProfile();
        $scope.babyConfiguration = configurationService.getBabyConfiguration();

        //set default time (forget the days, because it is overwritten by new date
        $scope.temporary = {
            date: new Date(),
            time: new Date($scope.babyConfiguration.exitTime),
            note: null
        };
        $scope.temporary.time.setHours($scope.temporary.time.getHours(), $scope.temporary.time.getMinutes(), 0, 0);
        dataServerService.getRitiro($scope.babyProfile.schoolId, $scope.babyProfile.kidId, new Date().getTime()).then(function (data) {
            $scope.retirePersons = [];

            //retireConfiguration = retireService.getRetire();
            retireConfiguration = data;
            if (retireConfiguration) {
                setTime(retireConfiguration.date);
                //set people to retire
                $scope.temporary.note = retireConfiguration.note;
            } else {
                //set default time
                var tmpdate = new Date($scope.temporary.date);
                if (!$scope.babyProfile.services.posticipo.enabled) {
                    //creo data nuova con ora configurata e setto il model della pagina
                    tmpdate.setHours(profileService.getSchoolProfile().regularTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);
                    $scope.temporary.time = Date.parse(profileService.getSchoolProfile().regularTiming.toTime);
                } else {
                    $scope.temporary.time = Date.parse(profileService.getSchoolProfile().posticipoTiming.toTime);
                    tmpdate.setHours(profileService.getSchoolProfile().posticipoTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);

                }
                $scope.temporary.time = tmpdate;

            }
            var retirePerson = null;
            //se fermata e' null uso default
            if (retireConfiguration) {
                retirePerson = retireConfiguration.personId;
            } else {
                retirePerson = $scope.babyConfiguration.defaultPerson;
            }
            for (var k in $scope.babyProfile.persons) {
                $scope.retirePersons.push({
                    personId: $scope.babyProfile.persons[k].personId,
                    fullName: $scope.babyProfile.persons[k].fullName,
                    authorizationDeadline: $scope.babyProfile.persons[k].authorizationDeadline,
                    checked: (retirePerson == $scope.babyProfile.persons[k].personId)


                })
            }
            if ($scope.babyConfiguration.extraPersons != null) {
                $scope.retirePersons.push({
                    personId: $scope.babyConfiguration.extraPersons.personId,
                    fullName: $scope.babyConfiguration.extraPersons.fullName,
                    authorizationDeadline: $scope.babyConfiguration.extraPersons.authorizationDeadline,
                    checked: (retirePerson == $scope.babyConfiguration.extraPersons.personId)

                });
            }
        });

    };
    $scope.$watch('temporary.date', function () {
        $scope.getRetireByDate($scope.temporary.date);
    });

    $scope.send = function () {
        $scope.setRetire();
        if (!retireConfiguration.personId) {
            alert("Indica chi ritira il bambino");
            return;
        }

        dataServerService.sendRitiro($scope.babyProfile.schoolId, $scope.babyProfile.kidId, retireConfiguration).then(function (data) {
            Toast.show($filter('translate')('retire_sendok'), 'short', 'bottom');
            retireService.setDailyRetire(true);
            console.log("SENDING OK -> " + data);
            $ionicHistory.goBack();
        }, function (error) {
            Toast.show($filter('translate')('retire_sendno'), 'short', 'bottom');
            console.log("SENDING ERROR -> " + error);
        });
    }
})
