angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, configurationService) {

    $scope.date = "";
    $scope.kid = {};
    $scope.notes = {};


    //    dataServerService.getBabyProfile().then(function (data) {
    //        $scope.kid = data[0];
    //    }, function (error) {
    //        console.log("ERROR -> " + error);
    //    });

    $scope.goTo = function (location) {
        window.location.assign(location);
    }

    $scope.getDateString = function () {
        var today = new Date();
        $scope.date = today.getTime();;
    }

    $scope.getConfiguration = function () {
        dataServerService.getBabyConfiguration().then(function (data) {
            configurationService.setBabyConfiguration(data[0]);
        }, function (error) {
            console.log("ERROR -> " + error);
        });
        dataServerService.getSchoolProfile().then(function (data) {
            profileService.setSchoolProfile(data.data[0]);
        }, function (error) {
            console.log("ERROR -> " + error);
        });

        dataServerService.getBabyProfile().then(function (data) {
            profileService.setBabyProfile(data[0]);
            $scope.kid = data[0];
        }, function (error) {
            console.log("ERROR -> " + error);
        });
        dataServerService.getNotes().then(function (data) {
            $scope.notes = data.data[0];
        }, function (error) {
            console.log("ERROR -> " + error);
        });

    }
    $scope.getConfiguration();

});
