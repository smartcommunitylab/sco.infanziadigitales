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

				console.log($scope.day);
			}
		})
	}
    // end day

    // start month
    var monthPadding = 0;
    $scope.initializeMonthly = function() {
        $scope.month = moment().locale('it').add(monthPadding, 'month');
        $scope.dateDisplay = $scope.month.format('MMMM gggg');
    }

    function doMonth() {
        dataServerService.getMeals().then(function(data) {
            // todo
        });
    }

    // end month
})