angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.canteen',  [])

.controller('CanteenCtrl', function ($scope, moment, canteenService, dataServerService, $ionicModal, $filter, $ionicPopup) {
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

//	// change view modal
//	$ionicModal.fromTemplateUrl('templates/changeCalendarViewModal.html', {
//		scope: $scope,
//		animation: 'slide-in-up'
//	}).then(function(modal) {
//		$scope.changeViewModal = modal
//	})

	$scope.openChangeViewModal = function() {
		$scope.options = [
			'daily',
			'weekly',
			'monthly'
		];
        $scope.typePopup = $ionicPopup.show({
            templateUrl: 'templates/changeCalendarViewModal.html',
            title: $filter('translate')('show_type'),
            scope: $scope
          });
	}
	$scope.changeView = function(view) {
		$scope.displayMode = view;
		$scope.initialize();

		$scope.typePopup.close();
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

    $scope.isToday = function (date) {
        var today = new Date();
        return today.getDate() === date.getDate() &&
            today.getMonth() === date.getMonth() &&
            today.getFullYear() === date.getFullYear();
    }

    $scope.isDayNotCurrentMonth = function (date) {
        return !($scope.currentMonth.getMonth() === date.getMonth() &&
            $scope.currentMonth.getFullYear() === date.getFullYear());
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
                    value: $scope.weekRange.start.add(i, 'day')._d
                };
                $scope.weekRange.start = moment().locale('it').add(weekpadding, 'week').startOf('week');

                var mealToday = getMealPerDay(today.value, data);
                if (mealToday) {
                    today.lunch = mealToday.lunch;
                    if (mealToday.break) {
                        today.break = mealToday.break;
                    }
                } 

                today.background = today.value.getDay() % 2 === 0 && today.value.getDay() !== 0 ? '#fff': '#F8AB11';






                $scope.week.push(today);
            }
        });
    }



    var insertIconForMeal = function (meal) {

        var insertIconForFood = function (food) {
            var icon;
            switch (food.type) {
                case "veg":
                    icon = "inf_digverdura";
                    break;
                case "fruit":
                    icon = "inf_digfrutta";
                    break;
                case "fish":
                    icon = "inf_digpesce";
                    break;
                case "sweet":
                    icon = "inf_digdolce";
                    break;
                case "pizza":
                    icon = "inf_digpizza";
                    break;
                case "meat":
                    icon = "inf_digcarne-rossa";
                    break;
                case "milk":
                    icon = "inf_diglatticini";
                    break;
                case "rise":
                    icon = "inf_digriso";
                    break;
                case "pasta":
                    icon = "inf_digpasta";
                    break;
                case "white_meat":
                    icon = "inf_digcarne-bianca";
                    break;
                default:
                    icon = "inf_digpizza"; //tmp!! soup??
            }
            food['icon'] = icon;
        }


        meal.lunch.forEach(insertIconForFood);
        meal.break.forEach(insertIconForFood);
    }

    function getMealPerDay(day, data) {
    	// temp
        //var meal = insertIconForMeal(data.data[0]);
        //return data.data[0];

        //check this!
        for (var i = 0; i < data.data.length; i++) {
            insertIconForMeal(data.data[i]);
            var foodDay = new Date(data.data[i].date * 1000);
            if (foodDay.getDate() === day.getDate() &&
                foodDay.getMonth() === day.getMonth() &&
                foodDay.getFullYear() === day.getFullYear()) {
                return data.data[i];
            } 
        }
        var foods = { //workaround if in a day no food is found!
            lunch: [],
            break: []
        }
        return foods;
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
			var mealToday = getMealPerDay($scope.day._d, data);
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
        if ($scope.month.start.day() != 1) {
            $scope.month.start = $scope.month.start.startOf('week');
        }
        console.log("last day: " + $scope.month.end.day());
        if ($scope.month.end.day() != 0) {
            $scope.month.end = $scope.month.end.startOf('week').add(6, "days");;
        }

        $scope.currentMonth = moment().locale('it').startOf('month').add(monthPadding, 'month')._d;
    	$scope.dateDisplay = $filter('date')($scope.currentMonth, 'MMMM');

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

    var divideFoodsInCols = function (foodsArray) {
        var foodsFormattedInCols = [];
        var foodsPerRow = 2;
        for (var i = 0; i < foodsArray.length; i += foodsPerRow) {
            var singleRow = [];
            for (var j = i; j - i < foodsPerRow && j < foodsArray.length; j++) {
                singleRow.push(foodsArray[j]);
            }
            foodsFormattedInCols.push(singleRow);
        }
        return foodsFormattedInCols;
    }

    $scope.weeks = [];
    function doMonth() {
        $scope.calendarMatrix = [];

        dataServerService.getMeals().then(function(data) {
            var numberOfWeeks = Math.ceil(($scope.month.end - $scope.month.start) / (1000*60*60*24)) / 7; //ceil to adjust number of days
            var tmp = new Date($scope.month.start);
            for (var weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
                var weekDaysWithFoods = [];

                for (var dayIndex = 0; dayIndex < 5; dayIndex++) {
                    var day = new Date(tmp);
                    var allFoodsToday = getMealPerDay(day, data);

                    var foods = {
                        lunch: divideFoodsInCols(allFoodsToday.lunch),
                        break: divideFoodsInCols(allFoodsToday.break)
                    }
                    console.log();

                    var dayWithFoods = {
                        day: day,
                        foods: foods
                    }
                    tmp.setDate(tmp.getDate() + (dayIndex == 4 ? 3 : 1));
                    weekDaysWithFoods.push(dayWithFoods);
                }
                $scope.calendarMatrix.push(weekDaysWithFoods);
            }

        });
    }
    // end month
})
