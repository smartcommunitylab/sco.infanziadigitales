angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.dataServerService', [])

.factory('dataServerService', function ($http, $q) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var assenza = null;
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

    dataServerService.getTags = function () {
        var tags = null;
        var deferred = $q.defer();

        // temp
        if (tags == null) {
            $http.get('data/post-tags.json').success(function (data) {
                tags = data;
                deferred.resolve(tags);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(tags);
        }
        return deferred.promise;
    };

    dataServerService.getPostsByBabyId = function (babyId) {
        var posts = null;
        var deferred = $q.defer();

        // temp
        if (posts == null) {
            $http.get('data/calendario-diario.json').success(function (data) {
                posts = data.data;
                deferred.resolve(posts);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(posts);
        }
        return deferred.promise;
    };


    return dataServerService;
})
