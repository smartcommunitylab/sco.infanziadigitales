angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService) {
    var babyProfile = null;
    var schoolProfile = null;
    var currentBabyID = null;
    var profileService = {};

    profileService.setCurrentBaby = function (input) {
        babyProfile = input;
    }

    profileService.getCurrentBaby = function () {
        return babyProfile;
    }

    profileService.getBabyProfileById = function (schoolId, babyId) {
        var deferred = $q.defer();
        dataServerService.getBabyProfileById(schoolId, babyId).then(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    profileService.getTeacherProfileById = function (schoolId, teacherId) {
        var deferred = $q.defer();
        dataServerService.getTeachers(schoolId).then(function (data) {
            var found = false;
            var i = 0;
            while (!found && i < data.length) {
                if (data[i].teacherId == teacherId) {
                    found = true;
                    deferred.resolve(data[i]);
                }
                i++;
            }
        });
        return deferred.promise;
    }

    profileService.setSchoolProfile = function (input) {
        schoolProfile = input;
    }

    profileService.getSchoolProfile = function () {
        return schoolProfile;
    }

    profileService.searchChildrenBySection = function (childrenName, section) {

        var deferred = $q.defer();

        var matches = section.children.filter(function (children) {
            return children.childrenName.toLowerCase().indexOf(childrenName.toLowerCase()) !== -1;
        })


        deferred.resolve(matches);

        return deferred.promise;

    };


    return profileService;
})
