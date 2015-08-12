angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, $location, $ionicHistory, dataServerService) {

    var selectedCommunicationIndex = -1;


     dataServerService.getCommunications().then(function(data){
        $scope.communications = data;
     });

    $scope.selectCommunication = function(index){

        if (selectedCommunicationIndex === index) {
            selectedCommunicationIndex=-1;
        }
        else {
            selectedCommunicationIndex = index;
        }

    }

    $scope.isCommunicationSelected = function(index){
        return selectedCommunicationIndex === index;
    }

    $scope.controlDateToCheck = function(index){
        return $scope.communications[index].dateToCheck !== null;
    }

    $scope.isCommunicationSelectedMode = function() {
        return selectedCommunicationIndex !== -1;
    }

    //    creare un oggetto che memorizza la lista di comunicazioni a livello di scope
    //    chiamare la funzione che scarica le comunicazioni dal server e associarle alla lista creata
    //    creare una funzione che gestisca la memorizzazione della comunicazione selezionata
    //    (memorizzo tutta la comunicazione? o solo l'indice dell'array?)
});
