angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.assenza',  [])

.controller('AssenzaCtrl', function ($scope, profileService, $ionicModal) {
    $scope.isMalattia = false;
    $scope.isAltro = false;
    $scope.profile = profileService.getSchoolProfile();
//    $scope.dataPack = {
//        "appId": $scope.BabyProfile.appId,
//        "schoolId": $scope.BabyProfile.schoolId,
//        "kidId": $scope.BabyProfile.kidId,
//        "periodoDa": $scope.BabyProfile.periodoDa,
//        "periodoA": $scope.BabyProfile.periodoA,
//        "motivazione": $scope.BabyProfile.motivazione
//    }

    $scope.temporary = {
        date: new Date()
    };

    $scope.showSelect = function(intInput)
    {
        if(intInput === 11)
        {
            $scope.isMalattia = true;
            $scope.isAltro = false;
        }
        else if(intInput === 10)
        {
            $scope.isMalattia = false;
            $scope.isAltro = true;
        }
        else
        {
            $scope.isMalattia = false;
            $scope.isAltro = false;
        }
    }

    $scope.SetIllness = function() {

    }

    $ionicModal.fromTemplateUrl('templates/contacts.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal
    })

    $scope.openModal = function() {
        $scope.modal.show()
    }

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

});
