angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.login', [])


.controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicHistory, loginService) {
    var loginStarted = false;

    $scope.login = function (provider) {
        if (loginStarted) {
            return;
        };

        loginStarted = true;
        loginService.login(provider).then(
            function (data) {
                $state.go('app.home');
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });
            },
            function (error) {
                loginStarted = false;
                ionic.Platform.exitApp();
            }
        );
    };
});
