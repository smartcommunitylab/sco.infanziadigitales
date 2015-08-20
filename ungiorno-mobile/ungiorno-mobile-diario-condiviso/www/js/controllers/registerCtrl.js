angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.register', [])

.controller('RegisterCtrl', function ($scope, dataServerService) {

    $scope.enterEmail = false;


    $scope.openEnterEmail = function () {
        return $scope.enterEmail;

    }

    $scope.mailFb = function () {
        $scope.enterEmail = true;

    }

    $scope.mailGm = function () {
        $scope.enterEmail = true;

    }

        $scope.steps = [
        {
            done: true
        },
        {
            done: false
        },
        {
            done: false
        },
        {
            done: false
        },
        ];



});
