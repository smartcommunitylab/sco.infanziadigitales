angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.authorization', [])

.controller('AuthorizationCtrl', function ($scope, $ionicHistory, configurationService, $q, $filter) {
    var currentBaby = configurationService.getBabyConfiguration();
    var authorizationUrl;

    function setDelegation() {
        if (!$scope.person.firstName ||
            !$scope.person.lastName ||
            !authorizationUrl) {
            alert("Alcuni campi non sono stati completati");
            return false;
        }

        currentBaby.extraPersons.firstName = $scope.person.firstName;
        currentBaby.extraPersons.lastName = $scope.person.lastName;
        currentBaby.extraPersons.fullName = $scope.person.firstName + " " + $scope.person.lastName;
        currentBaby.extraPersons.authorizationDeadline = (new Date()).getTime();
        currentBaby.extraPersons.authorizationUrl = authorizationUrl;
        return true;
    }

    $scope.person = { };
    $scope.hasAuthorization = false;
    $scope.send = function () {
        if (setDelegation()) {
            configurationService.setBabyConfiguration(currentBaby);
            $ionicHistory.goBack();
        }   
    }

    $scope.getPhoto = function() {
        var q = $q.defer();
        $scope.hasAuthorization = true; // useless, just debug

        navigator.camera.getPicture(function(result) {
            authorizationUrl = result; 
            q.resolve(true);
        }, function(err) {
            q.resolve(false);
        });

        q.promise;
    };
});
