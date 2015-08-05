angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, moment, teachersService, sectionService, $ionicSideMenuDelegate) {
    $scope.sections = null;
    $scope.section = null;
    $scope.childrenConfigurations = [];
    $scope.childrenProfiles = [];
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
                $scope.numberOfChildren = $scope.section.children.length;
                for (var i = 0; i < $scope.numberOfChildren; i++) {
                    profileService.getBabyProfileById($scope.section.children[i].childrenId).then(function (profile) {
                        $scope.childrenProfiles.push(profile);

                    });
                    babyConfigurationService.getBabyConfigurationById($scope.section.children[i].childrenId).then(function (configuration) {
                        $scope.childrenConfigurations.push(configuration);
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
});
