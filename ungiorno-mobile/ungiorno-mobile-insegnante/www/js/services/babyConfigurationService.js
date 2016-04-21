angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.babyConfigurationService', [])

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

    configurationService.getBabyNotesById = function (schoolId, babyId) {
        var deferred = $q.defer();
        /*tmp*/
        dataServerService.getKidsNotesByKidId(schoolId, babyId).then(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
        /*tmp*/
    }


    configurationService.getBabyConfigurationById = function (schoolId, babyId) {
        var deferred = $q.defer();
        dataServerService.getBabyConfiguration(schoolId, babyId).then(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }
    return configurationService;
})
