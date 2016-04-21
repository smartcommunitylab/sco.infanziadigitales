angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.section', [])

.controller('SectionCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, moment, teachersService, $ionicSideMenuDelegate) {
    $scope.title = moment().locale('it').format("dddd, D MMMM gggg");
    $scope.initialize = function () {
        dataServerService.getTeachers().then(function (data) {
            teachersService.setTeachers(data.data); // temp
            $scope.selectedTeacher = data.data[0];
            teachersService.setSelectedTeacher($scope.selectedTeacher);
            console.log($scope.selectedTeacher);
        });

        dataServerService.getSections().then(function (data) {
            $scope.sections = data;
        });
    };
});
