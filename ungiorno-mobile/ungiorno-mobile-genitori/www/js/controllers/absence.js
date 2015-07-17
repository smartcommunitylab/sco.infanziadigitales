angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.absence',  [])

.controller('AbsenceCtrl', function ($scope, profileService, $ionicModal) {
    $scope.babyProfile = profileService.getSchoolProfile();
    $scope.selectedIllness = "illness";
    $scope.illness = {
        appId: $scope.babyProfile.appId,
        schooldId: $scope.babyProfile.schoolId,
        kidId: $scope.babyProfile.kidId,
        dateFrom: new Date(),
        dateTo: new Date(),
        reason: {
            type: '',
            subtype: ''
        },
        note: ''
    };

    var delay = 1000; //1 sec
    $scope.isOther = false;

    $scope.setIllness = function(boolInput, item) {
        $scope.illness.reason.type = item? item.type: 'other';
        if(boolInput)
        {
            $scope.isOther = true;
        }
        $scope.closeModal();
    }

    // Modal select specific illness
    $ionicModal.fromTemplateUrl('templates/absenceModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal
    })

    $scope.openModal = function() {
        $scope.modal.show()
    }

    $scope.closeModal = function() {
        setTimeout(function(){
            $scope.modal.hide();
        }, delay);
    };

    $scope.send = function() {
        if(dateFrom > dateTo)
        {
            alert("La data d'inizio dell'assenza succede quella della fine. Modificare le date.");
            return;
        }
    }
});
