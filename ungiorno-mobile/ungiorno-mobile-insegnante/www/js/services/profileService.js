angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService) {
    var babyProfile = null;
    var schoolProfile = null;
    var profileService = {};


    profileService.setBabyProfile = function (input) {
        babyProfile = input;
    }

    profileService.getBabyProfile = function () {
        return babyProfile;
    }

    profileService.getBabyProfileById = function (babyId) {
        var deferred = $q.defer();
        /*tmp*/
        dataServerService.getBabyProfile().then(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
        /*tmp*/
    }

    profileService.setSchoolProfile = function (input) {
        schoolProfile = input;
    }

    profileService.getSchoolProfile = function () {
        return schoolProfile;
    }




    return profileService;
})
