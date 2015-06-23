angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.dataServerService', [])

.factory('dataServerService', function ($http, $q) {
    var babyConfiguration = null;
    var babyProfile = null;
    var schoolProfile = null;
    var dataServerService = {};


    dataServerService.getBabyConfiguration = function (from) {
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


    dataServerService.getBabyProfile = function (from) {
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

    dataServerService.getSchoolProfile = function (from) {
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
    dataServerService.sendAssenza = function (assenza) {
        var deferred = $q.defer();

        /*temp*/
        //        $http({
        //            method: 'POST',
        //            url: Config.URL() + '/' + Config.app() + '/' + Config.userdata() + '/' + Config.appId() + '/' + pathId + '/' + 'rate',
        //            headers: {
        //                'Accept': 'application/json',
        //                'Content-Type': 'application/json'
        //            },
        //            data: {
        //                'vote': vote,
        //                'comment': comment
        //            }
        //        }).
        //        success(function (data, status, headers, config) {
        //            deferred.resolve(data.data);
        //        }).
        //        error(function (data, status, headers, config) {
        //            console.log(data + status + headers + config);
        //            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        //        });
        deferred.resolve(true);
        return deferred.promise;
        /*temp*/
    }
    dataServerService.sendRitiro = function (from) {
        var deferred = $q.defer();


        /*temp*/
        //        $http({
        //            method: 'POST',
        //            url: Config.URL() + '/' + Config.app() + '/' + Config.userdata() + '/' + Config.appId() + '/' + pathId + '/' + 'rate',
        //            headers: {
        //                'Accept': 'application/json',
        //                'Content-Type': 'application/json'
        //            },
        //            data: {
        //                'vote': vote,
        //                'comment': comment
        //            }
        //        }).
        //        success(function (data, status, headers, config) {
        //            deferred.resolve(data.data);
        //        }).
        //        error(function (data, status, headers, config) {
        //            console.log(data + status + headers + config);
        //            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        //        });
        deferred.resolve(true);
        return deferred.promise;
        /*temp*/

    }

    return dataServerService;
})
