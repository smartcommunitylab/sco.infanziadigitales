angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.configurationService', [])

.factory('configurationService', function ($http, $q) {
    var babyConfiguration = null;
    var configurationService = {};


    configurationService.getBabyConfiguration = function () {
        return babyConfiguration;
    }
    configurationService.setBabyConfiguration = function (newBabyConfiguration) {
        babyConfiguration = newBabyConfiguration[0];
    }


    return configurationService;
})
