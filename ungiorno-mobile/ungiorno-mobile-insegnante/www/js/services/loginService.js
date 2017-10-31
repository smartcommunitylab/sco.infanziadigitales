angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.loginService', [])

.factory('loginService', function ($rootScope, $q, $http, $window, StorageSrv, Config) {
  var loginService = {};

  var authWindow = null;

  loginService.userIsLogged = function () {
    console.log(StorageSrv.getUserId());
    console.log(StorageSrv.getUser());
    return (StorageSrv.getUserId() != null);
    // return (StorageSrv.getUserId() != null && StorageSrv.getUser() != null);
  };

  loginService.login = function (provider) {
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
          authWindow=cordova.InAppBrowser.open(authUrl,'_self');
          //authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
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
           'webClientId': '453601816446-sff20g4la1mq62joo05indc34umiu9rh.apps.googleusercontent.com',
          'offline': true
        },
        function (obj) {
          var token = obj.oauthToken;
          if (!token) token = obj.accessToken;
          authapi.authorize(token).then(
            function (data) {
              Config.setAppId(data.userId);
              StorageSrv.saveUserId(data.userId).then(function () {
                deferred.resolve(data);
                //                                UserSrv.getUser(data.userId).then(function () {
                //                                    deferred.resolve(data);
                //                                }, function (reason) {
                //                                    StorageSrv.saveUserId(null).then(function () {
                //                                        deferred.reject(reason);
                //                                    });
                //                                });
              });
            },
            function (reason) {
              //reset data
              StorageSrv.saveUserId(null).then(function () {
                deferred.reject(reason);
              });
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
          StorageSrv.saveUserId(data.userId).then(function () {
            deferred.resolve(data);
            //                        UserSrv.getUser(data.userId).then(function () {
            //                            deferred.resolve(data);
            //                        }, function (reason) {
            //                            StorageSrv.saveUserId(null).then(function () {
            //                                deferred.reject(reason);
            //                            });
            //                        });
          });
        },
        function (reason) {
          //reset data
          StorageSrv.saveUserId(null).then(function () {
            deferred.reject(reason);
          });
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
      StorageSrv.reset().then(function () {
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

  return loginService;

});
