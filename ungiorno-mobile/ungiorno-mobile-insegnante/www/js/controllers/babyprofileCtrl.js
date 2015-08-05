angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, $location, dataServerService, profileService) {

    //Acquiring data from server
    $scope.babyProfile = profileService.getBabyProfile();
    //$scope.babyConfig = profileService.getBabyConfig();
    //temp babyConfig
    dataServerService.getBabyConfiguration().then(function (data) {
        $scope.babyConfig = data[0];
        $scope.babyStatus = new Date().getTime() > $scope.babyConfig.exitTime ? "uscito" : "presente";
    },
    function (error) {
        console.log("ERROR -> " + error);
    });

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
        return true;
    }


    $scope.newNoteDialog = function() {

    }

});
