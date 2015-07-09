angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.calendarService', [])

.factory('calendarService', function ($http, $q) {
    var calendarService = { };
    var calendar = null;

    calendar.getCalendar = function() {
    	return calendar;
    };

    calendar.setCalendar = function(item) {
    	calendar = item;
    };

    return calendarService;
})