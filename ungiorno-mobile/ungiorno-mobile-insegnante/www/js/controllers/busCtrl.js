angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.bus', [])

.controller('busCtrl', function ($scope, $location) {

    dataServerService.getBuses().then(function (data) {
        $scope.buses = data;




    });


});
