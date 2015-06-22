angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.getProfilesService', [])

.factory('getProfilesService', function ($http, $q, DatiDB) {
    var babyProfile = null;
    var schoolProfile = null;
    var profileService = {};


    profileService.getBabyProfile = function (from) {
        /*temp*/
        $http.get('data/bambino-profilo.json').success(function (data) {
            babyProfile = data;
            if (from == 0)
                deferred.resolve(babyProfile);
            else deferred.resolve([]);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(err);
        });
        return deferred.promise;
        /*temp*/
    }

    profileService.getSchoolProfile = function (from) {
        /*temp*/
        $http.get('data/scuola-profilo.json').success(function (data) {
            schoolProfile = data;
            if (from == 0)
                deferred.resolve(schoolProfile);
            else deferred.resolve([]);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(err);
        });
        return deferred.promise;
        /*temp*/
    }


    return profileService;
})
