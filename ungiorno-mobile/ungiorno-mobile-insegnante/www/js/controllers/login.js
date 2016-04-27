angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.login', [])


.controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicHistory, loginService, Toast, $filter) {
    var loginStarted = false;

    $scope.login = function (provider) {
        if (loginStarted) {
            return;
        };

        loginStarted = true;
        //if user already logged enter, otherwise login

        loginService.login(provider).then(

            function (data) {
                console.log("user is not logged");

                $state.go('app.home');
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });
            },
            function (error) {
                loginStarted = false;
                Toast.show($filter('translate')('authentication_error'), 'short', 'bottom');
                //ionic.Platform.exitApp();
            }
        );

    };
});
