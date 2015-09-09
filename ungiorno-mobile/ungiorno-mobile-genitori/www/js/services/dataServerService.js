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

    dataServerService.getBabyProfiles = function () {
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

    dataServerService.getNotes = function (schoolId, kidId, time) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes?date=' + time,
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


    dataServerService.sendAssenza = function (schoolId, kidId, assenza) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/absence',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: note,
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(assenza);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
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
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(ritiro);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
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
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(babysetting);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;
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

    return dataServerService;
})
