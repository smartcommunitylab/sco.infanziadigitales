angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.calendar',  [])

.controller('CalendarCtrl', function ($scope, moment, dataServerService, profileService) {
	var counter = 1;
	var month = moment();

	// Note: when an appointment "forWhom" field is set as "all", that will be added to both parents and kid calendar
	var babyProfile = profileService.getBabyProfile(); 
	var parentsAppointments = [];
	var kidAppointments =  [];

	function getMonthDateRange(year, month) {
	    var startDate = moment([year, month - 1]);
	    var endDate = moment(startDate).endOf('month');
	    return { start: startDate, end: endDate };
	}

	function weekCount() {
	    var used = $scope.monthRange.start.day() + $scope.monthRange.end.date();
	    return Math.ceil(used / 7);
	}

	function isWeekend(value) {
		return value != 6 && value != 0? true : false;
	}

	function generateCalendar() {
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
				var style = isWeekend($scope.monthRange.start.day())? "open-day": "close-day"; 
				$scope.monthRange.start = $scope.monthRange.start.add(1, 'day');			

				var day = {
					value: counter,
					style: style
				};

				week.push(day);
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
	}

	function populateCalendar() {
		if (babyProfile && $scope.monthRange) {
			dataServerService.getCalendars($scope.monthRange.start.unix(), $scope.monthRange.end.unix(), babyProfile.schoolId, babyProfile.kidId).then(function(data) {
				if (data && data.data) {
					for(var i = 0; i < data.data.length; i++) {
						var thisData = data.data[i];
						var appointment = {
							title: thisData.title,
							type: thisData.type,
							start: moment(thisData.start),
							end: thisData.end,
							forWhom: thisData.forWhom
						};

						if (appointment.forWhom == "kid") {
							kidAppointments.push(appointment);
						} else if (appointment.forWhom == "parent") {
							parentsAppointments.push(appointment);
						} else {
							kidAppointments.push(appointment);
							parentsAppointments.push(appointment);
						}
					}

					console.log(kidAppointments);
					console.log(parentsAppointments);
				}
			});
		}
	};

	function displayCalendar() {
		if ($scope.month) {

		}
	};

	$scope.initialize = function() {

		// Basic calendar, user information will be added later on
		// reset counter
		counter = 1;
		$scope.monthRange = getMonthDateRange(month.format('YYYY'), month.format('M'));
		$scope.monthDisplay = month.locale('it').format("MMMM gggg");
		$scope.weeks = weekCount($scope.monthRange);
		$scope.month =  [];
		generateCalendar();

		// User infomation
		populateCalendar();
		displayCalendar();
	};

	$scope.week = [
		'monday_reduced',
		'tuesday_reduced',
		'wednesday_reduced',
		'thursday_reduced',
		'friday_reduced',
		'saturday_reduced',
		'sunday_reduced'
	];

	// Go forward a month
	$scope.next = function() {
		month = month.add(1, 'month');
		$scope.initialize();
	};

	// Go back to previous month
	$scope.previous = function() {
		month = month.add(-1, 'month');
		$scope.initialize();
	};
});
