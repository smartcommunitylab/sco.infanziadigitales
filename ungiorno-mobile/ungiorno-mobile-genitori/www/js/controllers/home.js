angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location) {

    $scope.date = "";

    $scope.goTo = function (location) {
        window.location.assign(location);
    }

    $scope.getDateString = function () {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        $scope.date = today.getTime();;
    }
});
