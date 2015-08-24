angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, dataServerService, $ionicPopup, communicationService, profileService, Toast, $filter) {

    var selectedCommunicationIndex = -1;
    var selectedNewCommunication = false;
    var deleteCommunication = false;
    var deliveryCheck = false;
    var modifyState = false;
    var editClose = true;
    var selectedComIndex = null;
    var selectedComIndexCopy = null;
    var editShowButton = true;

    var MODE_NORMAL_LIST = "normal";
    var MODE_EDIT = "edit";
    var MODE_NEW = "new";

    var currentMode = MODE_NORMAL_LIST;

    $scope.communicationTypes = [
        {
            typeId: "0",
            name: "Generica",
            checked: true
        },
        {
            typeId: "1",
            name: "Consegna Documenti",
            checked: false
        }
    ];


    dataServerService.getCommunications(profileService.getSchoolProfile().schoolId).then(function (data) {
        $scope.communications = data;
        for (var i = 0; i < $scope.communications.length; i++) {
            $scope.communications[i].dateToCheck = new Date($scope.communications[i].dateToCheck * 1000);
            $scope.communications[i].creationDate = new Date($scope.communications[i].creationDate * 1000);
        }
    });

    $scope.selectCommunication = function (index) {

        if ($scope.isMode(MODE_NORMAL_LIST)) {
            if (selectedCommunicationIndex === index) {
                selectedCommunicationIndex = -1;
            } else {
                selectedCommunicationIndex = index;
            }
        }
    }

    $scope.isMode = function (mode) {
        return currentMode === mode;
    }

    $scope.editCommunicationMode = function () {
        currentMode = MODE_EDIT;

        var tmp = $scope.communications[selectedCommunicationIndex];

        $scope.editedCommunication = JSON.parse(JSON.stringify(tmp));
        $scope.editedCommunication.dateToCheck = new Date(tmp.dateToCheck);
        $scope.editedCommunication.creationDate = new Date(tmp.creationDate);
    }

    $scope.isCommunicationSelected = function (index) {
        return selectedCommunicationIndex === index;
    }

    $scope.someCommunicationSelected = function () {
        return selectedCommunicationIndex !== -1;
    }

    $scope.controlDateToCheck = function (index) {
        return $scope.communications[index].doCheck;
    }

    $scope.createCommunicationMode = function () {
        $scope.newCommunication = {
            dateToCheck: new Date(),
            creationDate: new Date(),
            description: "",
            doCheck: false,
            children: []
        };
        currentMode = MODE_NEW;
    }
    $scope.discardCommunication = function () {
        currentMode = MODE_NORMAL_LIST;
    }

    $scope.selectType = function (newType) {
        for (var i = 0; i < $scope.communicationTypes.length; i++) {
            $scope.communicationTypes[i].checked = ($scope.communicationTypes[i].typeId === newType.typeId);
        }
    }

    $scope.deleteCommunication = function () {
        //TODO: how on the server?
        $scope.communications.splice(selectedCommunicationIndex, 1);
        selectedCommunicationIndex = -1;
    }

    $scope.submitCommunication = function () { //edit or new

        var requestFail = function () {
            var myPopup = $ionicPopup.show({
                title: $filter('translate')('communication_fail'),
                scope: $scope,
                buttons: [
                    { text: $filter('translate')('cancel') },
                    {
                        text: '<b>' + $filter('translate')('retry') + '</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.submitCommunication();
                        }
                    }
                ]
            });
        }

        var requestSuccess = function () {
            Toast.show($filter('translate')('communication_sent'), 'bottom', 'short');
            //TODO: update communications list.
            currentMode = MODE_NORMAL_LIST;
        }

        if ($scope.isMode(MODE_EDIT)) {
            Toast.show("TODO! :(", 'bottom', 'short');
            //TODO: how???
        } else if ($scope.isMode(MODE_NEW)) {
            communicationService.addCommunication(profileService.getSchoolProfile().schoolId, $scope.newCommunication).then(function (data) {
                var data = data;
                requestSuccess();
            }, function (data) {
                requestFail();
            });
        }

    }

    $scope.homeRedirect = function (index) {
        selectedCommunicationIndex = -1;
        communicationService.setCommunication($scope.communications[index].communicationId);
        window.location.assign('#/app/home');
    }
});
