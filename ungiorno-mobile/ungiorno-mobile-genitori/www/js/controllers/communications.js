angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.communications', [])

.controller('CommunicationsCtrl', function ($scope, $rootScope, communicationsService, profileService, $filter, Toast, $ionicLoading, pushNotificationService) {
  $scope.babyProfile = profileService.getBabyProfile();
   $scope.communications_title = $filter('translate')('communications_title')+ $scope.babyProfile.firstName
  $scope.getCommunications = function (schoolId, kidId) {
    $ionicLoading.show();
    communicationsService.getCommunications(schoolId, kidId).then(function (data) {
        $rootScope.communications = data;
        for (var i = 0; i < $rootScope.communications.length; i++) {
          if ($rootScope.communications[i].doCheck) {
            //check if present and set done and set action
            if (communicationsService.getCommunictionDone($rootScope.communications[i]._id)) {
              $rootScope.communications[i].done = true;
              $rootScope.communications[i].action = $filter('translate')('communication_done');
            } else {
              $rootScope.communications[i].done = false;
              $rootScope.communications[i].action = $filter('translate')('communication_undone');
            }
          }
        }
        $ionicLoading.hide();
        communicationsService.setComunicationsUpdated(data);
      },
      function (error) {
        console.log("ERROR -> " + error);
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        $ionicLoading.hide();
      });
  }
  $scope.setCommunication = function (i, comunication) {
    comunication.done = !comunication.done;
    communicationsService.setCommunictionDone(i, !comunication.done);
    comunication.action = (comunication.done ? $filter('translate')('communication_done') : $filter('translate')('communication_undone'));
  };
  $scope.getCommunications(profileService.getSchoolProfile().schoolId, profileService.getBabyProfile().kidId);
  pushNotificationService.resetNewComunications();
});
