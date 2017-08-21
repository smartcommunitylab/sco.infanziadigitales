angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.login', [])


.controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicHistory, loginService, Toast, $filter, dataServerService, loginService, $ionicPopup) {
    var loginStarted = false;

    $scope.login = function (provider) {
        if (loginStarted) {
            return;
        };

        $rootScope.loginStarted = true;
        //if user already logged enter, otherwise login

        loginService.login(provider).then(

            function (data) {
                console.log("user is logged");

                dataServerService.getSchoolProfileForTeacher().then(function (schoolProfile) {
                    if (schoolProfile) {
                        //get Name of teachr and set variable
                        //$ionicHistory.clearCache().then(function () {
                        //$ionicHistory.clearCache();
                        $state.go('app.home');
                        $ionicHistory.nextViewOptions({
                            disableBack: true,
                            historyRoot: true
                        });
                    } else {
                        //user not valid
                        $rootScope.loginStarted = false;
                        $scope.logout();
                        $ionicPopup.alert({
                            title: $filter('translate')('not_allowed_popup_title'),
                            template: $filter('translate')('not_allowed_signin')
                        });
                    }
                    //});
                });
            },
            function (error) {
                $rootScope.loginStarted = false;
                Toast.show($filter('translate')('authentication_error'), 'short', 'bottom');
                //ionic.Platform.exitApp();
            }
        );

    };
});
