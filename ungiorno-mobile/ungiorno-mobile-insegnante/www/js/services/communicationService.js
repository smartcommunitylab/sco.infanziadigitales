angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.communicationService', [])

.factory('communicationService', function ($http, $q, dataServerService) {
    var communications = null;
    var selectedCommunication = null;
    var communicationService = {};
    var toCheck = false;


    communicationService.getCommunicationsFromServer = function (schoolId) {
        //get the new communication
        var deferred = $q.defer();

        dataServerService.getCommunications(schoolId).then(function (data) {
            communications = data;
            deferred.resolve(data);
        }, function (data) {
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
        });
        return deferred.promise;

    }

    communicationService.addCommunication = function (schoolId, communication) {
        //get the new communication
        var deferred = $q.defer();

        dataServerService.addCommunication(schoolId, communication).then(function (data) {
            //add to the top
            communications.unshift(data);
            deferred.resolve(data);
        }, function (data) {
            deferred.reject(data.errorCode + ' ' + data.errorMessage);
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
    communicationService.modifyCommunication = function (communication) {
        //get the new communication by id
        for (var i = 0; i < communications.length; i++) {
            if (communications[i].communicationId == communication.communicationId) {
                communications[i] = communication;
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
    communicationService.setToCheck = function (value) {
        toCheck = value;
    }

    communicationService.getToCheck = function () {
        return toCheck;
    }
    return communicationService;
})
