angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])

.controller('HomeCtrl', function ($scope, dataServerService) {

    dataServerService.getBabyProfile("a").then(function (baby) {
        $scope.baby = baby;
    });

    dataServerService.getPostsByBabyId("a").then(function (posts) {
        $scope.posts = posts;
    });



});
