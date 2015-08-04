angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, $location, dataServerService) {

    //Acquiring data from server
    dataServerService.getBabyProfile().then(function (data) {
        $scope.babyProfile = data[0];
    },
    function (error) {
        console.log("ERROR -> " + error);
    });

    dataServerService.getBabyConfiguration().then(function (data) {
        $scope.babyConfig = data[0];
        $scope.babyStatus = new Date().getTime() > $scope.babyConfig.exitTime ? "uscito" : "presente";
    },
    function (error) {
        console.log("ERROR -> " + error);
    });

    dataServerService.getNotes().then(function (data) {
        $scope.notes = data[0];
        console.log("cazz" + JSON.stringify($scope.notes));
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
        return true;
    }

});
