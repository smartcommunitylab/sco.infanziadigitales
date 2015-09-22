angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.absence', [])

.controller('AbsenceCtrl', function ($scope, profileService, $ionicModal, dataServerService, $filter, $ionicHistory, Toast) {
    $scope.schoolProfile = profileService.getSchoolProfile();
    $scope.babyProfile = profileService.getBabyProfile();
    $scope.selectedIllness = "Selezionare malattia frequente";
    $scope.absenceTypes = [];
    $scope.note = "";
    for (var i = 0; i < $scope.schoolProfile.absenceTypes.length; i++) {
        $scope.absenceTypes.push({
            typeId: $scope.schoolProfile.absenceTypes[i].typeId,
            name: $scope.schoolProfile.absenceTypes[i].type,
            checked: false

        });

    }
    $scope.absenceTypes.push({
        typeId: "Other",
        name: "Other",
        checked: false

    });
    $scope.illness = {
        appId: $scope.schoolProfile.appId,
        schooldId: $scope.schoolProfile.schoolId,
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


    $scope.selectAbsence = function (newabsence) {
        for (var i = 0; i < $scope.absenceTypes.length; i++) {
            if ($scope.absenceTypes[i].typeId == newabsence.typeId) {
                $scope.absenceTypes[i].checked = true;
            } else {
                $scope.absenceTypes[i].checked = false;
            }
        }
        if (newabsence.typeId == "Other") {
            $scope.isOther = true;
        } else {
            $scope.isOther = false;
        }
    }
    $scope.setIllness = function (boolInput, item) {
        $scope.illness.reason.type = item ? item.type : 'other';
        if (boolInput) {
            $scope.isOther = true;
        }
        $scope.closeModal();
    }

    // Modal select specific illness
    $ionicModal.fromTemplateUrl('templates/absenceModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })

    $scope.openModal = function () {
        $scope.modal.show()
    }

    $scope.closeModal = function () {
        setTimeout(function () {
            $scope.modal.hide();
        }, delay);
    };

    //    $scope.send = function () {
    //        if (dateFrom > dateTo) {
    //            alert("La data d'inizio dell'assenza succede quella della fine. Modificare le date.");
    //            return;
    //        }
    //    }
    var getReason = function () {
        for (var i = 0; i < $scope.absenceTypes.length; i++) {
            if ($scope.absenceTypes[i].checked == true) {
                if ($scope.absenceTypes[i].typeId != "Other") {
                    return {
                        type: $scope.absenceTypes[i].typeId,
                        subtype: ''
                    };
                } else {
                    return {
                        type: "Other",
                        subtype: $scope.note
                    };
                }
            }
        }
        return null;
    }
    $scope.send = function () {
        if ($scope.illness.dateFrom > $scope.illness.dateTo) {
            alert($filter('translate')('absence_date_wrong'));
            return;
        }
        if (!getReason()) {
            alert($filter('translate')('absence_choose'));
            return;
        }
        //da settare i valori esatti
        var illness = {
            kidId: $scope.babyProfile.kidId,
            note: '',
            dateFrom: $scope.illness.dateFrom.getTime(),
            dateTo: $scope.illness.dateTo.getTime(),
            reason: getReason()
        };
        dataServerService.sendAssenza($scope.babyProfile.schoolId, $scope.babyProfile.kidId, illness).then(function (data) {
            Toast.show($filter('translate')('assenza_sendok'), 'short', 'bottom');
            //retireService.setDailyRetire(true);
            console.log("SENDING OK -> " + data);
            $ionicHistory.goBack();
        }, function (error) {
            Toast.show($filter('translate')('assenza_sendno'), 'short', 'bottom');
            console.log("SENDING ERROR -> " + error);
        });
    }
});
