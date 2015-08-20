angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.register', [])

.controller('RegisterCtrl', function ($scope, dataServerService) {

    $scope.enterEmail = false;
    $scope.steps = [
        {
            done: false
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

    var updateToStep = function (toStep) {
        for (var i = 0; i < toStep; i++) {
            $scope.steps[i].done = true;
        }
    }

    var currentStep = 1;
    updateToStep(currentStep);

    $scope.openEnterEmail = function () {
        return $scope.enterEmail;
    }

    $scope.loginVia = function (via) {
        $scope.enterEmail = true;
        currentStep++;
        updateToStep(currentStep);

        if (via === "facebook") {

        } else if (via === "gmail") {

        }
    }

});
