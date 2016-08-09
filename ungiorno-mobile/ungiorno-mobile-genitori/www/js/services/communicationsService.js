angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.communicationsService', [])

.factory('communicationsService', function ($http, $q, dataServerService) {
    var communicationsService = {};
    var communicationsDoneLabel = 'COMMUNICATIONS_DONE';
    communicationsService.getCommunications = function (schoolId, kidId) {
        var deferred = $q.defer();
        dataServerService.getCommunications(schoolId, kidId).then(function (data) {
            deferred.resolve(data);
        }, function (error) {
            deferred.reject();
        });
        return deferred.promise;
    }
    communicationsService.getCommunictionDone = function (communicationId) {
        var communicationsDone = JSON.parse(localStorage.getItem(communicationsDoneLabel));
        if (communicationId && communicationsDone && communicationsDone[communicationId]) {
            return true;
        }
        return false;
    }
    communicationsService.setCommunictionDone = function (communicationId, value) {
        var communicationsDone = JSON.parse(localStorage.getItem(communicationsDoneLabel));
        if (communicationsDone) {
            communicationsDone[communicationId] = value;
        } else {
            communicationsDone = {};
        }
        localStorage.setItem(communicationsDoneLabel, JSON.stringify(communicationsDone));
    }
    return communicationsService;
})
