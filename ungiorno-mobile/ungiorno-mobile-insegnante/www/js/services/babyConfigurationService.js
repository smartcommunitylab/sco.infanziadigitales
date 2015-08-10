angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.babyConfigurationService', [])

.factory('babyConfigurationService', function ($http, $q, dataServerService) {
    var babyConfiguration = null;
    var babyNotes = null;
    var configurationService = {};


    //not used anymore by babyProfile!
    configurationService.getBabyConfiguration = function () {
        return babyConfiguration;
    }
    configurationService.setBabyConfiguration = function (newBabyConfiguration) {
        babyConfiguration = newBabyConfiguration;
    }

    configurationService.getBabyNotes = function () {
        return babyNotes;
    }
    configurationService.setBabyNotes = function (newBabyNotes) {
        babyNotes = newBabyNotes;
    }

     configurationService.getBabyNotesById = function (babyId) {
        var deferred = $q.defer();
        /*tmp*/
        dataServerService.getNotes().then(function (data) {
            deferred.resolve(data[0]);
        });
        return deferred.promise;
        /*tmp*/
    }


    configurationService.getBabyConfigurationById = function (babyId) {
        var deferred = $q.defer();
        /*tmp*/
        dataServerService.getBabyConfiguration().then(function (data) {
            deferred.resolve(data[0]);
        });
        return deferred.promise;
        /*tmp*/
    }
    return configurationService;
})
