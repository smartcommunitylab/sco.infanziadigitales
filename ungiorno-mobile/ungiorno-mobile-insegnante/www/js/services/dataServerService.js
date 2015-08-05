angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.dataServerService', [])

.factory('dataServerService', function ($http, $q) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var schoolProfile = null; //static info
    var dataServerService = {};


    dataServerService.getBabyConfiguration = function () {
        var deferred = $q.defer();

        /*temp*/
        if (babyConfiguration == null) {
            $http.get('data/bambino-configurazione.json').success(function (data) {
                babyConfiguration = data.data;
                deferred.resolve(babyConfiguration);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            });

            /*temp*/
        } else deferred.resolve(babyConfiguration);
        return deferred.promise;
    }


    dataServerService.getBabyProfile = function () {
        var deferred = $q.defer();

        /*temp*/
        if (babyProfile == null) {
            $http.get('data/bambino-profilo.json').success(function (data) {
                babyProfile = data.data[0];
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

    dataServerService.getNotes = function () {
        var calendarioNote = null;
        var deferred = $q.defer();

        /*temp*/
        if (calendarioNote == null) {
            $http.get('data/calendario-note.json').success(function (data) {
                calendarioNote = data;
                deferred.resolve(calendarioNote);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            })
        } else deferred.resolve(calendarioNote);
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

    dataServerService.getTeachers = function () {
        var teachers = null;
        var deferred = $q.defer();

        // temp
        if (teachers == null) {
            $http.get('data/teacher-profile.json').success(function (data) {
                teachers = data;
                deferred.resolve(teachers);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(teachers);
        }
        return deferred.promise;
    };

    return dataServerService;
})
