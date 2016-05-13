angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.login', [])

.controller('LoginCtrl', function ($scope, $rootScope, $state, $filter, $ionicPopup, $ionicHistory, $ionicLoading, Config, loginService, dataServerService) {
    /*$scope.errorMsg = null;
    $scope.login = function(provider) {
        $scope.errorMsg = null;
        dataServerService.login(provider, function() {
            $state.go('app.home');
        }, function(err) {
            $scope.errorMsg = err;
        });
    };
    var loginStarted = false;
    $scope.user = {
        email: '',
        password: ''
    };*/

    $scope.login = function (provider) {
        loginService.login(provider).then(
            function (data) {
                dataServerService.login(provider, function () {
                    $state.go('app.home');
                })
            },
            function (error) {
                //loginStarted = false;

                console.log("ERROR -> " + error);
                // Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                $ionicLoading.hide();
                if (error == 406) {
                    loginService.logout();
                    $ionicPopup.alert({
                        title: $filter('translate')('not_allowed_popup_title'),
                        template: $filter('translate')('not_allowed_signin')
                    });
                }
            }
        );
    };

    $scope.loginInternal = function () {
        $state.go('app.signin');
    }
    $scope.goRegister = function () {
        $state.go('app.signup');
    }

    $scope.passwordRecover = function () {
        window.open(Config.getAACURL() + '/internal/reset?lang=en', '_system', 'location=no,toolbar=no')
    }
    $scope.signin = function () {
        //Utils.loading();
        $ionicLoading.show();
        loginService.signin($scope.user).then(
            function (data) {
                dataServerService.getBabyProfiles().then(function (data) {
                    $state.go('app.home');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                }, function (error) {
                    console.log("ERROR -> " + error);
                    $ionicLoading.hide();
                    if (error == 406) {
                        loginService.logout();
                        $ionicPopup.alert({
                            title: $filter('translate')('not_allowed_popup_title'),
                            template: $filter('translate')('not_allowed_signin')
                        });
                    }
                });
            },
            function (error) {
                localStorage.userId = null;
                $ionicPopup.alert({
                    title: $filter('translate')('error_popup_title'),
                    template: $filter('translate')('error_signin')
                });

            }
        ).finally($ionicLoading.hide());
    };
});
