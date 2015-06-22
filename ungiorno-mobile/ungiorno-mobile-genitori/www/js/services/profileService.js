angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.profileService', [])

.factory('profileService', function ($http, $q) {
    var babyProfile = null;
    var schoolProfile = null;
    var profileService = {};


    profileService.getBabyProfile = function () {
        return babyProfile;
    }

    profileService.getSchoolProfile = function () {
        return babyProfile;
    }

    return profileService;
})
