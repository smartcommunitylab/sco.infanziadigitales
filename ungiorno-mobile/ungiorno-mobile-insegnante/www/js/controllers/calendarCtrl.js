angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.calendar', [])

.controller('calendarCtrl', function ($scope, $location, dataServerService, profileService, $q, $ionicLoading, $filter) {

    var timePadding = 0; //used to move through weeks, months

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
            event.teachers.forEach(function (teacher) {
                if ($scope.teachers[teacher.teacherId] == undefined) {//not already present in the teachers array, get it
                    $scope.teachers[teacher.teacherId] = true;
                    remainingCalls++;
                }
            });
        });
        $scope.teachers = [];
        $scope.events.forEach(function(event) {
            event.teachers.forEach(function (teacher) {
                if ($scope.teachers[teacher.teacherId] == undefined) {//not already present in the teachers array, get it
                    profileService.getTeacherProfileById(teacher.teacherId).then(function (data) {
                        $scope.teachers[teacher.teacherId] = data;
                        remainingCalls--;
                        if (remainingCalls === 0) {
                            deferred.resolve();
                        }
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

    var getEventsFor = function(day, hour) {
        var realDateWithHour = new Date(day);
        realDateWithHour.setHours(hour.getHours());
        realDateWithHour.setMinutes(hour.getMinutes());
        realDateWithHour.setSeconds(hour.getSeconds());
        realDateWithHour.setMilliseconds(0);
        var realDateWithHourEnd = new Date(realDateWithHour.valueOf() + $scope.timeInterval * 1000);
        var eventHere = {
            teachers: [],
            eventForAll: false,
            eventName: ""
        }
        $scope.events.forEach(function(event) {
            var eventFromDate = new Date(event.from * 1000);
            var eventToDate = new Date(event.to * 1000);
            if (realDateWithHour >= eventFromDate && realDateWithHourEnd <= eventToDate)
            {
                if (event.teachers.length === 0) { //event for all
                    eventHere.eventForAll = true;
                    eventHere.eventName = event.what;
                } else {
                    event.teachers.forEach(function (teacher) {
                        eventHere.teachers.push($scope.teachers[teacher.teacherId]);
                    });
                }
            }
        });

        return eventHere;
    }

    var createCalendarMatrix = function () {
        $scope.calendarMatrix = [];
        for (var i = 0; i < $scope.timeDivisions.length; i++) {
            var eventsInDaysAtSameHour = [];
            for (var j = 0; j < $scope.days.length; j++) {
                eventsInDaysAtSameHour.push(getEventsFor($scope.days[j], $scope.timeDivisions[i]));
            }
            $scope.calendarMatrix.push(eventsInDaysAtSameHour);
        }
        $scope.dataLoaded = true;
        $ionicLoading.hide();
    }

    $scope.isToday = function (date) {
        return $scope.today.getDate() === date.getDate() &&
            $scope.today.getMonth() === date.getMonth() &&
            $scope.today.getYear() === date.getYear();;
    }


    $scope.initCalendarForCurrentSettings = function () {
        $scope.showLoader();

        $scope.today = new Date();
        $scope.days = getWeekDays($scope.today.valueOf() + timePadding * 60*60*1000*24*7); //+- 1 week or month
        $scope.currentMonthText = $filter('date')($scope.days[0],'MMMM');


        dataServerService.getTeachersCalendar().then(function (data) {
            $scope.events = data[0].events;
            $scope.timeInterval = data[0].timeDivisionInterval;
            var schoolProfile = profileService.getSchoolProfile();
            //tmp, useful to refresh the page instead of coming back to the home page and then go to calendar page
            //beacuse schoolProfile is null
            if (schoolProfile === null) {
                createHoursDivisionsArray("7:00:00", "18:00:00");
            } else {
                createHoursDivisionsArray(schoolProfile.anticipoTiming.fromTime, schoolProfile.posticipoTiming.toTime);
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


});
