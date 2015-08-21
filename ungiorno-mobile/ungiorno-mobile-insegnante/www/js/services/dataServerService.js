angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var assenza = null;
    var schoolProfile = null; //static info
    var dataServerService = {};


    dataServerService.getBabyConfiguration = function (schoolId, kidId) {
            var deferred = $q.defer();

            if (babyConfiguration == null) {
                $http({
                    method: 'GET',
                    url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/config',
                    headers: {
                        'Accept': 'application/json'
                    }
                }).
                success(function (data, status, headers, config) {
                    deferred.resolve(data.data);
                }).
                error(function (data, status, headers, config) {
                    console.log(data + status + headers + config);
                    deferred.reject(data.errorCode + ' ' + data.errorMessage);
                });
            } else deferred.resolve(babyConfiguration);
            return deferred.promise;
        }
        //
        //getBabyProfiles(appId)
        //  GET /student/{appId}/profiles
    dataServerService.getBabyProfile = function () {
        var deferred = $q.defer();
        if (babyProfile == null) {
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/profiles',
                headers: {
                    'Accept': 'application/json'
                }
            }).
            success(function (data, status, headers, config) {
                deferred.resolve(data.data);
            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject(data.errorCode + ' ' + data.errorMessage);
            });
        } else deferred.resolve(babyProfile);
        return deferred.promise;
    }
    dataServerService.getBabyProfileById = function (babyId) {
        var deferred = $q.defer();

        /*temp*/
        if (babyProfile == null) {
            $http.get('data/bambino-profilo.json').success(function (data) {
                babyProfile = data.data[0];
                babyProfile.kidId = babyId;
                deferred.resolve(babyProfile);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(babyProfile);
        return deferred.promise;
        /*temp*/
    }
    dataServerService.getSchoolProfile = function () {
        var deferred = $q.defer();

        /*temp*/
        if (schoolProfile == null) {
            $http.get('data/scuola-profilo.json').success(function (data) {
                schoolProfile = data;
                deferred.resolve(schoolProfile);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(schoolProfile);
        return deferred.promise;
        /*temp*/
    }


    dataServerService.getSchoolProfileForTeacher = function () {
        var deferred = $q.defer();

        if (schoolProfile == null) {
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/profile',
                headers: {
                    'Accept': 'application/json'
                }
            }).
            success(function (data, status, headers, config) {
                schoolProfile = data.data;
                deferred.resolve(schoolProfile);
            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject(data.errorCode + ' ' + data.errorMessage);
            });
        } else deferred.resolve(schoolProfile);
        return deferred.promise;
    }

    dataServerService.getNotes = function () {
        var calendarioNote = null;
        var deferred = $q.defer();

        /*temp*/
        if (calendarioNote == null) {
            $http.get('data/calendario-note.json').success(function (data) {
                calendarioNote = data.data;
                deferred.resolve(calendarioNote);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(calendarioNote);
        return deferred.promise;
        /*temp*/
    }




    dataServerService.addCommunication = function (schoolId, communication) {
        var updatedCommunications = null;
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: communication,
        }).
        success(function (data, status, headers, config) {
            updatedCommunications = data;
            deferred.resolve(updatedCommunications);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
    }

    dataServerService.getCommunications = function (schoolId) {
        var calendarioCommunications = null;
        var deferred = $q.defer();
        if (calendarioCommunications == null) {
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications',
                headers: {
                    'Accept': 'application/json'
                }
            }).
            success(function (data, status, headers, config) {
                calendarioCommunications = data.data;
                deferred.resolve(calendarioCommunications);
            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject(data.errorCode + ' ' + data.errorMessage);
            });
        } else deferred.resolve(calendarioCommunications);
        return deferred.promise;
    }


    dataServerService.getAssenza = function (babyID) {
        var deferred = $q.defer();

        /*temp*/
        if (assenza == null) {
            //TODO: get assenza for babyID
            $http.get('data/calendario-assenza.json').success(function (data) {
                assenza = data;
                deferred.resolve(assenza);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(assenza);
        return deferred.promise;
        /*temp*/
    }


    dataServerService.sendAssenza = function (assenza) {
        var deferred = $q.defer();

        /*temp*/
        deferred.resolve(true);
        return deferred.promise;
        /*temp*/
    }
    dataServerService.sendRitiro = function (ritiro) {
        var deferred = $q.defer();


        /*temp*/
        deferred.resolve(true);
        return deferred.promise;
        /*temp*/

    }
    dataServerService.sendBabySetting = function (babysetting) {
        var deferred = $q.defer();
        /*temp*/
        deferred.resolve(true);
        return deferred.promise;
        /*temp*/

    }
    dataServerService.sendFermata = function (fermata) {
        var deferred = $q.defer();

        deferred.resolve(true);
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

    dataServerService.getSections = function () {
        var sections = null;
        var deferred = $q.defer();

        // temp
        if (sections == null) {
            $http.get('data/sections-profile.json').success(function (data) {
                sections = data;
                deferred.resolve(sections);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(sections);
        }
        return deferred.promise;
    };


    dataServerService.getTeachers = function (schoolId) {
        var teachers = null;
        var deferred = $q.defer();

        if (teachers == null) {
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/teachers',
                headers: {
                    'Accept': 'application/json'
                }
            }).
            success(function (data, status, headers, config) {
                teachers = data;
                deferred.resolve(teachers);
            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject(data.errorCode + ' ' + data.errorMessage);
            });
        } else {
            deferred.resolve(teachers);
        }
        return deferred.promise;
    };

    dataServerService.getTeachersCalendar = function () {
        var teachersCalendar = null;
        var deferred = $q.defer();

        // temp
        if (teachersCalendar == null) {
            $http.get('data/calendario-docenti.json').success(function (data) {
                teachersCalendar = data.data;
                deferred.resolve(teachersCalendar);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(teachersCalendar);
        }
        return deferred.promise;
    };


    dataServerService.getBuses = function () {
        var buses = null;
        var deferred = $q.defer();

        // temp
        if (buses == null) {
            $http.get('data/calendario-bus.json').success(function (data) {
                buses = data.data[0];
                deferred.resolve(buses);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(buses);
        }
        return deferred.promise;
    };

    return dataServerService;
})
