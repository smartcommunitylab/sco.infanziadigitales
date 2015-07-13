angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.calendar',  [])

.controller('CalendarCtrl', function ($scope, moment, dataServerService, profileService, $q) {
	var counter = 1;
	var month = moment().locale('it');
	var displayParentsCalendar = true;
	// Note: when an appointment "forWhom" field is set as "all", that will be added to both parents and kid calendar
	var babyProfile = profileService.getBabyProfile(); 
	var parentsAppointments = [];
	var kidAppointments =  [];

	function getMonthDateRange(year, month) {
	    var startDate = moment([year, month - 1]);
	    var endDate = moment(startDate).endOf('month');
	    return { start: startDate, end: endDate };
	}

	// Get number of weeks from a range of days
	function weekCount() {
	    var used = $scope.monthRange.start.day() + $scope.monthRange.end.date();
	    return Math.ceil(used / 7);
	}

	function isWeekend() {
		var value = $scope.monthRange.start.day();
		return value != 6 && value != 0? true : false;
	}

	function generateCalendar() {
		// Magic here. Do not touch.
		for (var j = 0; j < $scope.weeks; j++) {
			var week = [];

			var weekDuration = 7;
			if (j == 0) { // First week
				// Get first week start
				var firstWeekStart = $scope.monthRange.start.add(- 1,'day').day() + 1;
				console.log(firstWeekStart);
				for (var i = 0; i < firstWeekStart - 1; i++) {
					week.push({
						value: 0,
						dayFromBegin: 0,
						background: 'white',
						color: 'white'
					});
				}

				weekDuration -= firstWeekStart - 1;
			}

			if (j == $scope.weeks - 1) { // last week
				var lastWeekEnd = $scope.monthRange.end.day();
				weekDuration = lastWeekEnd;
			}

			// Start pushing
			for (var i = 0; i < weekDuration; i++) {
				var background = isWeekend()? 'green': 'red';
				var dayFromBegin = $scope.monthRange.start.format('DDD');
				$scope.monthRange.start = $scope.monthRange.start.add(1, 'day');			

				var day = {
					value: counter,
					dayFromBegin: dayFromBegin,
					background: background,
					color: 'black'
				};

				week.push(day);
				counter++;
			}

			// Add last days if needed
			if (j == $scope.weeks - 1) {
				var daysMissing = 7 - weekDuration;
				for (var i = 0; i < daysMissing; i++) {
					week.push({
						value: 0,
						dayFromBegin : 0,
						background: 'white',
						color:'white'
					});
				}
			}

			$scope.month.push(week);
		}

		console.log($scope.month);
	}

	// Get data from server and split them in two arrays, one for parents appointments and one for kid
	function getCalendar() {
		// Delete previous data loaded
		kidAppointments = [];
		parentsAppointments = [];

		if (babyProfile && $scope.monthRange) {
			dataServerService.getCalendars($scope.monthRange.start.unix(), $scope.monthRange.end.unix(), babyProfile.schoolId, babyProfile.kidId).then(function(data) {
				if (data && data.data) {
					for(var i = 0; i < data.data.length; i++) {
						var thisData = data.data[i];
						var appointment = {
							title: thisData.title,
							type: thisData.type,
							start: moment(thisData.start, 'X'),
							end: moment(thisData.end, 'X'),
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

					displayCalendar(); // ... and here we display them
				}
			});
		}
	};

	function displayCalendar() {
		if ($scope.month) {
			for (var i = 0; i < $scope.month.length; i++) {
				for (var j = 0; j < $scope.month[i].length; j++) {
					var thisDay = $scope.month[i][j];

					if (displayParentsCalendar) {
						// Find appointments on parents calendar
						var appointmentsForToday = getAppointmentsPerDay(thisDay, parentsAppointments);
					} else {
						// Find appointments on kid calendar
						var appointmentsForToday = getAppointmentsPerDay(thisDay, kidAppointments);
					}

					var colorToDisplay = getColorPerAppointments(appointmentsForToday);
					if (colorToDisplay) {
						$scope.month[i][j].background = colorToDisplay;
					}
				}
			}
		}
	};

	// Get an array of appointments found for a specific day in a specific calendar (like parents calendar)
	function getAppointmentsPerDay(day, calendar) {
		var appointmentsPerDay =  [];
		for (var i = 0; i < calendar.length; i++) {
			if ((calendar[i].start.format('DDD') == day.dayFromBegin) ||
				(calendar[i].end.format('DDD') == day.dayFromBegin) || (
				day.dayFromBegin > calendar[i].start.format('DDD') && day.dayFromBegin < calendar[i].end.format('DDD')))
			{
				appointmentsPerDay.push(calendar[i]);
			}
		}

		return appointmentsPerDay;
	};


	function getColorPerAppointments(appointments) {
		if (appointments.length == 1) {
			switch(appointments[0].type) {
				case 'holiday':
					return 'orange';
					break;
				case 'trip':
					return 'purple';
					break;
				case 'events':
					return 'blue';
					break;
				case 'meeting':
					return 'yellow';
					break;
			}
		} else if (appointments.length > 1) {
			return 'white';
		} else {
			return null;
		}
	};

	$scope.initialize = function() {

		// Basic calendar, user information will be added later on
		// reset counter
		counter = 1;
		$scope.monthRange = getMonthDateRange(month.format('YYYY'), month.format('M'));
		$scope.monthDisplay = month.locale('it').format("MMMM gggg");
		$scope.weeks = weekCount();
		$scope.month =  []; // Array of week (which is an array of days)
		generateCalendar(); // Generate just the view, not data!

		// User infomation
		getCalendar(); // This is where actually we retrieve and display data
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
