angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.busService', [])

.factory('busService', function ($http, $q) {
    var busService = {};

    busService.getDailyBusStop = function (input) {
        getDailyBusStop = input;
    }

    return busService;
})
