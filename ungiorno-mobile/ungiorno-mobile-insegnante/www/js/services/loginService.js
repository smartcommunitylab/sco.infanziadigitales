angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.loginService', [])
	.factory('loginService', function ($rootScope, $q, $http, $window, Config) {
		var loginService = {};
		var authWindow = null;
		
		loginService.login = function () {
				var deferred = $q.defer();

				// log into the system and set userId
				var authapi = {
						authorize: function (url) {
								var deferred = $q.defer();

								var processThat = false;

								//Build the OAuth consent page URL
								var authUrl = Config.getServerURL() + '/userlogin';
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
												if (str.substring(str.length - 1) == '#') {
														str = str.substring(0, str.length - 1);
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

				authapi.authorize().then(
						function (data) {
							deferred.resolve(data);
						},
						function (reason) {
							deferred.reject(reason);
						}
				);

				return deferred.promise;
		};
	
	return loginService;
	
});