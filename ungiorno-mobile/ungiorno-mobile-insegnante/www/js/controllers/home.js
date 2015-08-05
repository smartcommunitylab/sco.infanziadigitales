angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, moment, teachersService, sectionService, $ionicSideMenuDelegate) {
    $scope.sections = null;
    $scope.section = null;
    $scope.children = [];
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

        dataServerService.getSections().then(function (data) {
            $scope.sections = data;
            $scope.section = $scope.sections[0];
            sectionService.setSection($scope.section)
                //get children info
            $scope.numberOfChildren = $scope.section.children.length;
            for (var i = 0; i < $scope.numberOfChildren; i++) {
                profileService.getBabyProfileById($scope.section.children[i].childrenId).then(function (data) {
                    $scope.children.push(data);
                });
            }


        });
    };
    $scope.changeSection = function (sectionId) {
        sectionService.setSection(section)
    }
    $scope.openDetail = function (child) {
        profileService.setBabyProfile(child);
        window.location.assign('#/app/babyprofile');
    }
});
