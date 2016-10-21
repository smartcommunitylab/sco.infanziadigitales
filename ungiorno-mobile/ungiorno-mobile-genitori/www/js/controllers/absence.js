angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.absence', ['ionic-datepicker'])

.controller('AbsenceCtrl', function ($scope, $rootScope, profileService, $ionicModal, dataServerService, $filter, $ionicHistory, $ionicPopup, Toast, ionicDatePicker) {
    $scope.schoolProfile = profileService.getSchoolProfile();
    $scope.babyProfile = profileService.getBabyProfile();
    $scope.selectedIllness = "Selezionare malattia frequente";
    $scope.absenceTypes = [];
    $scope.note = "";
    $scope.isRetireSet = false;
    $scope.modifyBeforeHours = $rootScope.absenceLimitHours;
    $scope.modifyBeforeMinutes = $rootScope.absenceLimitMinutes;

    function setDateFromWidget() {
        $scope.datePickerFromObject = {
            inputDate: $scope.illness.dateFrom,
            closeLabel: $filter('translate')('timepicker_close'),
            setLabel: $filter('translate')('ok'),
            todayLabel: $filter('translate')('today'),
            mondayFirst: true,
            templateType: 'popup',
            showTodayButton: true,
            closeOnSelect: false,
            monthsList: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            callback: function (val) {
                datePickerFromCallback(val);
            }
        };
    };

    function setDateToWidget() {
        $scope.datePickerToObject = {
            inputDate: $scope.illness.dateTo,
            closeLabel: $filter('translate')('timepicker_close'),
            setLabel: $filter('translate')('ok'),
            todayLabel: $filter('translate')('today'),
            mondayFirst: true,
            templateType: 'popup',
            showTodayButton: true,
            closeOnSelect: false,
            monthsList: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            callback: function (val) {
                datePickerToCallback(val);
            }
        };
    };

    function datePickerFromCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Date not selected');
        } else {
            $scope.datePickerFromObject.inputDate = val;
            var date = new Date(val);
            $scope.illness.dateFrom = date;
        }
    };

    function datePickerToCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Date not selected');
        } else {
            $scope.datePickerToObject.inputDate = val;
            var date = new Date(val);
            $scope.illness.dateTo = date;
        }
    };

    for (var i = 0; i < $scope.schoolProfile.absenceTypes.length; i++) {
        $scope.absenceTypes.push({
            typeId: $scope.schoolProfile.absenceTypes[i].typeId,
            name: $scope.schoolProfile.absenceTypes[i].type,
            checked: false

        });

    }
    $scope.absenceTypes.push({
        typeId: "Altro",
        name: $filter('translate')('absence_other'),
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

    $scope.data = {
        typeId: $scope.schoolProfile.absenceTypes[0].typeId
    };
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

    $scope.initDay = function (date) {
        var result = new Date(date.getTime());
        result.setHours(0, 0, 0, 0);
        return result;
    };

    $scope.endDay = function (date) {
        var result = new Date(date.getTime());
        result.setHours(23, 59, 59, 0);
        return result;
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
            //alert($filter('translate')('absence_date_wrong'));
            var myPopup = $ionicPopup.show({
                title: $filter('translate')('retire_popup_absent_title'),
                template: $filter('translate')('absence_date_wrong'),
                buttons: [
                    {
                        text: $filter('translate')('retire_popup_absent_cancel'),
                        type: 'button-positive'
						}
					]
            });
            return;
        }
        //        if (!getReason()) {
        //            // alert($filter('translate')('absence_choose'));
        //            var myPopup = $ionicPopup.show({
        //                title: $filter('translate')('retire_popup_absent_title'),
        //                template: $filter('translate')('absence_choose'),
        //                buttons: [
        //                    {
        //                        text: $filter('translate')('retire_popup_absent_cancel'),
        //                        type: 'button-positive'
        //						}
        //					]
        //            });
        //            return;
        //        }
        //da settare i valori esatti
        var illness = {
            kidId: $scope.babyProfile.kidId,
            note: '',
            dateFrom: $scope.initDay($scope.illness.dateFrom).getTime(),
            dateTo: $scope.endDay($scope.illness.dateTo).getTime(),
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

    $scope.$watch('illness.dateFrom', function () {
        $scope.checkRetire();
    });

    $scope.$watch('illness.dateTo', function () {
        $scope.checkRetire();
    });

    $scope.checkRetire = function () {
        dataServerService.getReturnsOrStops($scope.babyProfile.schoolId, $scope.babyProfile.kidId, $scope.illness.dateFrom.getTime(),
            $scope.illness.dateTo.getTime()).then(function (data) {
            if ((data != null) && (data.length > 0)) {
                $scope.isRetireSet = true;
            } else {
                $scope.isRetireSet = false;
            }
        });
    };

    $scope.getDateLabel = function (date) {
        var day = moment(date);
        var result = day.format('DD/MM/YYYY');
        return result;
    };

    $scope.openDatePickerFrom = function () {
        setDateFromWidget();
        ionicDatePicker.openDatePicker($scope.datePickerFromObject);
    };

    $scope.openDatePickerTo = function () {
        setDateToWidget();
        ionicDatePicker.openDatePicker($scope.datePickerToObject);
    };

    $scope.resetTime = function (date) {
        var result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    };

    $scope.showConfirm = function () {
        //        if (!getReason()) {
        //            // alert($filter('translate')('retire_popup_absent_title'));
        //            var myPopup = $ionicPopup.show({
        //                title: $filter('translate')('retire_popup_absent_title'),
        //                template: $filter('translate')('absence_choose'),
        //                buttons: [
        //                    {
        //                        text: $filter('translate')('retire_popup_absent_cancel'),
        //                        type: 'button-positive'
        //						}
        //					]
        //            });
        //            return;
        //        }
        var go = true;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayMax = new Date();
        todayMax.setHours($scope.modifyBeforeHours, $scope.modifyBeforeMinutes, 0, 0);
        var dateFrom = $scope.resetTime($scope.illness.dateFrom);
        var dateTo = $scope.resetTime($scope.illness.dateTo);
        if ((dateFrom <= today) && (today <= dateTo)) {
            var now = new Date();
            if (now > todayMax) {
                go = false;
                var myPopup = $ionicPopup.show({
                    title: $filter('translate')('assenza_popup_toolate_title'),
                    template: $filter('translate')('assenza_popup_toolate_text') + " " + $scope.modifyBeforeHours + "." + $scope.modifyBeforeMinutes + ".",
                    buttons: [
                        {
                            text: $filter('translate')('assenza_popup_retire_cancel'),
                            type: 'button-positive'
							}
						]
                });
            }
        }
        if (go) {
            if ($scope.isRetireSet) {
                var myPopup = $ionicPopup.show({
                    title: $filter('translate')('assenza_popup_retire_title'),
                    template: $filter('translate')('assenza_popup_retire_text'),
                    buttons: [
                        {
                            text: $filter('translate')('assenza_popup_retire_cancel'),
                            type: 'button-positive'
							},
                        {
                            text: $filter('translate')('assenza_popup_retire_ok'),
                            type: 'button-positive',
                            onTap: function (e) {
                                $scope.send();
                            }
							}
						]
                });
            } else {
                $scope.send();
            }
        }
    };
});
