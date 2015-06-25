angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService) {

    $scope.date = "";
    $scope.kid = {};


    dataServerService.getBabyProfile().then(function (data) {
        kid = data[0];
    }, function (error) {
        console.log("ERROR -> " + error);
    });
    $scope.goTo = function (location) {
        window.location.assign(location);
    }

    $scope.getDateString = function () {
        var today = new Date();
        $scope.date = today.getTime();;
    }
});
