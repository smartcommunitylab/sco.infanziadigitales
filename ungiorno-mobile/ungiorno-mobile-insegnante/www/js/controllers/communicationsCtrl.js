angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, dataServerService, $ionicPopup, communicationService, profileService, Toast, $filter) {

    var selectedCommunicationIndex = -1;

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

    var sortCommunications = function () {
        $scope.communications = $filter('orderBy')($scope.communications, '+creationDate');
    }


    dataServerService.getCommunications(profileService.getSchoolProfile().schoolId).then(function (data) {
        $scope.communications = data;
        for (var i = 0; i < $scope.communications.length; i++) {
            $scope.communications[i].dateToCheck = new Date($scope.communications[i].dateToCheck);
            $scope.communications[i].creationDate = new Date($scope.communications[i].creationDate);
        }
        sortCommunications();
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

        var communicationFail = function () {
            var communicationFailPopup = $ionicPopup.show({
                title: $filter('translate')('communication_delete_fail'),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('cancel')
                    },
                    {
                        text: '<b>' + $filter('translate')('retry') + '</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            deleteFromServer();
                        }
                    }
                ]
            });
        }
        var deleteFromServer = function () {
            dataServerService.deleteCommunication(profileService.getSchoolProfile().schoolId, $scope.communications[selectedCommunicationIndex].communicationId).then(function (data) {
                $scope.communications.splice(selectedCommunicationIndex, 1);
                selectedCommunicationIndex = -1;
            }, function (data) {
                communicationFail();
            });
        }


        var deleteConfirm = function () {
            var deleteConfirmPopup = $ionicPopup.show({
                title: $filter('translate')('communication_delete_confirm'),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('cancel')
                    },
                    {
                        text: '<b>' + $filter('translate')('ok') + '</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            deleteFromServer();
                        }
                    }
                ]
            });
        }

        deleteConfirm();

    }

    var updateCurrentCommunicationList = function (response) {
        var found = false;
        var i = 0;

        while (i < $scope.communications.length && !found) {
            if (response.data.communicationId === $scope.communications[i].communicationId) {
                $scope.communications[i] = response.data;
                found = true;
            }
            i++;
        }
        if (!found) { //new communication
            $scope.communications.push(response.data);
        }
        sortCommunications();
    }

    $scope.submitCommunication = function () { //edit or new

        var requestFail = function () {
            var myPopup = $ionicPopup.show({
                title: $filter('translate')('communication_fail'),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('cancel')
                    },
                    {
                        text: '<b>' + $filter('translate')('retry') + '</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            $scope.submitCommunication();
                        }
                    }
                ]
            });
        }

        var requestSuccess = function (data) {
            if ($scope.isMode(MODE_EDIT)) {
                Toast.show($filter('translate')('communication_updated'), 'bottom', 'short');
            } else {
                Toast.show($filter('translate')('communication_sent'), 'bottom', 'short');
            }
            updateCurrentCommunicationList(data);

            currentMode = MODE_NORMAL_LIST;
        }

        if ($scope.isMode(MODE_EDIT) || $scope.isMode(MODE_NEW)) {
            if ($scope.isMode(MODE_EDIT)) {
                var tmp = JSON.parse(JSON.stringify($scope.editedCommunication));
            } else {
                var tmp = JSON.parse(JSON.stringify($scope.newCommunication));
            }
            tmp.creationDate = new Date(tmp.creationDate).getTime();
            tmp.dateToCheck = new Date(tmp.dateToCheck).getTime();
            communicationService.addCommunication(profileService.getSchoolProfile().schoolId, tmp).then(function (data) {
                requestSuccess(data);
            }, function (data) {
                requestFail();
            });
        }

    }



    $scope.homeRedirect = function (index) {
        selectedCommunicationIndex = -1;
        communicationService.setCommunication($scope.communications[index].communicationId);
        communicationService.setToCheck(true);
        window.location.assign('#/app/home');
    }
});
