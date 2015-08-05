angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter) {

    //Acquiring data from server
    $scope.babyProfile = profileService.getBabyProfile();
    $scope.schoolProfile = profileService.getSchoolProfile();
    $scope.babyConfig = babyConfigurationService.getBabyConfiguration();
    //temp babyConfig

    $scope.babyEnterHour = $scope.babyConfig.services.anticipo ? $scope.schoolProfile.anticipoTiming.fromTime : $scope.schoolProfile.regularTiming.fromTime;
    $scope.babyExitHour = $scope.babyConfig.services.posticipo ? $scope.schoolProfile.posticipoTiming.toTime : $scope.schoolProfile.regularTiming.toTime;

    //used to get if the baby is present
    var today = new Date();
    var exitDayWithHour = new Date();
    var exitHour = new Date('01/01/2000 ' + $scope.babyExitHour); //placeholder date, well completed after
    exitDayWithHour.setHours(exitHour.getHours());
    exitDayWithHour.setMinutes(exitHour.getMinutes());


    $scope.babyStatus = today.getTime() > exitDayWithHour.getTime() ? $filter('translate')('exit') : $filter('translate')('present');

    dataServerService.getNotes().then(function (data) {
        $scope.notes = data[0];
    },
    function (error) {
        console.log("ERROR -> " + error);
    });


    //Custom methods
    $scope.callPhone = function(number) {
        console.log("Calling " + number);
        document.location.href = 'tel:' + number;
    }

    $scope.checkBusServiceActive = function() {
        return $scope.babyConfig.services.bus.active;
    }
    $scope.isDelegation = function() {
        return $scope.babyConfig.extraPerson.personId === $scope.babyConfig.personWhoRetireBaby.personId;
    }

});
