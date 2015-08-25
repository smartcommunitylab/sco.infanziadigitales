angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.register', [])

.controller('RegisterCtrl', function ($scope, dataServerService) {

    $scope.enterEmail = false;
    $scope.parentOrTeacher = false;
    $scope.createNewDiary = false;
    $scope.showDiary = false;
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

    $scope.registerVia = function (via) {
        $scope.enterEmail = true;
        currentStep++;
        updateToStep(currentStep);

        if (via === "facebook") {

        } else if (via === "gmail") {

        }
    }


    $scope.openRegisterHow = function () {
        return $scope.parentOrTeacher;
    }

    $scope.registerHow = function (how) {
        $scope.parentOrTeacher = true;
        currentStep++;
        updateToStep(currentStep);

        if (how === "genitore") {

        } else if (how === "insegnate") {

        }
    }


    $scope.openCreateDiary = function () {
        return $scope.createNewDiary;
    }

    $scope.registeredAsTeacher = function () {
        $scope.createNewDiary = true;
        currentStep++;
        updateToStep(currentStep);
    }


    $scope.openShowDiary = function () {
        return $scope.showDiary;
    }

    $scope.registredAsParent = function () {
        $scope.showDiary = true;
        currentStep++;
        updateToStep(currentStep);
    }
});
