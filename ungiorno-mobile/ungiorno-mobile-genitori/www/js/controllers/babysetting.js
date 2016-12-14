angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.babysetting', [])

.controller('BabySettingCtrl', function ($scope, $rootScope, configurationService, profileService, $ionicNavBarDelegate, $ionicHistory, dataServerService, Toast, $filter) {
  $ionicNavBarDelegate.showBackButton(true);
  $ionicHistory.backView();
  $scope.babyConfiguration = configurationService.getBabyConfiguration();
  $scope.babyProfile = profileService.getBabyProfile();
  $scope.babyServices = [];
  $scope.busEnabled = false;
  $scope.busStops = [];
  $scope.time = {
    value: new Date()
  }

  if ($scope.babyConfiguration.services && $scope.babyConfiguration.services.bus) {
    $scope.busEnabled = $scope.babyConfiguration.services.bus.active;
  }
  for (var k in $scope.babyProfile.services) {
    if ($scope.babyProfile.services.hasOwnProperty(k)) {
      if ($scope.babyProfile.services[k].enabled)
        $scope.babyServices.push({
          text: k,
          checked: $scope.babyConfiguration.services[k].active
        })
    }
  }
  //set hour
  var exitTime = new Date();
  if (!$scope.babyProfile.services.posticipo.enabled) {
    //creo data nuova con ora configurata e setto il model della pagina
    exitTime.setHours(profileService.getSchoolProfile().regularTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);
  } else {
    exitTime.setHours(profileService.getSchoolProfile().posticipoTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);
  }
  $scope.time.value = exitTime;

  //set who get child
  $scope.retireDefault = {
    value: $scope.babyConfiguration.defaultPerson
  };

  //if bus set stop
  for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
    $scope.busStops.push({
      id: $scope.babyProfile.services.bus.stops[i].stopId,
      //tmp I have only stopId
      name: $scope.babyProfile.services.bus.stops[i].stopId
    });
  }
  $scope.selectedBusGo = $scope.busStops[0];
  $scope.selectedBusBack = $scope.busStops[0];


  $scope.showOptions = function (item) {
    if (item.text == "bus") {
      $scope.busEnabled = item.checked;
    }

  }

  $scope.setBabyConfiguration = function () {

    //set the new data
    $scope.babyConfiguration.services.bus.defaultIdGo = $scope.selectedBusGo.id;
    $scope.babyConfiguration.services.bus.defaultIdBack = $scope.selectedBusBack.id;
    var newServices = {};
    for (var i = 0; i < $scope.babyServices.length; i++) {
      if ($scope.babyServices[i].text == "bus") {
        newServices["bus"] = {
          active: $scope.babyServices[i].checked,
          defaultIdGo: $scope.selectedBusGo.id,
          defaultIdBack: $scope.selectedBusBack.id
        }

      } else {
        newServices[$scope.babyServices[i].text] = {
          active: $scope.babyServices[i].checked
        }
      }
    }
    $scope.babyConfiguration = {
      appId: $scope.babyConfiguration.appId,
      schoolId: $scope.babyConfiguration.schoolId,
      kidId: $scope.babyConfiguration.kidId,
      services: newServices,
      exitTime: new Date($scope.time.value).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substr(0, 5),
      defaultPerson: $scope.retireDefault.value,
      receiveNotification: $scope.babyConfiguration.receiveNotification,
      extraPersons: $scope.babyConfiguration.extraPersons
    };

    configurationService.setBabyConfiguration($scope.babyConfiguration);
  };

  $scope.saveNewSetting = function () {
    //set new data
    $scope.setBabyConfiguration();
    dataServerService.sendBabySetting($scope.babyConfiguration.schoolId, $scope.babyConfiguration.kidId, $scope.babyConfiguration).then(function (data) {
      Toast.show($filter('translate')('setting_sendok'), 'short', 'bottom');
      $scope.setBabyConfiguration();
      console.log("SENDING OK -> " + data);
      $ionicHistory.goBack();
    }, function (error) {
      Toast.show($filter('translate')('setting_sendok'), 'short', 'bottom');
      console.log("SENDING ERROR -> " + error);
    });
  }

  $scope.getTimeLabel = function () {
    var day = moment($scope.time.value);
    var result = day.format('HH:mm');
    return result;
  }


});
