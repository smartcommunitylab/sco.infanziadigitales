angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService) {
    var babyProfile = null;
    var schoolProfile = null;
    var currentBabyID = null;
    var childrenProfiles = [];
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
            while (!found && i < data.data.length) {
                if (data.data[i].teacherId == teacherId) {
                    found = true;
                    deferred.resolve(data.data[i]);
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
        if (childrenProfiles.length == 0) {
            dataServerService.getSections().then(function (data) {
                //indicizza profili per sezione
                for (var i = 0; i < data.length; i++) {
                    childrenProfiles[data[i].sectionId] = data[i].children;
                }
                var matches = childrenProfiles[section].filter(function (children) {
                    if (children.childrenName.toLowerCase().indexOf(childrenName.toLowerCase()) !== -1) return true;
                })


                deferred.resolve(matches);

            });
        } else {
            var matches = childrenProfiles.filter(function (children) {
                if (children.name.toLowerCase().indexOf(childrenName.toLowerCase()) !== -1) return true;
            })


            deferred.resolve(matches);

        }

        return deferred.promise;

    };


    return profileService;
})
