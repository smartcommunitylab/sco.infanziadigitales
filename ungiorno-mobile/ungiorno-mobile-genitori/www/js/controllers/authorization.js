angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.authorization', [])

.controller('AuthorizationCtrl', function ($scope, $ionicHistory, configurationService, $q, $filter) {
    var currentBaby = configurationService.getBabyConfiguration();
    var authorizationUrl;

    function setDelegation() {
        currentBaby.extraPersons.firstName = $scope.person.firstName;
        currentBaby.extraPersons.lastName = $scope.person.lastName;
        currentBaby.extraPersons.fullName= $scope.person.firstName + " " + $scope.person.lastName;
        currentBaby.extraPersons.authorizationDeadline = (new Date()).getTime();
        currentBaby.extraPersons.authorizationUrl = authorizationUrl;
    }

    $scope.person = { };

    $scope.sendDelegate = function () {
        setDelegation();
        configurationService.setBabyConfiguration(currentBaby);
        $ionicHistory.goBack();
    }

    $scope.getPhoto = function() {
        var q = $q.defer();

        navigator.camera.getPicture(function(result) {
            authorizationUrl = result; 
            q.resolve(true);
        }, function(err) {
            q.resolve(false);
        });

        return q.promise;
    };
});
