angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.bus', [])

.controller('busCtrl', function ($scope, $location, dataServerService, profileService, $ionicLoading, $timeout, $cordovaPrinter, Config, Toast, $filter) {

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
            // if (bus.children[i].busStop)
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
        if (data && data.buses && data.buses.length > 0) {
            $scope.buses = data.buses;
            $scope.changeSelectedBus($scope.buses[0]);
        }
        $ionicLoading.hide();
        $scope.dataLoaded = true;
    }, function (err) {
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        $ionicLoading.hide();
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

        Toast.show($filter('translate')('function_disabled'), 'short', 'bottom');

        //        printer disabled
        //        var doc = "<html><body>";
        //        doc += "<p>";
        //        doc += "<h2>" + $scope.selectedBus.busName + "</h2>";
        //        var babyNumber = $scope.selectedBus.children.length;
        //        if ($scope.selectedBus.lastChildIsFake) {
        //            babyNumber -= 1;
        //        }
        //        for (var babyIndex = 0; babyIndex < babyNumber; babyIndex++) {
        //            doc += "<h3 style=\"margin: 2px 0px 2px 8px;\">" + $scope.selectedBus.children[babyIndex].fullName + "</h3>";
        //            doc += "<h4 style=\"margin: 2px 0px 2px 16px;\">" + $scope.selectedBus.children[babyIndex].busStop + "</h4>";
        //            doc += "<h4 style=\"margin: 2px 0px 8px 16px;\">" + $scope.selectedBus.children[babyIndex].personWhoWaitName + " (" + $scope.selectedBus.children[babyIndex].personWhoWaitRelation + ")" + "</h4>";
        //        }
        //        doc += "</p>";
        //
        //
        //        doc += "</body></html>";
        //        console.log(doc);
        //        var printerAvail = $cordovaPrinter.isAvailable();
        //        $cordovaPrinter.print(doc);
    }

    $scope.getChildImage = function (child) {

        var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + profileService.getSchoolProfile().schoolId + "/" + child.kidId + "/true/imagesnew";
        return image;
    }



});

//TODO: add print option: http://ngcordova.com/docs/plugins/printer/
