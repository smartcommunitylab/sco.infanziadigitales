angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.schoolService', [])

.factory('schoolService', function ($http, $q) {
    var schoolProfile = null;
    var schoolService = {};


    schoolService.setSchoolProfile = function (school) {
        schoolProfile = school;
    }

    schoolService.getSchoolProfile = function () {
        return schoolProfile;
    }


    return schoolService;
})
