angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var schoolProfile = null; //static info
    var dataServerService = {};





    dataServerService.getBabyConfigurationById = function (schoolId, kidId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/config',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    dataServerService.getBabyProfiles = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/profiles',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    dataServerService.getBabyProfile = function () {
        var deferred = $q.defer();

        /*temp*/
        if (babyProfile == null) {
            $http.get('data/bambino-profilo.json').success(function (data) {
                babyProfile = data.data;
                deferred.resolve(babyProfile);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(babyProfile);
        return deferred.promise;
        /*temp*/
    }

    dataServerService.getSchoolProfile = function (schoolId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/profile',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    dataServerService.getNotes = function (schoolId, kidId, time) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes?date=' + time,
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });

        return deferred.promise;
    }
    dataServerService.getCommunications = function (schoolId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    dataServerService.getFermata = function (schoolId, kidId, time) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/stop?date=' + time,
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    dataServerService.getReturnsOrStops = function (schoolId, kidId, timeFrom, timeTo) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/returns-or-stops?from=' + timeFrom + '&to=' + timeTo,
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    dataServerService.sendAssenza = function (schoolId, kidId, assenza) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/absence',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: assenza,
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(assenza);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }
    dataServerService.getAbsence = function (schoolId, kidId, date) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/absence?date=' + date,
                headers: {
                    'Accept': 'application/json'
                },
                timeout: Config.httpTimout()
            }).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject(data);
            });
            return deferred.promise;
        }
        //     addNewNoteForTeacher(appId,schoolId, kidid)
        //  POST /school/{appId}/{schoolId}/{kidId}/notes

    dataServerService.sendNota = function (schoolId, kidId, nota) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: nota,
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    dataServerService.sendRitiro = function (schoolId, kidId, ritiro) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/return',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: ritiro,
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(ritiro);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;

    }


    dataServerService.getRitiro = function (schoolId, kidId, time) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/return?date=' + time,
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });

        return deferred.promise;
    }


    dataServerService.sendBabySetting = function (schoolId, kidId, babysetting) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/config',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: babysetting,
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(babysetting);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }
    dataServerService.sendFermata = function (schoolId, kidId, fermata) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/stop',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: fermata,
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(fermata);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }
    dataServerService.getCalendars = function (from, to, schoolid, kidid) {
        var calendarioScuola = null;
        var deferred = $q.defer();

        /*temp*/
        if (calendarioScuola == null) {
            $http.get('data/calendario-scuola.json').success(function (data) {
                calendarioScuola = data;
                deferred.resolve(calendarioScuola);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(calendarioScuola);
        return deferred.promise;
        /*temp*/
    }

    dataServerService.getMeals = function () {
        var meals = null;
        var deferred = $q.defer();

        /*temp*/
        if (meals == null) {
            $http.get('data/calendario-mensa.json').success(function (data) {
                meals = data;
                deferred.resolve(meals);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(meals);
        return deferred.promise;
        /*temp*/
    }


    dataServerService.getMessages = function (timestamp, limit, schoolId, kidId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + kidId + (timestamp ? ('?timestamp=' + timestamp) : '') + (limit ? ('&limit=' + limit) : ''),
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };
    dataServerService.getUnreadMessages = function (schoolId, kidId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + kidId + '/unread/fromteacher',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };

    dataServerService.sendMessage = function (schoolId, kidId, msg) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/fromparent',
            headers: {
                'Accept': 'application/json'
            },
            data: msg,
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };
    dataServerService.receivedMessage = function (schoolId, kidId, msgId) {
        var deferred = $q.defer();
        $http({
            method: 'PUT',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + msgId + '/received',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };
    dataServerService.seenMessage = function (schoolId, kidId, msgId) {
        var deferred = $q.defer();
        $http({
            method: 'PUT',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + msgId + '/seen',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    dataServerService.pushNotificationRegister = function (registrationId) {
        var deferred = $q.defer();
        $http({
            method: 'PUT',
            url: Config.URL() + '/' + Config.app() + '/parent/' + Config.appId() + '/register?registrationId=' + registrationId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    return dataServerService;
})
