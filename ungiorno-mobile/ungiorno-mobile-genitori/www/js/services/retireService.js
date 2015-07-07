angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.retireService', [])

.factory('retireService', function () {
	var retire;
    var retireService = {};


    retireService.setRetire = function (input) {
        retire = input;
    }

    retireService.getRetire = function () {
        return retire;
    }

    return retireService;
})
