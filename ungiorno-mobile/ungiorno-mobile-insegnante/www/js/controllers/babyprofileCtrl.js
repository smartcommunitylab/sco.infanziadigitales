angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, dataServerService, profileService, babyConfigurationService, Config, $filter, Toast, $ionicLoading, $ionicPopup) {

    $scope.newNote = {
        argument: "",
        description: ""
    }
    $scope.showLoader = function () {
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

    $scope.checkBusServiceActive = function () {
        return $scope.babyInformations.bus.active && $scope.babyInformations.bus.enabled && $scope.babyInformations.stopId != null;
    }
    var getBusStopAddressByID = function (busStopID) {
        for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
            if ($scope.babyProfile.services.bus.stops[i].stopId === busStopID) {
                return $scope.babyProfile.services.bus.stops[i].address;
            }
        }

    }
    var babyProfileLoaded = false;
    var notesLoaded = false;
    $scope.dataLoaded = false;
    var checkAllDataLoaded = function () {
        if (babyProfileLoaded && notesLoaded) {
            $scope.calculateOtherData();
            $scope.dataLoaded = true;
            $ionicLoading.hide();
        }
    }


    $scope.schoolProfile = profileService.getSchoolProfile();
    $scope.babyInformations = profileService.getCurrentBaby();
    $scope.relation = "";
    var babyProfileID = $scope.babyInformations.kidId;

    //Acquiring data from server
    profileService.getBabyProfileById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
        $scope.babyProfile = data;
        babyProfileLoaded = true;
        checkAllDataLoaded();

    });
    babyConfigurationService.getBabyNotesById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
        if (data[0]) {
            $scope.notes = data[0];
        } else {
            $scope.notes = null;
        }
        notesLoaded = true;
        checkAllDataLoaded();
    });

    $scope.calculateOtherData = function () {

        $scope.babyEnterHour = ($scope.babyInformations.anticipo.active && $scope.babyInformations.anticipo.enabled) ? $scope.schoolProfile.anticipoTiming.fromTime : $scope.schoolProfile.regularTiming.fromTime;

        //used to get if the baby is present
        var now = new Date();
        if ($scope.babyInformations.exitTime == null) {
            $scope.babyStatus = $filter('translate')('absent');
        } else {
            var exitDayWithHour = new Date($scope.babyInformations.exitTime); //TODO: make a decision on server, timestamp in seconds or milliseconds?!?

            $scope.babyStatus = now > exitDayWithHour ? $filter('translate')('exit') : $filter('translate')('present');
        }

        if ($scope.checkBusServiceActive()) {
            //$scope.babyBusStopBackName = getBusStopAddressByID($scope.babyInformations.stopId);
            //tmp because stops have no data for address
            $scope.babyBusStopBackName = $scope.babyInformations.stopId;
        }
        for (var i = 0; i < $scope.babyProfile.persons.length; i++) {
            if ($scope.babyProfile.persons[i].personId == $scope.babyInformations.personId)
                $scope.relation = $scope.babyProfile.persons[i].relation;
        }
    }


    //Custom methods
    $scope.callPhone = function (number) {
        console.log("Calling " + number);
        document.location.href = 'tel:' + number;
    }

    $scope.sendTeacherNote = function () {

        if ($scope.newNote.argument === "") {
            Toast.show($filter('translate')('select_argument'), 'short', 'bottom');
        } else if ($scope.newNote.description === "") {
            Toast.show($filter('translate')('type_description'), 'short', 'bottom');
        } else { //all data are correct
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
                        {
                            text: $filter('translate')('cancel'),
                            type: 'cancel-button'
                        },
                        {
                            text: '<b>' + $filter('translate')('retry') + '</b>',
                            type: 'create-button',
                            onTap: function (e) {
                                $scope.sendTeacherNote();
                            }
                        }
                    ]
                });
            }

            var requestSuccess = function (data) {
                Toast.show($filter('translate')('note_sent_success'), 'short', 'bottom');
                $scope.newNote.argument = "";
                $scope.newNote.description = "";
                //update the new notes

                if (data != null && data.data != null && data.data.schoolNotes != null) {
                    if (!$scope.notes) {
                        $scope.notes = {};
                    }
                    $scope.notes.schoolNotes = data.data.schoolNotes;
                }
                if (data != null && data.data != null && data.data.parentNotes != null) {
                    if (!$scope.notes) {
                        $scope.notes = {};
                    }
                    $scope.notes.parentNotes = data.data.parentNotes;
                }
            }


            dataServerService.addNewNoteForParents($scope.schoolProfile.schoolId, $scope.babyProfile.kidId, note).then(function (data) {
                requestSuccess(data);
            }, function (data) {
                requestFail();
            });
        }

    }

    $scope.getProfileImage = function () {
        var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + $scope.schoolProfile.schoolId + "/" + $scope.babyProfile.kidId + "/true/images";
        return image;
    }
});
