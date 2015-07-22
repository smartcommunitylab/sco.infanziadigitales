angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.canteen',  [])

.controller('CanteenCtrl', function ($scope, moment, canteenService, dataServerService, $ionicModal) {
    // Can be weekly, monthly or daily
    $scope.displayMode = 'monthly'; 

    $scope.initialize = function() {
    	if ($scope.displayMode == 'daily') {
    		$scope.initializeDaily();
    	} else if ($scope.displayMode == 'weekly') {
    		$scope.initializeWeekly();
    	} else if ($scope.displayMode == 'monthly') {
    		$scope.initializeMonthly();
    	}
    };

    $scope.next = function() {
        if ($scope.displayMode == 'daily') {
            dayPadding++;
            $scope.initializeDaily();
        } else if ($scope.displayMode == 'weekly') {
            weekpadding++;
            $scope.initializeWeekly();
        } else if ($scope.displayMode == 'monthly') {
            monthPadding++;
            $scope.initializeMonthly();
        }
	};

	// Go back to previous
	$scope.previous = function() {
	    if ($scope.displayMode == 'daily') {
            dayPadding--;
            $scope.initializeDaily();
        } else if ($scope.displayMode == 'weekly') {
            weekpadding--;
            $scope.initializeWeekly();
        } else if ($scope.displayMode == 'monthly') {
            monthPadding--;
            $scope.initializeMonthly();
        }
	};

	// change view modal
	$ionicModal.fromTemplateUrl('templates/changeCalendarViewModal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.changeViewModal = modal
	})

	$scope.openChangeViewModal = function() {
		$scope.options = [
			'daily',
			'weekly',
			'monthly'
		];

		$scope.changeViewModal.show()
	}	

	$scope.changeView = function(view) {
		$scope.displayMode = view;
		$scope.initialize();

		$scope.changeViewModal.hide();
	}

	// info modal
	$ionicModal.fromTemplateUrl('templates/canteenModal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.infoModal = modal;
	})

	$scope.openInfoModal = function() {
		$scope.infoModal.show();
	}

    // start week
    $scope.week = [];
    var weekpadding = 0;
    $scope.initializeWeekly = function() {
        var startWeek = moment().locale('it').startOf('week').add(weekpadding, 'week');
        var endWeek = moment().locale('it').endOf('week').add(weekpadding, 'week');

        console.log(startWeek);
        console.log(endWeek);

        $scope.weekRange = {
            start: startWeek,
            end: endWeek
        };

        doWeek();
    };

    function doWeek() {
        $scope.week = [];
        $scope.dateDisplay = "dal " + $scope.weekRange.start.format('D MMMM') + " al " + $scope.weekRange.end.format('D MMMM gggg');
        dataServerService.getMeals().then(function(data) {
            for (var i = 0; i < 7; i++) {
                var today = {
                    value: $scope.weekRange.start.add(i, 'day')
                };
                $scope.weekRange.start = moment().locale('it').add(weekpadding, 'week').startOf('week');

                var mealToday = getMealPerDay(today.value, data);
                if (mealToday) {
                    today.lunch = mealToday.lunch;
                    if (mealToday.break) {
                        today.break = mealToday.break;
                    }
                } 

                today.background = today.value.day() %2 == 0 && today.value.day() != 0? 'transparent': '#93DAF2';
                $scope.week.push(today);
            }
        });
    }

    function getMealPerDay(day, data) {
    	// temp
    	return data.data[0];

        for (var i = 0; i < data.data.length; i++) {
            if (data.data[i].date == day.format('X')) {
                return data.data[i];
            } 
        }
    }
    // end week

    // start day
    var dayPadding = 0;
    $scope.initializeDaily = function() {
    	$scope.day = moment().locale('it').add(dayPadding, 'day');
    	$scope.dateDisplay = $scope.day.format("dddd, D MMMM gggg");
    	doDay();
	};

	function doDay() {
		dataServerService.getMeals().then(function(data) {
			var mealToday = getMealPerDay($scope.day, data);
			if(mealToday) {
				$scope.day.lunch = mealToday.lunch;
				if(mealToday.break) {
					$scope.day.break = mealToday.break;
				}
			}
		})
	}
    // end day

    // start month
    var monthPadding = 0;
    $scope.initializeMonthly = function() {
        $scope.month = {
            start: moment().locale('it').startOf('month').add(monthPadding, 'month'),
            end: moment().locale('it').endOf('month').add(monthPadding, 'month')
        };

        $scope.dateDisplay = $scope.month.start.format('MMMM gggg');

        if ($scope.month.start.day() != 1) {
            $scope.month.start = $scope.month.start.startOf('week');
        }

        console.log($scope.month);
        doMonth();
    }

    // Get number of weeks from a range of days
    function weekCount() {
        var used = $scope.month.start.day() + $scope.month.end.date();
        return Math.ceil(used / 7);
    }

    function isWeekend(value) {
        return value != 6 && value != 0? true : false;
    }

    $scope.weeks = [];
    function doMonth() {
        dataServerService.getMeals().then(function(data) {
            $scope.weeks = [];

            // Magic here. Do not touch.
            // Update 2015.13.07: don't know how this works... Please don't hurt me
            for (var j = 0; j < weekCount(); j++) {
                var week = [];
                var weekDuration = 5;

                for (var i = 0; i < weekDuration; i++) {
                    var dayFromBegin = $scope.month.start.format('DDD');
                    var day = $scope.month.start.date();

                    // Find food for today
                    var mealToday = getMealPerDay($scope.month.startOf, data);
                    var food = mealToday.lunch;
                    if (mealToday.break) {
                        food = food.concat(mealToday.break);
                    }

                    week.push({
                        value: day,
                        dayFromBegin: dayFromBegin,
                        food: food
                    });

                    $scope.month.start = $scope.month.start.add(1, 'day');
                }

                // Check if all days of weeks are = 0 (worse way to fix a bug)
                // Please don't kill me
                if (week[0].value == 0 && week[1].value == 0 && week[2].value == 0 && week[3].value == 0 && week[4].value == 0) {
                    // Remove, empty week
                    week = week.slice(0, 0);
                }

                $scope.weeks.push(week);
                $scope.month.start = $scope.month.start.add(2, 'day');
            }

            console.log($scope.weeks);
        });
    }
    // end month
})