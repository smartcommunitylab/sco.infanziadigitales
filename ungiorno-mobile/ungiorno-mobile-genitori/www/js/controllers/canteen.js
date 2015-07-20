angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.canteen',  [])

.controller('CanteenCtrl', function ($scope, moment, canteenService, dataServerService) {
    // Can be weekly, monthly or daily
    $scope.displayMode = 'weekly'; 


    // start week
    $scope.week = [];
    $scope.initializeWeekly = function() {
        var startWeek = moment().locale('it').startOf('week');
        var endWeek = moment().locale('it').endOf('week');

        $scope.weekRange = {
            start: startWeek,
            end: endWeek
        };

        $scope.weekDisplay = "dal " + startWeek.format('D MMMM') + " al " + endWeek.format('D MMMM gggg');  
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

});