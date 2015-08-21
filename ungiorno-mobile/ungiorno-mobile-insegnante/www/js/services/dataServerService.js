angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
    var dataServerService = {};


    dataServerService.getBabyConfiguration = function (schoolId, kidId) {
        var deferred = $q.defer();

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

        return deferred.promise;
    }
        //
        //getBabyProfiles(appId)
        //  GET /student/{appId}/profiles
    dataServerService.getBabyProfile = function () {
        var deferred = $q.defer();
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
        return deferred.promise;
    }

    dataServerService.getBabyProfileById = function (schoolId, kidId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/profile',
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
        return deferred.promise;
    }
    dataServerService.getSchoolProfile = function () {
        var deferred = $q.defer();

        $http.get('data/scuola-profilo.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            //deferred.reject(err);
        })
        return deferred.promise;
    }


    dataServerService.getSchoolProfileForTeacher = function () {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/profile',
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
        return deferred.promise;
    }

    dataServerService.getNotes = function () {
        var deferred = $q.defer();

        $http.get('data/calendario-note.json').success(function (data) {
            deferred.resolve(data.data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            //deferred.reject(err);
        })
        return deferred.promise;
        /*temp*/
    }

    dataServerService.getNotesForTeachers = function (schoolId, sectionId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/' + sectionId + '/notes',
            params: {
                date: new Date().getTime()
            },
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
        return deferred.promise;
    }

    dataServerService.getNotesForParents = function (schoolId, kidId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes',
            params: {
                date: new Date().getTime()
            },
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
        return deferred.promise;
    }

    dataServerService.addNewNoteForParents = function (schoolId, kidId, note) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: note,
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
    }

    dataServerService.addNewNoteForTeacher = function (schoolId, kidId, note) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: note,
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
    }



    dataServerService.addCommunication = function (schoolId, communication) {
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
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
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
            }
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
    }


    dataServerService.getAssenza = function (babyID) {
        var deferred = $q.defer();

        //TODO: get assenza for babyID
        $http.get('data/calendario-assenza.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            //deferred.reject(err);
        })
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
    dataServerService.getCalendars = function (from, to, schoolId, kidId) {
        var deferred = $q.defer();

        $http({
           method: 'GET',
           url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + 'calendar',
           params: {
               from: from,
               to: to
           },
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
        return deferred.promise;
        /*temp*/
    }

    dataServerService.getMeals = function () {
        var deferred = $q.defer();

        /*temp*/
        $http.get('data/calendario-mensa.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            //deferred.reject(err);
        })
        return deferred.promise;
        /*temp*/
    }

    dataServerService.getSections = function () {
        var deferred = $q.defer();

        $http.get('data/sections-profile.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
        });
        return deferred.promise;
    };


    dataServerService.getTeachers = function (schoolId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/teachers',
            headers: {
                'Accept': 'application/json'
            }
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
    };

    dataServerService.getTeachersCalendar = function (schoolId, from, to) {
        var deferred = $q.defer();

        $http({
           method: 'GET',
           url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/' + 'teachercalendar',
           params: {
               from: from,
               to: to
           },
           headers: {
                'Accept': 'application/json'
           }
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data[0]);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
    };


    dataServerService.getBuses = function (schoolId, date) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/' + 'buses',
            params: {
                date: date
            },
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
        return deferred.promise;
    };

    return dataServerService;
})
