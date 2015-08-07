angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.bus', [])

.controller('busCtrl', function ($scope, $location, dataServerService, profileService, $ionicLoading, $timeout) {

    $scope.showLoader = function() {
        return $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0,
        });
        $scope.dataLoaded = false;
    };

    $scope.myLoader = $scope.showLoader();

    $scope.nowDate = new Date();
    $scope.changeSelectedBus = function(bus) {
        $scope.selectedBus = bus;
        $scope.realBabyNumer = $scope.selectedBus.children.length;
        if ($scope.selectedBus.lastChildIsFake) {
            $scope.realBabyNumer -= 1;
        }
        if ($scope.selectedBus.children.length % 2 === 1) { //last fake element if baby are odd, workaround to not have last baby card length 100% of the page
            var fakeBaby = {
                isFake: true
            };
            $scope.selectedBus.lastChildIsFake = true;
            $scope.selectedBus.children.push(fakeBaby);
        }
    }

    dataServerService.getBuses().then(function (data) {
        $timeout(function () {
            $scope.buses = data.buses;
            $scope.changeSelectedBus($scope.buses[0]);
            $scope.myLoader.hide();
            $scope.dataLoaded = true;
        }, 500); //delay to emulate response time from the server.

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

    $scope.openBabyDetails = function(baby) {
        profileService.setCurrentBabyID(baby.childrenId);
        window.location.assign('#/app/babyprofile');
    }





});

//TODO: add print option: http://ngcordova.com/docs/plugins/printer/
