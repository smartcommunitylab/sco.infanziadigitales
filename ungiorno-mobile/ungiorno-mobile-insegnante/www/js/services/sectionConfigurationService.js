angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.sectionConfigurationService', [])

.factory('sectionConfigurationService', function ($http, $q) {
    var babyConfiguration = null;
    var configurationService = {};


    configurationService.get = function () {
        return babyConfiguration;
    }
    configurationService.set = function (newBabyConfiguration) {
        babyConfiguration = newBabyConfiguration;
    }

    return configurationService;
})
