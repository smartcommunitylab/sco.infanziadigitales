angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService, $rootScope, Config) {
    var babyProfiles = null;
    var schoolProfile = null;
    var userData = null;
    var profileService = {};
    var kidType = [];


    /**
     * Prepare the data downloading from server the kid profies of the current parent/teacher
     */
    profileService.init = function () {
        var deferred = $q.defer();
        profileService.getUserProfile().then(function (data) {
            userData = data;
            if (localStorage.currentProfile == "parent") {
                kidType = userData.kids;
            } else {
                kidType = userData.students;
            }
            babyProfiles = {};
            if (data == null || data.length == 0) return;
            var calls=[];
            for (var i = 0; i < kidType.length; i++) {
                calls.push(profileService.getBabyById(kidType[i].kidId, kidType[i].schoolId).then(function (data) {
                    babyProfiles[data.kidId] = data;
                }));
            }
            $q.all(calls).then(function(values){
                deferred.resolve(babyProfiles);
            })
            if (!localStorage.currentBabyID) profileService.setCurrentBabyID(kidType[0].kidId);
            else profileService.setCurrentBabyID(localStorage.currentBabyID);
        });
        return deferred.promise;
    };

    /*Get user profile after login*/

    profileService.getUserData = function () {
        return userData;
    };

    profileService.setCurrentBabyID = function (babyId) {
        localStorage.currentBabyID = babyId;
        profileService.getBabyById(localStorage.currentBabyID, 'scuola2').then(function (data) {
            $rootScope.selectedKid = data;
        });

        /*$rootScope.selectedKid = babyProfiles[babyId];*/
    }
    profileService.getCurrentBabyID = function () {
        return localStorage.currentBabyID;
    }

    profileService.getUserProfile = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/profile',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    /*profileService.getCurrentBaby = function () {
        var deferred = $q.defer();
        if (babyProfiles == null) {
            profileService.init().then(function(){
                deferred.resolve(babyProfiles[localStorage.currentBabyID]);
            });
        } else {
            deferred.resolve(babyProfiles[localStorage.currentBabyID]);
        }
        return deferred.promise;
    }*/

    profileService.getCurrentBaby = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/scuola2/kids/'+localStorage.currentBabyID+'?isTeacher=true',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    profileService.getBabyById = function (kidId, schoolId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/kids/' + kidId + '?isTeacher=true',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    profileService.getBabyProfileById = function (babyId) {
        return babyProfiles[babyId];
    }

    profileService.getAllBabyProfiles = function () {
        return babyProfiles;
    }

    profileService.isParentProfile = function () {
        var storedProfile = localStorage.currentProfile;
        if (storedProfile && storedProfile != 'null') {
            return storedProfile == 'parent';
        } else {
            profileService.getUserProfile().then(function (data) {
                var user = data;
                if (user) {
                    if (user.parent && user.parent.userId) {
                        localStorage.currentProfile = 'parent';
                        return true;
                    } else {
                        localStorage.currentProfile = 'teacher';
                        return false;
                    }
                }
                return null;
            });
        }
    };

    profileService.isMultiProfile = function () {
        /*var user = dataServerService.getUser();
        return user && user.parent && user.parent.userId && user.teacher && user.teacher.userId;*/
        /*TODO: check if it is multyprofile*/
        return true;
    }

    profileService.toggleUserProfile = function () {
        if (profileService.isParentProfile()) {
            localStorage.currentProfile = 'teacher';
        } else {
            localStorage.currentProfile = 'parent';
        }
    };

    return profileService;
})
