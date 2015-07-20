angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.canteen',  [])

.controller('CanteenCtrl', function ($scope, moment, canteenService, dataServerService, $ionicModal) {
    // Can be weekly, monthly or daily
    $scope.displayMode = 'daily'; 

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
		$scope.day = $scope.day.add(1, 'day');
		$scope.dateDisplay = $scope.day.format("dddd, D MMMM gggg");
	};

	// Go back to previous
	$scope.previous = function() {
		day = $scope.day.add(-1, 'day');
		$scope.dateDisplay = $scope.day.format("dddd, D MMMM gggg");
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
		console.log('ciao');
		$scope.infoModal.show();
	}

    // start week
    $scope.week = [];
    $scope.initializeWeekly = function() {
        var startWeek = moment().locale('it').startOf('week');
        var endWeek = moment().locale('it').endOf('week');

        $scope.weekRange = {
            start: startWeek,
            end: endWeek
        };

        $scope.dateDisplay = "dal " + startWeek.format('D MMMM') + " al " + endWeek.format('D MMMM gggg');  
        console.log($scope.weekDisplay);

        doWeek();
    };

    function doWeek() {
        dataServerService.getMeals().then(function(data) {
            for (var i = 0; i < 7; i++) {
                var today = {
                    value: $scope.weekRange.start.add(i, 'day')
                };
                $scope.weekRange.start = moment().locale('it').startOf('week');

                var mealToday = getMealPerDay(today, data);
                if (mealToday) {
                    today.lunch = mealToday.lunch;
                    if (mealToday.break) {
                        today.break = mealToday.break;
                    }

                    console.log(today);
                } 
                $scope.week.push(today);
            }
        });
    }

    function getMealPerDay(day, data) {
        for (var i = 0; i < data.data.length; i++) {
            if (data.data[i].date == day.value.format('X')) {
                return data.data[i];
            } 
        }
    }
    // end week

    // start day
    $scope.initializeDaily = function() {
    	$scope.day = moment().locale('it');
    	$scope.dateDisplay = $scope.day.format("dddd, D MMMM gggg");
	};
    // end day
})