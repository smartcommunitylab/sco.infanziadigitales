angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.bus', [])

.controller('busCtrl', function ($scope, $location, dataServerService, profileService, $ionicLoading, $timeout, $cordovaPrinter) {

    $scope.showLoader = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0,
        });
        $scope.dataLoaded = false;
    };

    $scope.showLoader();

    $scope.nowDate = new Date();
    $scope.changeSelectedBus = function (bus) {
        //$scope.selectedBus = bus;
        //se non c'e' fermata non e' settato
        $scope.selectedBus = {
            busId: bus.busId,
            busName: bus.busName,
            children: [],
        };
        for (var i = 0; i < bus.children.length; i++) {
            if (bus.children[i].busStop)
                $scope.selectedBus.children.push(bus.children[i]);
        }
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
    $scope.isThisBus = function (busId) {
        if ($scope.selectedBus.busName == busId)
            return true;
        return false;


    }
    dataServerService.getBuses(profileService.getSchoolProfile().schoolId, new Date().getTime()).then(function (data) {
        $scope.buses = data.buses;
        $scope.changeSelectedBus($scope.buses[0]);
        $ionicLoading.hide();
        $scope.dataLoaded = true;
    });

    $scope.getBabiesByRow = function (rowIndex) {
        if ($scope.selectedBus !== undefined) {
            return $scope.selectedBus.children.slice(rowIndex * 2, rowIndex * 2 + 2);
        }
    }

    $scope.totalNumRow = function () {
        var ar = []; //workaround to repeat n times with ng-repeat
        if ($scope.selectedBus !== undefined) {
            for (var i = 0; i < Math.round($scope.selectedBus.children.length / 2); i++) {
                ar.push(i);
            }
        }
        return ar;
    }

    $scope.openBabyDetails = function (baby) {
        //it miss the setting of the kid profile (the section information)
        //window.location.assign('#/app/babyprofile');
    }

    $scope.print = function () {

        var doc = "<html><body>";
        for (var busIndex = 0; busIndex < $scope.buses.length; busIndex++) {
            doc += "<h2>" + $scope.buses[busIndex].busName + "</h2>";
            var babyNumber = $scope.buses[busIndex].children.length;
            if ($scope.buses[busIndex].lastChildIsFake) {
                babyNumber -= 1;
            }
            for (var babyIndex = 0; babyIndex < babyNumber; babyIndex++) {
                doc += "<h3 style=\"margin: 2px 0px 2px 8px;\">" + $scope.buses[busIndex].children[babyIndex].fullName + "</h3>";
                doc += "<h4 style=\"margin: 2px 0px 2px 16px;\">" + $scope.buses[busIndex].children[babyIndex].busStop + "</h4>";
                doc += "<h4 style=\"margin: 2px 0px 8px 16px;\">" + $scope.buses[busIndex].children[babyIndex].personWhoWaitName + " (" + $scope.buses[busIndex].children[babyIndex].personWhoWaitRelation + ")" + "</h4>";
            }
        }
        doc += "</body></html>";
        console.log(doc);
        var printerAvail = $cordovaPrinter.isAvailable();
        $cordovaPrinter.print(doc);
    }





});

//TODO: add print option: http://ngcordova.com/docs/plugins/printer/
