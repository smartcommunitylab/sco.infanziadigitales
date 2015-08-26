angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, dataServerService, profileService, babyConfigurationService, $filter, Toast, $ionicLoading, $ionicPopup) {

    $scope.newNote = {
        argument: "",
        description: ""
    }
    $scope.showLoader = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0,
        });
        $scope.dataLoaded = false;
    };

    $scope.showLoader();

    $scope.checkBusServiceActive = function() {
        return $scope.babyConfig.services.bus.active && $scope.babyProfile.services.bus.enabled;
    }
    var getBusStopAddressByID = function(busStopID) {
        for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
            if ($scope.babyProfile.services.bus.stops[i].stopId === busStopID) {
                return $scope.babyProfile.services.bus.stops[i].address;
            }
        }

    }
    var babyProfileLoaded = false;
    var babyConfigLoaded = false;
    var notesLoaded = false;
    $scope.dataLoaded = false;
    var checkAllDataLoaded = function() {
        if (babyProfileLoaded && babyConfigLoaded && notesLoaded) {
            $scope.calculateOtherData();
            $scope.dataLoaded = true;
            $ionicLoading.hide();
        }
    }


    $scope.schoolProfile = profileService.getSchoolProfile();
    var babyProfileID = profileService.getCurrentBabyID();

    //Acquiring data from server
    profileService.getBabyProfileById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
        $scope.babyProfile = data;
        babyProfileLoaded = true;
        checkAllDataLoaded();

    });
    babyConfigurationService.getBabyConfigurationById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
        $scope.babyConfig = data;
        babyConfigLoaded = true;
        checkAllDataLoaded();
    });

    babyConfigurationService.getBabyNotesById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
        $scope.notes = data[0];
        notesLoaded = true;
        checkAllDataLoaded();
    });

    var loadPersonWhoRetire = function () {
        var found = false;
        $scope.personWhoRetire = null;
        var i = 0;
        while (!found && i < $scope.babyConfig.extraPersons.length) {
            if ($scope.babyConfig.extraPersons[i].personId == $scope.babyConfig.defaultPerson) {
                found = true;
                $scope.personWhoRetire = $scope.babyConfig.extraPersons[i];
                $scope.personWhoRetire.isDelegate = true;
            }
            i++;
        }
        while (!found && i < $scope.babyProfile.persons.length) {
            if ($scope.babyProfile.persons[i].personId == $scope.babyConfig.defaultPerson) {
                found = true;
                $scope.personWhoRetire = $scope.babyProfile.persons[i];
                $scope.personWhoRetire.isDelegate = false;
            }
            i++;
        }
    }

    $scope.calculateOtherData = function () {

        $scope.babyEnterHour = $scope.babyConfig.services.anticipo ? $scope.schoolProfile.anticipoTiming.fromTime : $scope.schoolProfile.regularTiming.fromTime;

        //used to get if the baby is present
        var now = new Date();
        if ($scope.babyConfig.exitTime == null) {
            $scope.babyStatus = $filter('translate')('absent');
        } else {
            var exitDayWithHour = new Date($scope.babyConfig.exitTime); //TODO: make a decision on server, timestamp in seconds or milliseconds?!?

            $scope.babyStatus = now > exitDayWithHour ? $filter('translate')('exit') : $filter('translate')('present');
        }


        loadPersonWhoRetire();

        if ($scope.checkBusServiceActive()) {
            $scope.babyBusStopGoName = getBusStopAddressByID($scope.babyConfig.services.bus.defaultIdGo);
            $scope.babyBusStopBackName = getBusStopAddressByID($scope.babyConfig.services.bus.defaultIdBack);
        }

    }


    //Custom methods
    $scope.callPhone = function(number) {
        console.log("Calling " + number);
        document.location.href = 'tel:' + number;
    }

    $scope.sendTeacherNote = function() {

        if ($scope.newNote.argument === "") {
            Toast.show($filter('translate')('select_argument'));
        } else if ($scope.newNote.description === "") {
            Toast.show($filter('translate')('type_description'));
        } else {    //all data are correct
            var note = {
                date: new Date().getTime(),
                schoolNotes: [
                    {
                        type: $scope.newNote.argument.typeId,
                        note: $scope.newNote.description
                    }
                ]
            }

            var requestFail = function () {
                var myPopup = $ionicPopup.show({
                    title: $filter('translate')('note_sent_fail'),
                    scope: $scope,
                    buttons: [
                        { text: $filter('translate')('cancel') },
                        {
                            text: '<b>' + $filter('translate')('retry') + '</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                $scope.sendTeacherNote();
                            }
                        }
                    ]
                });
            }

            var requestSuccess = function (data) {
                Toast.show($filter('translate')('note_sent_success'));
                $scope.newNote.argument = "";
                $scope.newNote.description = "";
            }


            dataServerService.addNewNoteForParents($scope.schoolProfile.schoolId, $scope.babyProfile.kidId, note).then(function (data) {
                requestSuccess(data);
            }, function (data) {
                requestFail();
            });
        }

    }

});
