angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.canteenService', [])

.factory('canteenService', function ($http, $q) {
    var canteenService = {};
    var meals = null;

    canteenService.getMeals = function() {
    	return meals;
    };

    canteenService.setMeals = function(item) {
    	meals = item;
    };

    return canteenService;
})