angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.loginService', [])
    .factory('loginService', function ($rootScope, $q, $http, $window, Config) {
        var loginService = {};
        var authWindow = null;

        loginService.userIsLogged = function () {
            //console.log(StorageSrv.getUserId());
            //console.log(StorageSrv.getUser());
            return (localStorage.userId != null && localStorage.userId != "null");
            // return (StorageSrv.getUserId() != null && StorageSrv.getUser() != null);
        };

        loginService.login = function (provider) {
            authWindow = null;
            var deferred = $q.defer();

            if (provider != 'google' && provider != 'googlelocal') {
                provider = '';
                //        } else if (provider == 'googlelocal' && !$rootScope.login_googlelocal) {
                //            provider = 'google';
            }

            // log into the system and set userId
            var authapi = {
                authorize: function (token) {
                    var deferred = $q.defer();

                    var processThat = false;

                    // Build the OAuth consent page URL
                    var authUrl = Config.getServerURL() + '/userlogin' + (!!provider ? '/' + provider : '');

                    if ((provider == 'googlelocal') && !!token) {
                        authUrl += '?token=' + encodeURIComponent(token);
                    }

                    //Open the OAuth consent page in the InAppBrowser
                    if (!authWindow) {
                        authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
                        processThat = !!authWindow;
                    }

                    var processURL = function (url, deferred, w) {
                        var success = /userloginsuccess\?profile=(.+)$/.exec(url);
                        var error = /userloginerror\?error=(.+)$/.exec(url);
                        if (w && (success || error)) {
                            //Always close the browser when match is found
                            w.close();
                            authWindow = null;
                        }

                        if (success) {
                            var str = success[1];
                            if (str.indexOf('#') != -1) {
                                str = str.substring(0, str.indexOf('#'));
                            }
                            console.log('success:' + decodeURIComponent(str));
                            deferred.resolve(JSON.parse(decodeURIComponent(str)));
                        } else if (error) {
                            //The user denied access to the app
                            deferred.reject({
                                error: error[1]
                            });
                        }
                    }

                    if (ionic.Platform.isWebView()) {
                        if (processThat) {
                            authWindow.addEventListener('loadstart', function (e) {
                                //console.log(e);
                                var url = e.url;
                                processURL(url, deferred, authWindow);
                            });
                        }
                    } else {
                        angular.element($window).bind('message', function (event) {
                            $rootScope.$apply(function () {
                                processURL(event.data, deferred);
                            });
                        });
                    }

                    return deferred.promise;
                }
            };

            if (provider == 'googlelocal') {
                window.plugins.googleplus.login({
                        'scopes': 'profile email',
                        'offline': true
                    },
                    function (obj) {
                        var token = obj.oauthToken;
                        if (!token) token = obj.accessToken;
                        authapi.authorize(token).then(
                            function (data) {
                                Config.setAppId(data.userId);
                                //                                if (data.userId = '23655') {
                                //                                    //                                if (data.name == 'testugas') {
                                //                                    $rootScope.appId = 'test';
                                //                                } else {
                                //                                    $rootScope.appId = 'trento';
                                //                                }
                                localStorage.userId = data.userId;
                                localStorage.provider = 'googlelocal';
                                deferred.resolve(data);

                            },
                            function (reason) {
                                //reset data
                                localStorage.userId = null;
                                deferred.reject(reason);

                            }
                        );
                    },
                    function (msg) {
                        console.log('Login googlelocal error: ' + msg);
                        deferred.reject(msg);
                    }
                );
            } else {
                authapi.authorize().then(
                    function (data) {
                        Config.setAppId(data.userId);
                        //                        if (data.userId = '23655') {
                        //                            //                                if (data.name == 'testugas') {
                        //                            $rootScope.appId = 'test';
                        //                        } else {
                        //                            $rootScope.appId = 'trento';
                        //                        }
                        localStorage.userId = data.userId;
                        localStorage.provider = 'google';
                        deferred.resolve(data);

                    },
                    function (reason) {
                        //reset data
                        localStorage.userId = null;
                        deferred.reject(reason);
                        //                        StorageSrv.saveUserId(null).then(function () {
                        //                            deferred.reject(reason);
                        //                        });
                    }
                );
            }

            return deferred.promise;
        };
        loginService.getTeacherName = function (schoolId) {
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/teacher',

                headers: {
                    'Accept': 'application/json'
                }
            }).
            success(function (data, status, headers, config) {
                if (data && data.data) {
                    $rootScope.teacherName = data.data.teacherFullname;
                }

            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        };

        loginService.logout = function () {
            var deferred = $q.defer();

            var complete = function (response) {
                loginService.reset().then(function () {
                    try {
                        cookieMaster.clear(
                            function () {
                                console.log('Cookies have been cleared');
                                deferred.resolve(response.data);
                            },
                            function () {
                                console.log('Cookies could not be cleared');
                                deferred.resolve(response.data);
                            });
                    } catch (e) {
                        deferred.resolve(e);
                    }
                });
            };

            $http.get(Config.getServerURL() + '/logout', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(
                    function (response) {
                        complete(response);
                    },
                    function (responseError) {
                        deferred.reject(responseError.data ? responseError.data.error : responseError);
                    }
                );

            return deferred.promise;
        };
        loginService.reset = function () {
            var deferred = $q.defer();
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            localStorage.removeItem('profileComplete');
            localStorage.removeItem('communities');
            deferred.resolve(true);
            return deferred.promise;
        };

        loginService.signin = function (user) {
            var deferred = $q.defer();
            $http.get(Config.URL() + '/' + Config.app() + '/userlogininternal?email=' + user.email + '&password=' + user.password, {
                    headers: {
                        'Accept': 'application/json',
                    }
                })
                .then(
                    function (res) {
                        //workaround for apple test
                        Config.setAppId(res.data.userId);
                        //                        if (res.data.userId = '23655') {
                        //                            //                        if (res.data.name == 'testugas') {
                        //                            $rootScope.appId = 'test';
                        //                        } else {
                        //                            $rootScope.appId = 'trento';
                        //                        }
                        var data = res.data;
                        localStorage.userId = data.userId;
                        localStorage.provider = 'internal';
                        deferred.resolve(data);

                    },
                    function (reason) {
                        localStorage.userId = null;
                        deferred.reject(reason);

                    }
                );

            return deferred.promise;
        }

        loginService.register = function (user) {
            var deferred = $q.defer();
            $http.post(Config.URL() + '/' + Config.app() + '/register', user, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(
                    function (response) {
                        deferred.resolve();
                    },
                    function (responseError) {
                        deferred.reject(responseError.status);
                    }
                );

            return deferred.promise;

        };
        return loginService;
    });
