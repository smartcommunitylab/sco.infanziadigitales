angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.week_plan',  [])

.controller('WeekPlanCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup) {
    $scope.days={};
    var dated = new Date();
    $scope.currWeek = (0 | dated.getDate() / 7)+1;
    $scope.currDay = dated.getDay()-1;//0 ,1 ...6
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.editView=false;
    $scope.mode='';

    $scope.getDateString = function () {
        var curr = new Date;
        var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()-1));
        var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay()+5));
        $scope.date = curr.getTime();
    }

    $scope.isActive =  function(day) {
        return (day==$scope.currDay ? true : false);
    };

    $scope.getWeekPlan = function() {
        jsonTest={0:{'name':'monday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono','assente':false},
        1:{'name':'tuesday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono','assente':false},
        2:{'name':'wednesday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono','assente':true,'motivazione':'motivo1'},
        3:{'name':'thursday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono','assente':false},
        4:{'name':'friday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono','assente':false}};
        $scope.days=jsonTest;
        //week_planService.getWeekPlan($scope.currWeek,$scope.kidId).then(function (data) {
        //    $scope.days=data;
        //}, function (error) {
        //});
    };
    $scope.getWeekPlan();

    $scope.setWeekPlan = function() {
        $scope.editView=false;
        $scope.mode='';
        $scope.getWeekPlan();
        //week_planService.setWeekPlan($scope.days,$scope.kidId,$scope.currWeek).then(function (data) {
           // $scope.editView=false;
           // $scope.mode='';
           //$scope.getWeekPlan();
        //}, function (error) {
        //});
    };

    $scope.whatClassIsIt = function(day,type) {
        if(day>$scope.currDay && type==''){
            return 'button-day editable';
        }else if(day<$scope.currDay && type==''){
            return 'button-day readonly';
        }else if(day>$scope.currDay && type=='delega'){
            return 'delega_day editable';
        }else if(day<$scope.currDay && type=='delega'){
            return 'delega_day readonly';
        }else{
            return 'button-day editable';
        }
        return (day==$scope.currDay ? true : false);
    };
    
    $scope.prev_week = function() {
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        $scope.currWeek=(0 | oneWeekAgo.getDate() / 7)+1;
        $scope.currDay = oneWeekAgo.getDay();
        week_planService.setCurrentWeek($scope.currWeek);
        $scope.getWeekPlan();
    };
    
    $scope.next_week = function() {
        var oneWeek = new Date();
        oneWeek.setDate(oneWeek.getDate() + 7);
        $scope.currWeek=(0 | oneWeek.getDate() / 7)+1;
        $scope.currDay = oneWeek.getDay();
        week_planService.setCurrentWeek($scope.currWeek);
        $scope.getWeekPlan();
    };
    
    $scope.modifyWeek = function() {
        $scope.editView=true;
        $scope.mode='Modifica';
    };

    $scope.cancel = function() {
        $scope.editView=false;
        $scope.mode='';
    };

    $scope.gotoEditDate = function() {
        alert('ok');
    };

})

