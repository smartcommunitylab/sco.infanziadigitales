angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.section', [])

.controller('SectionCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, moment, teachersService, $ionicSideMenuDelegate) {
    $scope.title = moment().locale('it').format("dddd, D MMMM gggg");
});