angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, $location, $ionicHistory, dataServerService, $ionicPopup, $timeout) {

    var selectedCommunicationIndex = -1;
    var selectedNewCommunication = false;
    var deleteCommunication = false;
    var deliveryCheck = false;
    var modifyState = false;
    var editClose = false;
    var selectedComIndex = null;
    var selectedComIndexCopy = null;
    var editShowButton = true;
    $scope.docCheck = false;
    $scope.communicationTypes = [
        { typeId : "Generica",
          checked : false},

        { typeId : "Consegna Documenti",
          checked : false}
    ];
    $scope.newCommunication = {
            appId : "a",
            schoolId : "a",
            dateToCheck : 0,
            creationDate : 0,
            description : "",
            doCheck : false,
            children : []
     },

        dataServerService.getCommunications().then(function(data){
        $scope.communications = data;
            for (var i = 0; i < $scope.communications.length; i++){
                $scope.communications[i].dateToCheck *= 1000;
            }
     });

    $scope.selectCommunication = function(index){
        if (!modifyState && !selectedNewCommunication) {

            if (selectedCommunicationIndex === index) {
                selectedCommunicationIndex=-1;
            }
            else {
                selectedCommunicationIndex = index;
            }
        }

    }

    $scope.modifyCom = function (){
       modifyState = true;
       selectedComIndex = selectedCommunicationIndex;

    }
    $scope.showEditButton = function () {
        return modifyState;
    }

    $scope.modifyDescription = function (index) {

        if (selectedComIndex == index && modifyState){
            editShowButton = false;
            return true;
        } else {
        return false;}
    }
    $scope.isCommunicationSelected = function(index){
        return selectedCommunicationIndex === index;
    }

    $scope.controlDateToCheck = function(index){
        return $scope.communications[index].doCheck ;
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
    $scope.cancCom = function (){
        selectedNewCommunication = false;
    }

    $scope.checkNewCommunication = function() {
        if (selectedNewCommunication === true && deleteCommunication === false)
        {
        return true;
        } else {
        return false;}
    }
     $scope.deleteNewCommunication = function() {
      return deleteCommunication ;
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
        if (!modifyState){
        return communication !== null;
        }
    }

    $scope.editCom = function (){

      $scope.communications[selectedComIndex].dateToCheck /= 1000;
      modifyState = false;
      selectedCommunicationIndex = -1;
      editShowButton = true;
    }

    $scope.editShowButton = function () {
        return editShowButton;
    }

    $scope.deleteCommunication = function() {
        $scope.communications.splice(selectedCommunicationIndex, 1);
         selectedCommunicationIndex = -1;
     }

    $scope.sendCom = function() {
            $scope.newCommunication.dateToCheck = document.getElementById("deadlineDate").value;
            $scope.newCommunication.description = document.getElementById("description").value;
            $scope.newCommunication.creationDate = new Date();
            $scope.newCommunication.doCheck = $scope.docCheck;
            $ionicPopup.alert({
                 template: 'Comunicazione inviata'
               });
        }
    $scope.check = function (){
        if ($scope.docCheck === true){
              $scope.docCheck = false;
            } else {
              $scope.docCheck = true;
            }
    }

    //    creare un oggetto che memorizza la lista di comunicazioni a livello di scope
    //    chiamare la funzione che scarica le comunicazioni dal server e associarle alla lista creata
    //    creare una funzione che gestisca la memorizzazione della comunicazione selezionata
    //    (memorizzo tutta la comunicazione? o solo l'indice dell'array?)
    //  <input type="date" id="modifyDateToCheck" value="{{communication.dateToCheck}}">

});
