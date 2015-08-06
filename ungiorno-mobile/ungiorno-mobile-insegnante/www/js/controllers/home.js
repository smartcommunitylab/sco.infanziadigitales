angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, moment, teachersService, sectionService, $ionicSideMenuDelegate) {
    $scope.sections = null;
    $scope.section = null;
    $scope.childrenConfigurations = [];
    $scope.childrenProfiles = [];
    $scope.childrenNotes = [];
    $scope.availableChildren = [];
    $scope.totalChildrenNumber = [];
    $scope.schoolProfile = null;
    $scope.numberOfChildren = 0;
    $scope.title = moment().locale('it').format("dddd, D MMMM gggg");
    $scope.initialize = function () {
        dataServerService.getTeachers().then(function (data) {
            teachersService.setTeachers(data.data);
            // temp
            $scope.selectedTeacher = data.data[0];
            teachersService.setSelectedTeacher($scope.selectedTeacher);
            console.log($scope.selectedTeacher);
        });
        dataServerService.getSchoolProfile().then(function (schoolProfile) {
            $scope.schoolProfile = schoolProfile.data[0];
            profileService.setSchoolProfile($scope.schoolProfile);
            dataServerService.getSections().then(function (data) {
                $scope.sections = data;
                $scope.section = $scope.sections[0];
                sectionService.setSection($scope.section)
                    //get children info
                $scope.getChildrenNumber('anticipo');
                $scope.getChildrenNumber('posticipo');
                $scope.getChildrenNumber('mensa');

                $scope.numberOfChildren = $scope.section.children.length;
                for (var i = 0; i < $scope.numberOfChildren; i++) {
                    profileService.getBabyProfileById($scope.section.children[i].childrenId).then(function (profile) {
                        $scope.childrenProfiles.push(profile);
                    });
                    babyConfigurationService.getBabyConfigurationById($scope.section.children[i].childrenId).then(function (configuration) {
                        $scope.childrenConfigurations.push(configuration);
                    });
                    babyConfigurationService.getBabyNotesById($scope.section.children[i].childrenId).then(function (notes) {
                        $scope.childrenNotes.push(notes);
                    });
                };
            })
        });

    };

    $scope.changeSection = function (sectionId) {
        sectionService.setSection(section)
    }
    $scope.openDetail = function (index) {
        profileService.setBabyProfile($scope.childrenProfiles[index]);
        babyConfigurationService.setBabyConfiguration($scope.childrenConfigurations[index]);
        window.location.assign('#/app/babyprofile');
    }

    $scope.getChildrenNumber = function (periodOfTheDay) {
        $scope.totalChildrenNumber[periodOfTheDay] = 0;
        $scope.availableChildren[periodOfTheDay] = 0;

        if ($scope.section != null) {
            for (var i = 0; i < $scope.section.children.length; i++) {
                if ($scope.section.children[i][periodOfTheDay].enabled) {
                    //totalNumber++;
                    $scope.totalChildrenNumber[periodOfTheDay] ++;
                }
                if ($scope.section.children[i].exitTime != null && $scope.section.children[i].exitTime > Date.now() && $scope.section.children[i][periodOfTheDay].active) {
                    //totalNumber++;
                    $scope.availableChildren[periodOfTheDay] ++;
                }
            }
        }
    }

    //    .directive('section', function () {
    //        return {
    //            template: '<svg id="svg" viewbox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ddd" /><path fill="none" stroke-linecap="round" stroke-width="5" stroke="#fff" stroke-dasharray="100,250" d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80" /><text x="50" y="50" text-anchor="middle" dy="7" font-size="20">{{sections.length}}</text></svg>'
    //        };
    //    });
    $scope.changeSection = function (sectionId) {
        sectionService.setSection(section)
    }
    $scope.openDetail = function (index) {
        profileService.setBabyProfile($scope.childrenProfiles[index]);
        babyConfigurationService.setBabyConfiguration($scope.childrenConfigurations[index]);
        babyConfigurationService.setBabyNotes($scope.childrenNotes[index]);
        window.location.assign('#/app/babyprofile');
    }
});
