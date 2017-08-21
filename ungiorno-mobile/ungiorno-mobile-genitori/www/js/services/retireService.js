angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.retireService', [])

.factory('retireService', function () {
    var retire;
    var dailyRetire = false;
    var retireService = {};


    retireService.setRetire = function (input) {
        retire = input;
    }

    retireService.getRetire = function () {
        return retire;
    }

    retireService.setDailyRetire = function (input) {
        dailyRetire = input;
    }

    retireService.getDailyRetire = function () {
        return dailyRetire;
    }


    return retireService;
})
