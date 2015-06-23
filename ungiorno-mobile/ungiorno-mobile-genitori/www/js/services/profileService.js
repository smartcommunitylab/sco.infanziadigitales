angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.profileService', [])

.factory('profileService', function ($http, $q) {
    var babyProfile = null;
    var schoolProfile = null;
    var profileService = {};


    profileService.setBabyProfile = function (input) {
        babyProfile = input[0];
    }

    profileService.getBabyProfile = function () {
        return babyProfile;
    }


    profileService.setSchoolProfile = function (input) {
        schoolProfile = input.data[0];
    }

    profileService.getSchoolProfile = function () {
        return schoolProfile;
    }


    return profileService;
})