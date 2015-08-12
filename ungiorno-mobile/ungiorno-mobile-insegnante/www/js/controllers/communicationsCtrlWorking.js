angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, $location, dataServerService, $ionicHistory, $state) {

    $scope.communications = null;
    $scope.selected = false;
    $scope.indexSelected = null;
    $scope.addNewCommunicationState = false;
    $scope.modifyCommunicationState = false;

    $scope.selectCommunication = function (index) {
        if ($scope.indexSelected != index) {
            $scope.indexSelected = index;
            $scope.selected = true;
        } else {
            $scope.selected = false;
            $scope.indexSelected = null;
        }
    }
    $scope.isThisCommunication = function (index) {
        if ($scope.indexSelected == index)
            return true;
        return false;
    }

    dataServerService.getCommunications().then(function (data) {
        $scope.communications = data;
    });

    $scope.addCommunication = function () {
        //show first part of the page with ne communication
        if (!$scope.addNewCommunicationState) {
            $scope.addNewCommunicationState = true;
        } else {
            $scope.addNewCommunicationState = false;
        }
    }

    $scope.deleteCommunication = function () {
        //delete selected comunication from array and from server

    }
    $scope.modifyCommunication = function () {
        //show the part of the item with preloaded element
        if (!$scope.modifyCommunicationState) {
            $scope.modifyCommunicationState = true;
        } else {
            $scope.modifyCommunicationState = false;
        }

    }
    $scope.modifyThisCommunication = function (index) {
        if ($scope.modifyCommunicationState && $scope.indexSelected == index) {
            return true;
        }
        return false;
    }
    $scope.confirmNewCommunication = function () {
        //get new communication and send it to server
    }
    $scope.cancelNewCommunication = function () {
        //clean all entries and close new communication
        $scope.addNewCommunicationState = false;
    }
});
