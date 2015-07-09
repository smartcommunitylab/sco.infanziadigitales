angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.calendar',  [])

.controller('CalendarCtrl', function ($scope, moment) {

	function getMonthDateRange(year, month) {
	    // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
	    // array is 'year', 'month', 'day', etc
	    var startDate = moment([year, month - 1]);

	    // Clone the value before .endOf()
	    var endDate = moment(startDate).endOf('month');

	    // make sure to call toDate() for plain JavaScript date type
	    return { start: startDate, end: endDate };
	}

	function weekCount() {
	    var used = $scope.monthRange.start.day() + $scope.monthRange.end.date();
	    return Math.ceil(used / 7);
	}

	$scope.monthRange = getMonthDateRange(2015, 07); // TODO: change
	$scope.monthDisplay = moment().locale('it').format("MMMM gggg");
	$scope.week = [
		'monday_reduced',
		'tuesday_reduced',
		'wednesday_reduced',
		'thursday_reduced',
		'friday_reduced',
		'saturday_reduced',
		'sunday_reduced'
	];

	$scope.weeks = weekCount($scope.monthRange);

	var counter = 1;
	$scope.month = [];
	$scope.generateCalendar = function() {
		// Magic here. Do not touch.
		for (var j = 0; j < $scope.weeks; j++) {
			var week = [];

			var weekDuration = 7;
			if (j == 0) { // First week
				// Get first week start
				var firstWeekStart = $scope.monthRange.start.day();
				for (var i = 0; i < firstWeekStart - 1; i++) {
					week.push('nullo');
				}

				weekDuration -= firstWeekStart - 1;
			}

			if (j == $scope.weeks - 1) { // last week
				var lastWeekEnd = $scope.monthRange.end.day();
				weekDuration = lastWeekEnd;
			}

			// Start pushing
			for (var i = 0; i < weekDuration; i++) {
				week.push(counter);
				counter++;
			}

			// Add last days if needed
			if (j == $scope.weeks - 1) {
				var daysMissing = 7 - weekDuration;
				for (var i = 0; i < daysMissing; i++) {
					week.push('nullo');
				}
			}

			$scope.month.push(week);
		}

		console.log($scope.month); // TODO: remove when magic has been built
	};
});
