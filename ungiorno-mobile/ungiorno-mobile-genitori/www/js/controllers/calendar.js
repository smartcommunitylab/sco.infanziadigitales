angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.calendar',  [])

.controller('CalendarCtrl', function ($scope, moment) {
	var date = moment(new Date());

	var month = date.month() + 1;
	if (month < 10) {
		month = "0" + month;
	} 
	var year = date.year();

	var firstDayOfThisMonth = "01" + month + year; 
});
