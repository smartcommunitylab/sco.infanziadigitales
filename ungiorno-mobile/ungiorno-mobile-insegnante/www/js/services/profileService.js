angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService) {
    var babyProfile = null;
    var schoolProfile = null;
    var currentBabyID = null;
    var profileService = {};

    //not used anymore by babyProfile!
    profileService.setBabyProfile = function (input) {
        babyProfile = input;
    }

    profileService.getBabyProfile = function () {
        return babyProfile;
    }

    //usefull to pass babyID to the babyProfileCtrl
    profileService.setCurrentBabyID = function (babyId) {
        currentBabyID = babyId;
    }
    profileService.getCurrentBabyID = function () {
        return currentBabyID;
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

    profileService.getTeacherProfileById = function (teacherId) {
        var deferred = $q.defer();
        /*tmp*/
        dataServerService.getTeachers().then(function (data) {
            var found = false;
            var i = 0;
            while (!found && i < data.data.length) {
                if (data.data[i].teacherId == teacherId) {
                    found = true;
                    deferred.resolve(data.data[i]);
                }
                i++;
            }
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
