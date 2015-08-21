angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, Toast, $ionicLoading, $timeout) {


    $scope.showLoader = function() {
        return $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0,
        });
        $scope.dataLoaded = false;
    };

    $scope.myLoader = $scope.showLoader();

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
            $scope.myLoader.hide();
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

    babyConfigurationService.getBabyNotesById(babyProfileID).then(function (data) {
        $scope.notes = data;
        notesLoaded = true;
        checkAllDataLoaded();
    });

    var loadSchoolProfile = function () {
        checkAllDataLoaded();
    }
    loadSchoolProfile();

    $scope.calculateOtherData = function () {

        $scope.babyEnterHour = $scope.babyConfig.services.anticipo ? $scope.schoolProfile.anticipoTiming.fromTime : $scope.schoolProfile.regularTiming.fromTime;
        $scope.babyExitHour = $scope.babyConfig.services.posticipo ? $scope.schoolProfile.posticipoTiming.toTime : $scope.schoolProfile.regularTiming.toTime;

        //used to get if the baby is present
        var today = new Date();
        var exitDayWithHour = new Date();
        var exitHour = new Date('01/01/2000 ' + $scope.babyExitHour); //placeholder date, well completed after
        exitDayWithHour.setHours(exitHour.getHours());
        exitDayWithHour.setMinutes(exitHour.getMinutes());


        $scope.babyStatus = today.getTime() > exitDayWithHour.getTime() ? $filter('translate')('exit') : $filter('translate')('present');

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

    $scope.isDelegation = function() {
        return $scope.babyConfig.extraPerson.personId === $scope.babyConfig.personWhoRetireBaby.personId;
    }

    $scope.sendTeacherNote = function() {
        var noteTypeID = document.getElementById("note_type").value;
        var noteDescription = document.getElementById("note_description").value;

        if (noteTypeID === "") {
            Toast.show($filter('translate')('select_argument'));
        } else if (noteDescription === "") {
            Toast.show($filter('translate')('type_description'));
        } else {    //all data are correct
            console.log("Note typeID: " + noteTypeID + " description: " + noteDescription);
            Toast.show($filter('translate')('note_sent_success'));
            //TODO: http post with data
        }

    }

});
