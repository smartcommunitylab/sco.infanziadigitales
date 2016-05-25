angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.profileService', [])

.factory('profileService', function ($http, $q, dataServerService, $rootScope, Config, $window, $state) {
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
            userData = angular.copy(data);
            if (localStorage.currentProfile === "parent") {
                kidType = userData.kids;
            } else if (localStorage.currentProfile === "teacher") {
                kidType = userData.students;
            } else {
                if (!!userData.parent && !!userData.parent.userId && !!userData.teacher && !!userData.teacher.userId) {
                    if (!!userData.parent && !!userData.parent.userId) {
                        localStorage.isMultiProfile = true;
                    }
                    localStorage.currentProfile = 'parent';
                    kidType = userData.kids;

                } else {
                    localStorage.currentProfile = 'teacher';
                    kidType = userData.students;
                }
            }
            babyProfiles = {};
            if (data == null || data.length == 0) return;
            var calls = [];
            for (var i = 0; i < kidType.length; i++) {
                calls.push(profileService.getBabyById(kidType[i].kidId, kidType[i].schoolId).then(function (data) {
                    babyProfiles[data.kidId] = data;
                }));
            }
            $q.all(calls).then(function (values) {
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
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/scuola2/kids/' + localStorage.currentBabyID + '?isTeacher=' + dataServerService.isATeacher(),
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
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/kids/' + kidId + '?isTeacher=' + dataServerService.isATeacher(),
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

    profileService.saveChildProfile = function (babyProfile) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + babyProfile.schoolId + '/' + 'kids/' + babyProfile.kidId + '?isTeacher=' + dataServerService.isATeacher(),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: babyProfile,
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
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
            if (localStorage.currentProfile === 'parent') {
                return true;
            } else {
                return false;
            }
        }
    };

    profileService.isMultiProfile = function () {
        /*var user = dataServerService.getUser();
        return user && user.parent && user.parent.userId && user.teacher && user.teacher.userId;*/
        /*TODO: check if it is multyprofile*/
        if (localStorage.isMultiProfile == "true") {
            return true;
        }
    }

    profileService.toggleUserProfile = function () {
        if (profileService.isParentProfile()) {
            localStorage.currentProfile = 'teacher';
            localStorage.removeItem('currentBabyID');
            $state.go('app.home', null, {
                reload: true
            });
        } else {
            localStorage.currentProfile = 'parent';
            localStorage.removeItem('currentBabyID');
            $state.go('app.home', null, {
                reload: true
            });
        }
    };

    return profileService;
})
