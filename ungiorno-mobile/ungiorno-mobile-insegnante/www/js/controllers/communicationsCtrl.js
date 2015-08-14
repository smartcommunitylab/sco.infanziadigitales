angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, $location, $ionicHistory, dataServerService) {

    var selectedCommunicationIndex = -1;
    var selectedNewCommunication = false;
    var deleteCommunication = false;
    var deliveryCheck = false;
    var modifyState = false;
    var editClose = false;
    var selectedComIndex = null;
    $scope.communicationTypes = [
        { typeId : "Generica",
          checked : false},

        { typeId : "Consegna Documenti",
          checked : false}
    ];

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

    $scope.modifyCom = function (){
       modifyState = true;
       selectedComIndex = selectedCommunicationIndex;

    }
    $scope.editState = function () {
    return editClose === true;
    }
    $scope.modifyDescription = function (index) {

        if (selectedComIndex == index && modifyState){
        return true;
        } else {
        return false;}
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
     $scope.newCommunicationMode = function() {
        return selectedNewCommunication === true;
    }
    $scope.addCom = function(){
        selectedNewCommunication = true;

    }
    $scope.deleteCom = function (){
        deleteCommunication = true;
    }

    $scope.checkNewCommunication = function() {
        if (selectedNewCommunication === true && deleteCommunication === false)
        {
        return true;
        } else {
        return false}
    }
     $scope.deleteNewCommunication = function() {
      return deleteCommunication === false;
    }


     $scope.selectType = function (newType) {
            for (var i = 0; i < $scope.communicationTypes.length; i++) {
                if ($scope.communicationTypes[i].typeId === newType.typeId) {
                    $scope.communicationTypes[i].checked = true;
                } else {
                    $scope.communicationTypes[i].checked = false;
                }
            }
        }

    $scope.buttonShow = function (communication) {
        return communication !== null;
    }

    $scope.editCom = function (){
      $scope.communications[selectedComIndex].description = document.getElementById("modifyDescription").value;
      $scope.communications[selectedComIndex].dateToCheck = document.getElementById("modifyDateToCheck").value;
      editClose = true;
    }


      /*function sendCom() {
        for (var i = 0; i < $scope.retirePersons.length; i++) {
            if ($scope.communicationType[i].checked == true) {
                return $scope.communicationType[i].typeId;
            }
            var noteTypeID = document.getElementById("deadlineDate").value;
            var noteTypeID = document.getElementById("note_type").value
        }
        return null;

    }*/
    //    creare un oggetto che memorizza la lista di comunicazioni a livello di scope
    //    chiamare la funzione che scarica le comunicazioni dal server e associarle alla lista creata
    //    creare una funzione che gestisca la memorizzazione della comunicazione selezionata
    //    (memorizzo tutta la comunicazione? o solo l'indice dell'array?)
});
