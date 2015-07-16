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

    $scope.setIllness = function(item) {
        $scope.illness.reason.type = item? item.type: 'other';
        $scope.closeModal();
    }

    $scope.send = function() {
        // TODO
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
        $scope.modal.hide();
    };
});
