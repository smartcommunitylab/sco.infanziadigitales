angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.login', [])

.controller('LoginCtrl', function ($scope, $state, dataServerService) {
    $scope.errorMsg = null;
    $scope.login = function(provider) {
        $scope.errorMsg = null;
        dataServerService.login(provider, function() {
            $state.go('app.home');
        }, function(err) {
            $scope.errorMsg = err;
        });
    };

});
