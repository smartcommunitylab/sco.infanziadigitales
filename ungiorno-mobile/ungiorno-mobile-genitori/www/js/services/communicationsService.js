angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.communicationsService', [])

.factory('communicationsService', function ($http, $q, dataServerService) {
  var communicationsService = {};
  var communicationsDoneLabel = 'COMMUNICATIONS_DONE';
  var LAST_COMMUNICATION_UPDATE = 'LAST_COMMUNICATION_UPDATE';

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
      communicationsDone[communicationId] = !value;
    } else {
      communicationsDone = {};
    }
    localStorage.setItem(communicationsDoneLabel, JSON.stringify(communicationsDone));
  }
  communicationsService.getNewComunications = function (communications, schoolId) {
    //check time since last update and number of those elements I didnt' updated
    if (!localStorage.getItem(LAST_COMMUNICATION_UPDATE)) {
      return 0;
    }
    var last_communication_update = Number(localStorage.getItem(LAST_COMMUNICATION_UPDATE, 0));
    var return_var = 0;
    for (var i = 0; i < communications.length; i++) {
      if (communications[i].creationDate > last_communication_update) {
        return_var++;
      }
    }
    console.log("SCHOOLID"+schoolId+"return var"+return_var);
    return return_var;
  }
  communicationsService.setComunicationsUpdated = function (communications) {
    localStorage.setItem(LAST_COMMUNICATION_UPDATE, communications[communications.length - 1].creationDate);
  }
  return communicationsService;
})
