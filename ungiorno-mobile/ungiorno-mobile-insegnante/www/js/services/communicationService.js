angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.communicationService', [])

.factory('communicationService', function ($http, $q, dataServerService) {
    var communications = null;
    var selectedCommunication = null;
    var communicationService = {};



    communicationService.getCommunicationsFromServer = function () {
        //get the new communication
        var deferred = $q.defer();

        dataServerService.getCommunications().then(function (data) {
            communications = data;
            deferred.resolve(data);
        });
        return deferred.promise;

    }
    communicationService.setCommunication = function (communicationId) {
        //get the new communication by id
        for (var i = 0; i < communications.length; i++) {
            if (communications[i].communicationId == communicationId) {
                selectedCommunication = communications[i];
            }
        }
        //selectedCommunication = communication;
    }
    communicationService.getCommunication = function () {
        return selectedCommunication;
    }
    communicationService.childSelectedCommunication = function (childId) {
        if (selectedCommunication != null) {
            for (var i = 0; i < selectedCommunication.children.length; i++) {
                if (selectedCommunication.children[i] == childId) {
                    return true;
                }
                return false;
            }
            return false;
        }

    }
    return communicationService;
})
