angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.addNote', [])

.controller('NoteCtrl', function ($scope, $ionicHistory, dataServerService, profileService, Toast) {
    $scope.note = {
        date: new Date(),
        description: null
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
