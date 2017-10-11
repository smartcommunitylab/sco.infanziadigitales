angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.profileService', [])

.factory('profileService', function ($http, $q) {
    var babyProfile = null;
    var schoolProfile = null;
    var profileService = {};
    var babiesProfiles = [];
    var briefInfo = {};

    profileService.setBabiesProfiles = function (input) {
        babiesProfiles = input;
    }

    profileService.getBabiesProfiles = function () {
        return babiesProfiles;
    }
    profileService.setBabyProfile = function (input) {
        babyProfile = input;
    }

    profileService.getBabyProfile = function () {
        return babyProfile;
    }


    profileService.setSchoolProfile = function (input) {
        schoolProfile = input;
    }

    profileService.getSchoolProfile = function () {
        return schoolProfile;
    }

    profileService.setBriefInfo = function (input) {
        briefInfo = input;
    }

    profileService.getBriefInfo = function () {
        return briefInfo;
    }


    return profileService;
})
