angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.calendar', [])

.controller('calendarCtrl', function ($scope, $location, dataServerService, profileService, $q, $ionicLoading, $filter, $ionicModal, moment) {

    var timePadding = 0; //used to move through weeks, months
    var CALENDAR_MODE_WEEKLY = "weekly";
    var CALENDAR_MODE_MONTHLY = "monthly";
    var currentCalendarMode = CALENDAR_MODE_MONTHLY;
    var changeCalendarModeModal;

    $scope.showLoader = function() {
        return $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0,
        });
        $scope.dataLoaded = false;
    };

    $scope.schoolProfile = profileService.getSchoolProfile();

    var getMonday = function (d) {
        d = new Date(d);
        var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }
    var getWeekDays = function (d) {
        var weekDays = [];
        var monday = getMonday(d);
        var tmp = new Date(monday);
        weekDays.push(monday);
        for (var i = 0; i < 6; i++) {
            var currentDay = new Date(tmp.setDate(tmp.getDate() + 1));
            weekDays.push(currentDay);
        }
        return weekDays;
    }

    var insertAllTeachers = function () {
        $scope.teachers = [];
        var deferred = $q.defer();
        var remainingCalls = 0;
        //counts the number of profile calls to do, necessary to notify when all the teachers array is popolated.
        $scope.events.forEach(function(event) {
            event.teachers.forEach(function (teacherId) {
                if ($scope.teachers[teacherId] == undefined) {//not already present in the teachers array, get it
                    $scope.teachers[teacherId] = true;
                    remainingCalls++;
                }
            });
        });
        $scope.teachers = [];
        $scope.events.forEach(function(event) {
            event.teachers.forEach(function (teacherId) {
                if ($scope.teachers[teacherId] == undefined) {//not already present in the teachers array, get it
                    profileService.getTeacherProfileById($scope.schoolProfile.schoolId, teacherId).then(function (data) {
                        $scope.teachers[teacherId] = data;
                        remainingCalls--;
                        if (remainingCalls === 0) {
                            deferred.resolve();
                        }
                        //TODO: resolve also when teacher getting fails!
                    });
                }
            });
        });
        return deferred.promise;
    }

    var createHoursDivisionsArray = function (fromTime, toTime) {

        var fromDate = new Date("2015/08/10 " + fromTime); //random day, month date. Important is hours, minutes
        var toDate = new Date("2015/08/10 " + toTime);
        var numberOfDivisions = Math.ceil((toDate - fromDate) / 1000 / $scope.timeInterval);
        $scope.timeDivisions = [];
        for (var i = 0; i < numberOfDivisions; i++) {
            $scope.timeDivisions.push(new Date(fromDate.valueOf() + $scope.timeInterval * i * 1000));
        }
        $scope.timeDivisions.push(toDate);

    }

    var isEventInDayHour = function (dayStart, dayEnd, eventStart, eventEnd, entirelyInsideInterval) {
        if (entirelyInsideInterval) {
            return dayStart >= eventStart && dayEnd <= eventEnd;
        } else {
            return eventStart <= dayEnd && eventEnd >= dayStart;
        }
    }

    var getEventsFor = function(day, hour) {
        var realDateWithHour = new Date(day);
        if (hour !== undefined) { //hour specified
            realDateWithHour.setHours(hour.getHours(), hour.getMinutes(), hour.getSeconds(), 0);
            var realDateWithHourEnd = new Date(realDateWithHour.valueOf() + $scope.timeInterval * 1000);
        } else { //hour not specified, all day is evaluated
            realDateWithHour.setHours(0, 0, 0, 0);
            var realDateWithHourEnd = new Date(realDateWithHour.valueOf() + 60*60*1000*24);
        }
        var eventHere = {
            teachers: [],
            eventForAll: false,
            eventName: ""
        }
        $scope.events.forEach(function(event) {
            var eventFromDate = new Date(event.from);
            var eventToDate = new Date(event.to);
            if (isEventInDayHour(realDateWithHour, realDateWithHourEnd, eventFromDate, eventToDate, hour !== undefined))
            {
                if (event.teachers.length === 0) { //event for all
                    eventHere.eventForAll = true;
                    eventHere.eventName = event.what;
                } else {
                    event.teachers.forEach(function (teacherId) {
                        eventHere.teachers.push($scope.teachers[teacherId]);
                    });
                }
            }
        });

        return eventHere;
    }



    var createCalendarMatrix = function () {
        $scope.calendarMatrix = [];

        if (currentCalendarMode === CALENDAR_MODE_WEEKLY) {
            for (var i = 0; i < $scope.timeDivisions.length; i++) {
                var eventsInDaysAtSameHour = [];
                for (var j = 0; j < $scope.days.length; j++) {
                    eventsInDaysAtSameHour.push(getEventsFor($scope.days[j], $scope.timeDivisions[i]));
                }
                $scope.calendarMatrix.push(eventsInDaysAtSameHour);
            }
        } else {
            var numberOfWeeks = Math.ceil(($scope.month.end - $scope.month.start) / (1000*60*60*24)) / 7; //ceil to adjust number of days
            var tmp = new Date($scope.month.start);
            for (var weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
                var weekDaysWithEvent = [];

                for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
                    var day = new Date(tmp);
                    var dayWithEvent = {
                        day: day,
                        event: getEventsFor(day)
                    }
                    tmp.setDate(tmp.getDate() + 1);
                    weekDaysWithEvent.push(dayWithEvent);
                }
                $scope.calendarMatrix.push(weekDaysWithEvent);
            }
        }

        $scope.dataLoaded = true;
        $ionicLoading.hide();
    }

    $scope.isToday = function (date) {
        return $scope.today.getDate() === date.getDate() &&
            $scope.today.getMonth() === date.getMonth() &&
            $scope.today.getFullYear() === date.getFullYear();
    }

    $scope.isDayNotCurrentMonth = function (date) {
        return !($scope.currentMonth.getMonth() === date.getMonth() &&
            $scope.currentMonth.getFullYear() === date.getFullYear());
    }

    $scope.isCalendarMode = function (mode) {
        return mode === currentCalendarMode;
    }

    $scope.initCalendarForCurrentSettings = function () {
        $scope.showLoader();

        var currentCalendar = {
            from: 0,
            to: 0
        }

        $scope.today = new Date();
        if (currentCalendarMode === CALENDAR_MODE_WEEKLY) {
            $scope.days = getWeekDays($scope.today.valueOf() + timePadding * 60*60*1000*24*7); //+- 1 week
            $scope.currentMonth = $scope.days[0];

            currentCalendar.from = Math.floor($scope.days[0].getTime() / 1000);
            currentCalendar.to = Math.floor($scope.days[6].getTime() / 1000);
        } else {
            $scope.month = {
                start: moment().locale('it').startOf('month').add(timePadding, 'month'),
                end: moment().locale('it').endOf('month').add(timePadding, 'month')
            };
            if ($scope.month.start.day() != 1) {
                $scope.month.start = $scope.month.start.startOf('week');
            }
            console.log("last day: " + $scope.month.end.day());
            if ($scope.month.end.day() != 0) {
                $scope.month.end = $scope.month.end.startOf('week').add(6, "days");;
            }

            $scope.currentMonth = moment().locale('it').startOf('month').add(timePadding, 'month')._d;

            currentCalendar.from = Math.floor($scope.month.start / 1000);
            currentCalendar.to = Math.floor($scope.month.end / 1000);
        }

        dataServerService.getTeachersCalendar($scope.schoolProfile.schoolId, currentCalendar.from, currentCalendar.to).then(function (data) {
            $scope.events = data.events;
            $scope.timeInterval = data.timeDivisionInterval;

            if (currentCalendarMode === CALENDAR_MODE_WEEKLY) {

                createHoursDivisionsArray($scope.schoolProfile.anticipoTiming.fromTime, $scope.schoolProfile.posticipoTiming.toTime);
            }
            insertAllTeachers().then(function (data) {
                createCalendarMatrix();
            });

        });
    }

    $scope.previousTime = function () {
        timePadding--;
        $scope.initCalendarForCurrentSettings();
    }
    $scope.nextTime = function () {
        timePadding++;
        $scope.initCalendarForCurrentSettings();
    }


    //change calendar mode stuff
    // change view modal
	$ionicModal.fromTemplateUrl('templates/calendarChangeMode.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		changeCalendarModeModal = modal
	})

	$scope.openChangeCalendarMode = function() {
		$scope.options = [
			CALENDAR_MODE_WEEKLY,
            CALENDAR_MODE_MONTHLY
		];

		changeCalendarModeModal.show()
	}

	$scope.changeView = function(view) {
        $scope.dataLoaded = false;
		currentCalendarMode = view;
        timePadding = 0;
		$scope.initCalendarForCurrentSettings();
		changeCalendarModeModal.hide();
	}


});
