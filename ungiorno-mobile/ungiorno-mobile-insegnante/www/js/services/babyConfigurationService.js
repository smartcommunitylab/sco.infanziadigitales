angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.babyConfigurationService', [])

.factory('babyConfigurationService', function ($http, $q, dataServerService) {
    var babyConfiguration = null;
    var configurationService = {};


    configurationService.getBabyConfiguration = function () {
        return babyConfiguration;
    }
    configurationService.setBabyConfiguration = function (newBabyConfiguration) {
        babyConfiguration = newBabyConfiguration;
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
