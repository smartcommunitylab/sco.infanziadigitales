angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.babyConfigurationService', [])

.factory('babyConfigurationService', function ($http, $q) {
    var babyConfiguration = null;
    var configurationService = {};


    configurationService.getBabyConfiguration = function () {
        return babyConfiguration;
    }
    configurationService.setBabyConfiguration = function (newBabyConfiguration) {
        babyConfiguration = newBabyConfiguration;
    }


    return configurationService;
})
