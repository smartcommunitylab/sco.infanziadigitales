angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.babysetting', [])

.controller('BabySettingCtrl', function ($scope, $rootScope, configurationService, profileService, $ionicNavBarDelegate, $ionicHistory, dataServerService, Toast, $filter) {
  $ionicNavBarDelegate.showBackButton(true);
  $ionicHistory.backView();
  $scope.babyConfiguration = configurationService.getBabyConfiguration();
  console.log($scope.babyConfiguration);
  $scope.babyProfile = profileService.getBabyProfile();
  console.log('fillim');
  console.log(profileService.getBabyProfile());
  $scope.babyServices = [];
  $scope.babyActiveServices = {};
  $scope.busEnabled = false;
  $scope.busStops = [];
  $scope.time = {
    value: new Date()
  }

  if ($scope.babyConfiguration.services && $scope.babyConfiguration.services.bus) {
    $scope.busEnabled = $scope.babyConfiguration.services.bus.enabled;
  }
  var temp;
  $scope.listServicesDb=[];
  if ($scope.babyConfiguration.services && $scope.babyConfiguration.services.timeSlotServices) {
    $scope.listServicesDb=$scope.babyConfiguration.services.timeSlotServices;
  }
  $scope.listServicesSchool=profileService.getSchoolProfile().services;
  $scope.listServicesSchool=$filter('orderBy')($scope.listServicesSchool, 'name');
    
  for(var i=0;i<$scope.listServicesDb.length;i++){
    var type=$scope.listServicesDb[i].name;
    var enabled=$scope.listServicesDb[i].enabled;
    var regular=$scope.listServicesDb[i].regular;
    if(!regular){
      $scope.babyActiveServices[type]={'active': enabled};
    }
  }

    $scope.listDelega=$scope.babyProfile.persons;
    var parInd=1;
    for(var i=0;i<$scope.listDelega.length;i++){
      if($scope.listDelega[i].parent){
        $scope.listDelega[i].parentIndex=parInd;
        parInd++;
      }
    }
  
    $scope.listAllergies=$scope.babyProfile.allergies;
    $scope.section=$scope.babyProfile.section;
    $scope.groups=$scope.babyProfile.groups;
    
  //set who get child
  $scope.retireDefault = {
    value: $scope.babyConfiguration.defaultPerson
  };

  $scope.getStringService = function (string) {
    var existsStrPrim=string.indexOf('Prim');
    var existsStrSec=string.indexOf('Sec');
    var existsStrTer=string.indexOf('Ter');
    var text=string;
    if(existsStrPrim!==-1){
      text='1^ ora prolungamento';
    }
    else if(existsStrSec!==-1){
      text='2^ ora prolungamento';
    }
    else if(existsStrTer!==-1){
      text='3^ ora prolungamento';
    }
    return text;
  }

  //if bus set stop
  if($scope.babyProfile.services!==null && $scope.babyProfile.services.bus!==null && $scope.babyProfile.services.bus.stops!==null){
    for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
      $scope.busStops.push({
        id: $scope.babyProfile.services.bus.stops[i].stopId,
        //tmp I have only stopId
        name: $scope.babyProfile.services.bus.stops[i].stopId
      });
    }
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

  $scope.briefInfo=profileService.getInfoInitial();
  var ore_uscita=$scope.briefInfo['toTime'];
  var ore_entrata=$scope.briefInfo['fromTime'];
  $scope.time.value = ore_uscita;
  $scope.entrytime = ore_entrata;

  $scope.getTimeLabel = function () {
    var day = moment($scope.time.value);
    var result = day.format('H:mm');
    return result;
  }

  $scope.getTimeLabelEntry = function () {
    var day = moment($scope.entrytime);
    var result = day.format('H:mm');
    return result;
  }


});
