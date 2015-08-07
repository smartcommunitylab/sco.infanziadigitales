angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.bus', [])

.controller('busCtrl', function ($scope, $location, dataServerService, profileService) {

    $scope.nowDate = new Date();
    $scope.changeSelectedBus = function(bus) {
        $scope.selectedBus = bus;
        $scope.numberOfBabyFirstCol = Math.round(bus.children.length / 2);
        $scope.numberOfBabySecondCol = bus.children.length - $scope.numberOfBabyFirstCol;
    }

    dataServerService.getBuses().then(function (data) {
        $scope.buses = data.buses;
        $scope.changeSelectedBus($scope.buses[0]);
        console.log(JSON.stringify($scope.getBabiesForRowIndex()));
    });

    $scope.getBabiesByRow = function(rowIndex) {
        if ($scope.selectedBus !== undefined) {
            return $scope.selectedBus.children.slice(rowIndex * 2, rowIndex * 2 + 2);
        }
    }

    $scope.totalNumRow = function() {
        var ar = []; //workaround to repeat n times with ng-repeat
        if ($scope.selectedBus !== undefined) {
            for (var i = 0; i < Math.round($scope.selectedBus.children.length / 2); i++) {
                ar.push(i);
            }
        }
        return ar;
    }





});
