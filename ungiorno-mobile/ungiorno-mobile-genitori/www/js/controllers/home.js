angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location) {

    $scope.goTo = function (location) {
        window.location.assign(location);
    }
});
