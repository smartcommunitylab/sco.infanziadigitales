angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.addNote', ['ionic-datepicker'])

.controller('NoteCtrl', function ($scope, $ionicHistory, dataServerService, profileService, Toast, ionicDatePicker, $filter) {
    $scope.note = {
        date: new Date(),
        description: null
    }

    function setDateWidget() {
        $scope.datePickerObject = {
            inputDate: $scope.note.date,
            closeLabel: $filter('translate')('timepicker_close'),
            setLabel: $filter('translate')('ok'),
            todayLabel: $filter('translate')('today'),
            mondayFirst: true,
            templateType: 'popup',
            showTodayButton: true,
            closeOnSelect: false,
            monthsList: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            callback: function (val) {
                datePickerCallback(val);
            }
        };
    }

    function datePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Date not selected');
        } else {
            $scope.datePickerObject.inputDate = val;
            var date = new Date(val);
            $scope.note.date = date;
        }
    }

    $scope.openDatePicker = function () {
        setDateWidget();
        ionicDatePicker.openDatePicker($scope.datePickerObject);
    }

    $scope.getDateLabel = function () {
        var day = moment($scope.note.date);
        var result = day.format('DD/MM/YYYY');
        return result;
    }

    $scope.send = function () {
        var noteToSend = {
            kidId: profileService.getBabyProfile().kidId,
            date: $scope.note.date.getTime(),
            parentNotes: [{
                note: $scope.note.description,
                personId: null,
                type: null
            }],
            schoolNotes: null,
        }
        $scope.note.date = $scope.note.date.getTime();
        if (!$scope.note.description) {
            alert("Attenzione: nota non inserita");
        } else {
            dataServerService.sendNota(profileService.getBabyProfile().schoolId, profileService.getBabyProfile().kidId, noteToSend).then(function (data) {
                Toast.show("Invio Nota Riuscito!!", 'short', 'bottom');
                console.log("SENDING OK -> " + data);
                $ionicHistory.goBack();
            }, function (error) {
                Toast.show("Invio Nota Non Riuscito!!", 'short', 'bottom');
                console.log("SENDING ERROR -> " + error);
            });

        }
    }
})
