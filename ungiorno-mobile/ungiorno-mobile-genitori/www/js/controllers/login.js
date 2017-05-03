angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.login', [])

.controller('LoginCtrl', function ($scope, $rootScope, $state, $filter, $ionicPopup, $ionicHistory, $ionicLoading, Config, loginService, LoginService,dataServerService, pushNotificationService) {
    var loginStarted = false;
    $scope.user = {
        email: '',
        password: ''
    };



    $scope.login = function (provider) {


      LoginService.login(provider, $scope.user).then(

        //loginService.login(provider).then(
            function (data) {
                  Config.setAppId(data.userId);
                 localStorage.userId = data.userId;
                 localStorage.provider = provider;
                dataServerService.getBabyProfiles().then(function (data) {
                    $state.go('app.home');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                }, function (error) {
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
                });

            },
            function (error) {
                // loginStarted = false;
                //Utils.toast(Utils.getErrorMsg(error));
                // StorageSrv.saveUser(null);
                localStorage.userId = null;
                ionic.Platform.exitApp();
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
                    // Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                    $ionicLoading.hide();
                    if (error == 406) {
                        loginService.logout();
                        $ionicPopup.alert({
                            title: $filter('translate')('not_allowed_popup_title'),
                            template: $filter('translate')('not_allowed_signin')
                        });
                    }
                });
                //                $state.go('app.home');
                //                $ionicHistory.nextViewOptions({
                //                    disableBack: true,
                //                    historyRoot: true
                //                });
            },
            function (error) {
                //StorageSrv.saveUser(null);
                localStorage.userId = null;
                $ionicPopup.alert({
                    title: $filter('translate')('error_popup_title'),
                    template: $filter('translate')('error_signin')
                });

            }
        ).finally($ionicLoading.hide());
    };
})

.controller('RegisterCtrl', function ($scope, $rootScope, $state, $filter, $ionicHistory, $ionicPopup, loginService, Config, $translate, $ionicLoading) {
    $scope.user = {
        lang: $translate.preferredLanguage(),
        name: '',
        surname: '',
        email: '',
        password: ''
    };

    var validate = function () {
        if (!$scope.user.name.trim() || !$scope.user.surname.trim() || !$scope.user.email.trim() || !$scope.user.password.trim()) {
            return 'error_required_fields';
        }
        if ($scope.user.password.trim().length < 6) {
            return 'error_password_short';
        }
        return null;
    };

    $scope.toLogin = function () {
        window.location.reload(true);
    }

    $scope.resend = function () {
        window.open(Config.getAACURL() + '/internal/resend?lang=en', '_system', 'location=no,toolbar=no')
    }


    $scope.register = function () {
        var msg = validate();
        if (msg) {
            $ionicPopup.alert({
                title: $filter('translate')('error_popup_title'),
                template: $filter('translate')(msg)
            });
            return;
        }

        $ionicLoading.show();
        loginService.register($scope.user).then(
            function (data) {
                $state.go('app.signupsuccess');
            },
            function (error) {
                var errorMsg = 'error_generic';
                if (error == 409) {
                    errorMsg = 'error_email_inuse';
                }
                $ionicPopup.alert({
                    title: $filter('translate')('error_popup_title'),
                    template: $filter('translate')(errorMsg)
                });
            }
        ).finally($ionicLoading.hide());
    };
});
