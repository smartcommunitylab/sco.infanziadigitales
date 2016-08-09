angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.communications', [])

.controller('CommunicationsCtrl', function ($scope, $rootScope, communicationsService, profileService, $filter, $ionicLoading) {
    $scope.getCommunications = function (schoolId, kidId) {
        $ionicLoading.show();
        communicationsService.getCommunications(schoolId, kidId).then(function (data) {
                $scope.communications = data;
                for (var i = 0; i < $scope.communications.length; i++) {
                    if ($scope.communications[i].doCheck) {
                        //check if present and set done and set action
                        if (communicationsService.getCommunictionDone($scope.communications[i]._id)) {
                            $scope.communications[i].done = true;
                            $scope.communications[i].action = $filter('translate')('communication_done');
                        } else {
                            $scope.communications[i].done = false;
                            $scope.communications[i].action = $filter('translate')('communication_undone');
                        }
                    }
                }
                $ionicLoading.hide();
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

});
