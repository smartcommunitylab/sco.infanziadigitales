angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.babysetting', [])

.controller('BabySettingCtrl', function ($scope, configurationService, profileService, $ionicNavBarDelegate, $ionicHistory) {
    $ionicNavBarDelegate.showBackButton(true);
    $ionicHistory.backView();
    var babyConfiguration = configurationService.getBabyConfiguration();
    $scope.babyProfile = profileService.getBabyProfile();
    $scope.babyServices = [];
    $scope.busEnabled = true;
    $scope.busStops = [];
//    $scope.items = [
//        {
//            id: 1,
//            name: 'Foo'
//        },
//        {
//            id: 2,
//            name: 'Bar'
//        }
//    ];
//
//    $scope.selectedBusGo = $scope.busStops[0];
//    $scope.selectedBusBack = $scope.busStops[0];


    $scope.time = new Date(0);

    for (var k in $scope.babyProfile.services) {
        if ($scope.babyProfile.services.hasOwnProperty(k)) {
            if ($scope.babyProfile.services[k].enabled)
                $scope.babyServices.push({
                    text: k,
                    checked: babyConfiguration.services[k].active
                })
                // user[k] = data[k];
        }
    }
    //set hour

    //set who get child

    //if bus set stop
    for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
        $scope.busStops.push({
            id: $scope.babyProfile.services.bus.stops[i].stopId,
            name: $scope.babyProfile.services.bus.stops[i].address
        });
    }
    $scope.selectedBusGo = $scope.busStops[0];
    $scope.selectedBusBack = $scope.busStops[0];
    //init select

    //    if ($scope.busStops[0]) {
    //        $scope.busGo = $scope.busStops[0];
    //        $scope.busBack = $scope.busStops[0];
    //    }
//    $scope.initStops = function () {
//        $scope.busGo = $scope.busStops[0];
//        $scope.busBack = $scope.busStops[0];
//    }
    $scope.showOptions = function (item) {
        if (item.text == "bus") {
            $scope.busEnabled = item.checked;
        }

    }
});
