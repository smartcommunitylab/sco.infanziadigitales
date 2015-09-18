angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService, $rootScope) {
    var babyProfiles = null;
    var schoolProfile = null;

    var profileService = {};

    /**
     * Prepare the data downloading from server the kid profies of the current parent/teacher
     */
    profileService.init = function() {
        var deferred = $q.defer();
        dataServerService.getBabyProfiles().then(function (data) {
            babyProfiles = {};
            if (data == null || data.length == 0) return;
            for (var i = 0; i < data.length; i++) {
                babyProfiles[data[i].kidId] = data[i];
            }
            if (!localStorage.currentBabyID) profileService.setCurrentBabyID(data[0].kidId);
            else profileService.setCurrentBabyID(localStorage.currentBabyID);
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    profileService.setCurrentBabyID = function (babyId) {
        localStorage.currentBabyID = babyId;
        $rootScope.selectedKid = babyProfiles[babyId];
    }
    profileService.getCurrentBabyID = function () {
        return localStorage.currentBabyID;
    }

    profileService.getCurrentBaby = function () {
        var deferred = $q.defer();
        if (babyProfiles == null) {
            profileService.init().then(function(){
                deferred.resolve(babyProfiles[localStorage.currentBabyID]);
            });
        } else {
            deferred.resolve(babyProfiles[localStorage.currentBabyID]);
        }
        return deferred.promise;
    }

    profileService.getBabyProfileById = function (babyId) {
        return babyProfiles[babyId];
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

    return profileService;
})
