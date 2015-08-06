angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter) {

    //Acquiring data from server

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

    //Acquiring data from services
    $scope.babyProfile = profileService.getBabyProfile();
    $scope.schoolProfile = profileService.getSchoolProfile();
    $scope.babyConfig = babyConfigurationService.getBabyConfiguration();
    $scope.notes = babyConfigurationService.getBabyNotes();

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


    //Custom methods
    $scope.callPhone = function(number) {
        console.log("Calling " + number);
        document.location.href = 'tel:' + number;
    }

    $scope.isDelegation = function() {
        return $scope.babyConfig.extraPerson.personId === $scope.babyConfig.personWhoRetireBaby.personId;
    }

});
