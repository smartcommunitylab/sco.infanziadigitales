angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.week_plan',  [])

.controller('WeekPlanCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days=[];
    var dated = new Date();
    $scope.currentDate = moment();
    var currW=week_planService.getCurrentWeek();
    $scope.currWeek = (currW != '') ? currW : $scope.currentDate.format('w');
    $scope.currDay = dated.getDay()-1;//0 ,1 ...6
    $scope.kidId=profileService.getBabyProfile().kidId;
    var jsonTest=[{'name':'monday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'fermata':'via test1','delega_name':'NameTest','delega_type':'nono','assente':false},
    {'name':'tuesday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'fermata':'via test1','delega_name':'NameTest','delega_type':'nono','assente':false},
    {'name':'wednesday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'fermata':'via test1','delega_name':'NameTest','delega_type':'nono','assente':true,
                        'motivazione':{type:'malattia',subtype:'Influenza'}},
    {'name':'thursday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'fermata':'via test1','delega_name':'NameTest','delega_type':'nono','assente':false},
    {'name':'friday_reduced','entrata':'08:20','uscita':'13:20','service_bus':true,'fermata':'via test1','delega_name':'NameTest','delega_type':'nono','assente':false}];

    $scope.getDateString = function () {
        var currentDate = moment().week($scope.currWeek);
        var weekStart = currentDate.clone().startOf('week');
        var weekEnd = currentDate.clone().endOf('week');
        var sDate=moment(weekStart).format("D");
        var eDate=moment(weekEnd).format("D");
        var month=moment(weekEnd).format("MMMM");
        var year=moment(weekEnd).format("YYYY");
        $scope.date = sDate+' - '+eDate+' '+month+' '+year;
    }

    $scope.isActive =  function(day) {
        var selected = moment().weekday(day).week($scope.currWeek).format("M D YYYY");
        var format=$scope.currentDate.format("M D YYYY");
        return (selected==format ? true : false);
    };

    $scope.currentWeek = function(){ 
        return $scope.currentDate.format('w');      
    };
    
    $scope.getWeekPlan = function() {
        $scope.mode=week_planService.getMode();
        if($scope.mode=='edit'){
            for(var i=0;i<=4;i++){
                $scope.days[i]=week_planService.getDayData(i);
            }
        }else{
            $scope.days=jsonTest;
            for(var i=0;i<=4;i++){
                week_planService.setDayData(i,$scope.days[i],'');
            }
            //week_planService.getWeekPlan($scope.currWeek,$scope.kidId).then(function (data) {
            //    $scope.days=data;
            //    jsonTest=data;
            //}, function (error) {
            //});
        }
    };
    $scope.getWeekPlan();

    $scope.setWeekPlan = function() {
        $scope.mode='';
        week_planService.setMode($scope.mode);
        //week_planService.setWeekPlan($scope.days,$scope.kidId).then(function (data) {
           // $scope.mode='';
           //$scope.getWeekPlan();
        //}, function (error) {
        //});
    };

    $scope.whatClassIsIt = function(day,type) {
        var selected = moment().weekday(day).week($scope.currWeek);
        var ret;
        if(selected>$scope.currentDate && type==''){
            ret= 'button-day editable';
        }else if(selected<$scope.currentDate && type==''){
            ret= 'button-day readonly';
        }else if(selected>$scope.currentDate && type=='delega'){
            ret= 'delega_day editable';
        }else if(selected<$scope.currentDate && type=='delega'){
            ret= 'delega_day readonly';
        }else{
            ret= 'button-day editable';
        }
        return ret;
    };
    
    $scope.prev_week = function() {
        //days.push(moment(weekStart).add(i, 'days').format("MMMM Do,dddd"));
        var prev = moment().day("Monday").week($scope.currWeek);
        prev.subtract(1, "weeks");
        $scope.currWeek=prev.format('w');
        $scope.getDateString(prev);
        //week_planService.setCurrentWeek($scope.currWeek);
        //$scope.getWeekPlan();
    };
    
    $scope.next_week = function() {
        var next = moment().day("Monday").week($scope.currWeek);
        next.add(1, 'weeks');
        $scope.currWeek=next.format('w');
        $scope.getDateString(next);
        //week_planService.setCurrentWeek($scope.currWeek);
        //$scope.getWeekPlan();
    };
    
    $scope.modifyWeek = function() {
        $scope.mode='edit';
        week_planService.setMode($scope.mode);
    };

    $scope.cancel = function() {
        $scope.mode='';
        $scope.days=jsonTest;
        week_planService.setMode($scope.mode);
    };

    $scope.gotoEditDate = function(day) {
        var selected = moment().weekday(day).week($scope.currWeek);

        if(selected>=$scope.currentDate){
          $scope.mode='edit';
          var dayData=$scope.days[day];
          dayData['monday']=false;
          dayData['tuesday']=false;
          dayData['wednesday']=false;
          dayData['thursday']=false;
          dayData['friday']=false;
          var dateFormat=selected.format('dddd D MMMM');
          week_planService.setCurrentWeek($scope.currWeek);
          week_planService.setSelectedDateInfo(dateFormat);
          week_planService.setDayData(day,dayData,$scope.mode);
          $state.go('app.week_edit_day', {
               day: day
          });
       }
    };

    $scope.load_def_week= function() {
        //week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
        //        $scope.days=data;
        //        jsonTest=data;
        //}, function (error) {
        //});
    };

    $scope.copy_prev_week= function() {
        var week=$scope.currWeek-1;
        //week_planService.getWeekPlan(week,$scope.kidId).then(function (data) {
        //        $scope.days=data;
        //        jsonTest=data;
        //}, function (error) {
        //});
    };

})
.controller('DefaultWeekPlanCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days=[];
    var dated = new Date();
    $scope.currWeek = (0 | dated.getDate() / 7)+1;
    $scope.currDay = dated.getDay()-1;//0 ,1 ...6
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.appId=profileService.getBabyProfile().appId;
    $scope.schoolId=profileService.getBabyProfile().schoolId;
    week_planService.setGlobalParam($scope.appId,$scope.schoolId);
    $scope.editView=false;
    var jsonTest=[{'name':'monday_reduced','entrata':'08:20','uscita':'15:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    {'name':'tuesday_reduced','entrata':'10:20','uscita':'11:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    {'name':'wednesday_reduced','entrata':'07:20','uscita':'14:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    {'name':'thursday_reduced','entrata':'09:20','uscita':'18:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    {'name':'friday_reduced','entrata':'11:20','uscita':'16:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'}];

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
        $scope.mode=week_planService.getModeDefault();
        if($scope.mode=='edit'){
            for(var i=0;i<=4;i++){
                $scope.days[i]=week_planService.getDayDataDefault(i);
            }
        }else{
            //$scope.days=jsonTest;
            //for(var i=0;i<=4;i++){
            //    week_planService.setDayDataDefault(i,$scope.days[i],'');
            //}
            week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
                $scope.days=data;
                console.log(data);
                jsonTest=data;
                for(var i=0;i<=4;i++){
                    week_planService.setDayDataDefault(i,$scope.days[i],'');
                }
            }, function (error) {
            });
        }
    };
    $scope.getWeekPlan();

    $scope.setWeekPlan = function() {
        $scope.mode='';
        week_planService.setModeDefault($scope.mode);
        week_planService.setDefaultWeekPlan($scope.days,$scope.kidId).then(function (data) {
            //$scope.getWeekPlan();
        }, function (error) {
        });
    };

    $scope.whatClassIsIt = function(day,type) {
        if(type=='delega'){
            return 'delega_day editable';
        }else{
            return 'button-day editable';
        }
    };
    
    $scope.modifyWeek = function() {
        $scope.mode='edit';
        week_planService.setModeDefault($scope.mode);
    }; 

    $scope.cancel = function() {
        $scope.mode='';
        $scope.days=jsonTest;
        week_planService.setModeDefault($scope.mode);
    };

    $scope.gotoEditDate = function(day) {
        $scope.mode='edit';
        var dayData=$scope.days[day];
        dayData['monday']=false;
        dayData['tuesday']=false;
        dayData['wednesday']=false;
        dayData['thursday']=false;
        dayData['friday']=false;
        week_planService.setDayDataDefault(day,dayData,$scope.mode);
        $state.go('app.week_default_edit_day', {
             day: day
        });
        
    };

    $scope.restore = function() {
        $scope.days=jsonTest;
    };


})
.controller('WeekDefaultEditDayCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days={};
    var dated = new Date();
    $scope.currDay = 0;
    $scope.currData = {};
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.fermataOptions=[];
    $scope.ritiraOptions=[];
    var t=week_planService.getDayDataDefault($scope.currDay);
    
    $scope.getDateString = function () {
        var curr = new Date;
        $scope.date = curr.getTime();
    }
    $scope.getActualData = function() {
        $scope.currDay=week_planService.getActualDayDefault();
        $scope.currData=angular.copy(week_planService.getDayDataDefault($scope.currDay));
    };
    $scope.getActualData();

    $scope.repeatDays={0:{'name':'monday','label':'monday_reduced'},
    1:{'name':'tuesday','label':'tuesday_reduced'},
    2:{'name':'wednesday','label':'wednesday_reduced'},
    3:{'name':'thursday','label':'thursday_reduced'},
    4:{'name':'friday','label':'friday_reduced'}};

    $scope.setDefaultDay = function() {
        week_planService.setDayDataDefault($scope.currDay,$scope.currData,'edit');
        for(var i=0;i<=4;i++){
            if($scope.currData[$scope.repeatDays[i]['name']]){
                var temp =angular.copy(($scope.currData));
                temp['name']=$scope.repeatDays[i]['label'];
                week_planService.setDayDataDefault(i,temp,'');//copy same info to the selected day of week
            }
        }
        week_planService.setModeDefault('edit');
        $state.go('app.default_week_plan');
    };

    $scope.modifyDay = function() {
        $state.go('app.default_week_plan');
    };

    $scope.cancel = function() {
        $state.go('app.default_week_plan');
    };

    $scope.getFermataOptions = function(day) {
        $scope.fermataOptions=[{'value':'via test1','label':'Test1'},{'value':'test2','label':'Test2'}];
        //week_planService.getFermataOptions().then(function (data) {
        //    $scope.fermataOptions=data;
        //}, function (error) {
        //})
    };
    $scope.getFermataOptions();

    $scope.getRitiroOptions = function(day) {
        $scope.ritiraOptions=[{'value':'via test1','label':'Test1'},{'value':'test2','label':'Test2'}];
        //week_planService.getRitiroOptions().then(function (data) {
        //    $scope.getRitiroOptions=data;
        //}, function (error) {
        //})
    };
    $scope.getRitiroOptions();

    $scope.getListServices = function(day) {
        $scope.listServices=[{'value':'anticipo1','label':'Anticipop1','entry':'09:00',out:'13:40','type':'anticipo'},
        {'value':'posticipo1','label':'Posticipo1','entry':'13:20',out:'16:40','type':'posticipo'},
        {'value':'posticipo2','label':'Posticipo2','entry':'13:20',out:'14:40','type':'posticipo'}];
        //week_planService.getListServices().then(function (data) {
        //    $scope.listServices=data;
        //}, function (error) {
        //})
    };
    $scope.getListServices();

    $scope.setEntry = function(item) {
        $scope.currData.entrata=item.entry;
    };

    $scope.setOut = function(item) {
        $scope.currData.uscita=item.out;
    };

    $scope.openPopupEntry= function() {
        if (true) {//test
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: $filter('translate')('orario_entrata'),
              cssClass: 'expired-popup',
              //templateUrl: '../../templates/week_entry_out_services.html
              /*<ul>
              <li ng-repeat="(key, value) in players | groupBy: 'team'">
                Group name: {{ key }}
                <ul>
                  <li ng-repeat="player in value">
                    player: {{ player.name }}
                  </li>
                </ul>
              </li>
            </ul>',*/
              template: '<input type="text" ng-model="currData.entrata"/>'+
                  ' <div><ion-list class="padlist" ng-repeat="(key, item) in listServices | groupBy: \'type\'" >'+
                  '<ion-item >{{key}}</ion-item >'+
                  '<ion-radio ng-repeat="itemValue in item" ng-click="setEntry(itemValue)">{{itemValue.entry}}</ion-radio>'+
              '</ion-list>'+
          '</ion-list></div>' ,
              buttons: [
                {
                  text: $filter('translate')('retire_popup_absent_close'),
                  type: 'button-positive'
                              }
                          ]
            });
          }
    }

    $scope.openPopupOut= function() {
        if (true) {//test
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: $filter('translate')('orario_uscita'),
              cssClass: 'expired-popup',
              //templateUrl: '../../templates/week_entry_out_services.html',
              template: '<input type="text" ng-model="currData.uscita"/>'+
              ' <div><ion-list class="padlist" ng-repeat="(key, item) in listServices | groupBy: \'type\'" >'+
              '<ion-item >{{key}}</ion-item >'+
              '<ion-radio ng-repeat="itemValue in item" ng-click="setOut(itemValue)">{{itemValue.out}}</ion-radio>'+
          '</ion-list>'+
      '</ion-list></div>' ,
              buttons: [
                {
                  text: $filter('translate')('retire_popup_absent_close'),
                  type: 'button-positive'
                              }
                          ]
            });
          }
    }


})
.controller('WeekEditDayCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days={};
    var dated = new Date();
    $scope.currDay = 0;
    $scope.currData = {};
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.fermataOptions=[];
    $scope.ritiraOptions=[];
    $scope.listServices=[];
    
    $scope.getDateString = function () {
        $scope.date = week_planService.getSelectedDateInfo();
    }
    $scope.getActualData = function() {
        $scope.currDay=week_planService.getActualDay();
        $scope.currData=angular.copy(week_planService.getDayData($scope.currDay));
    };
    $scope.getActualData();

    $scope.repeatDays={0:{'name':'monday','label':'monday_reduced'},
    1:{'name':'tuesday','label':'tuesday_reduced'},
    2:{'name':'wednesday','label':'wednesday_reduced'},
    3:{'name':'thursday','label':'thursday_reduced'},
    4:{'name':'friday','label':'friday_reduced'}};

    $scope.removeReason = function(){ 
        if($scope.currData.motivazione!=undefined){
           $scope.currData.motivazione.type=''; 
           $scope.currData.motivazione.subtype=''; 
        }     
    };

     $scope.listReasons=[{value:'malattia1',label:'Malattia1'},{value:'malattia',label:'Malattia'},{value:'malattia2',label:'Malattia2'}];
     $scope.listProblems=[{value:'malattia',label:'Influenza'},{value:'malattia1',label:'Influenza1'},{value:'malattia2',label:'Influenza2'}];

    $scope.setDay = function() {
        week_planService.setDayData($scope.currDay,$scope.currData,'edit');
        for(var i=0;i<=4;i++){
            if($scope.currData[$scope.repeatDays[i]['name']]){
                var temp =angular.copy(($scope.currData));
                temp['name']=$scope.repeatDays[i]['label'];
                week_planService.setDayData(i,temp,'');//copy same info to the selected day of week
            }
        }
        week_planService.setMode('edit');
        $state.go('app.week_plan');
    };
    
    $scope.modifyDay = function() {
        $state.go('app.week_plan');
    };

    $scope.cancel = function() {
        $state.go('app.week_plan');
    };


    $scope.getFermataOptions = function(day) {
        $scope.fermataOptions=[{'value':'via test1','label':'Test1'},{'value':'test2','label':'Test2'}];
        //week_planService.getFermataOptions().then(function (data) {
        //    $scope.fermataOptions=data;
        //}, function (error) {
        //})
    };
    $scope.getFermataOptions();

    $scope.getRitiroOptions = function(day) {
        $scope.ritiraOptions=[{'value':'NameTest','label':'NameTest'},{'value':'NameTest','label':'NameTest'}];
        //week_planService.getRitiroOptions().then(function (data) {
        //    $scope.getRitiroOptions=data;
        //}, function (error) {
        //})
    };
    $scope.getRitiroOptions();

    $scope.getListServices = function(day) {
        $scope.listServices=[{'value':'anticipo1','label':'Anticipop1','entry':'09:00',out:'13:40',type:'anticipo'},
        {'value':'posticipo1','label':'Posticipo1','entry':'13:20',out:'16:40',type:'posticipo'},
        {'value':'posticipo2','label':'Posticipo2','entry':'13:20',out:'14:40',type:'posticipo'}];
        //week_planService.getListServices().then(function (data) {
        //    $scope.listServices=data;
        //}, function (error) {
        //})
    };
    $scope.getListServices();

    $scope.setEntry = function(item) {
        $scope.currData.entrata=item.entry;
    };

    $scope.setOut = function(item) {
        $scope.currData.uscita=item.out;
    };

    $scope.openPopupEntry= function() {
        if (true) {//test
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: $filter('translate')('orario_entrata'),
              cssClass: 'expired-popup',
              //templateUrl: '../../templates/week_entry_out_services.html
              /*<ul>
              <li ng-repeat="(key, value) in players | groupBy: 'team'">
                Group name: {{ key }}
                <ul>
                  <li ng-repeat="player in value">
                    player: {{ player.name }}
                  </li>
                </ul>
              </li>
            </ul>',*/
              template: '<input type="text" ng-model="currData.entrata"/>'+
                  ' <div><ion-list class="padlist" ng-repeat="(key, item) in listServices | groupBy: \'type\'" >'+
                  '<ion-item >{{key}}</ion-item >'+
                  '<ion-radio ng-repeat="itemValue in item" ng-click="setEntry(itemValue)">{{itemValue.entry}}</ion-radio>'+
              '</ion-list>'+
          '</ion-list></div>' ,
              buttons: [
                {
                  text: $filter('translate')('retire_popup_absent_close'),
                  type: 'button-positive'
                              }
                          ]
            });
          }
    }

    $scope.openPopupOut= function() {
        if (true) {//test
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: $filter('translate')('orario_uscita'),
              cssClass: 'expired-popup',
              //templateUrl: '../../templates/week_entry_out_services.html',
              template: '<input type="text" ng-model="currData.uscita"/>'+
              ' <div><ion-list class="padlist" ng-repeat="(key, item) in listServices | groupBy: \'type\'" >'+
              '<ion-item >{{key}}</ion-item >'+
              '<ion-radio ng-repeat="itemValue in item" ng-click="setOut(itemValue)">{{itemValue.out}}</ion-radio>'+
          '</ion-list>'+
      '</ion-list></div>' ,
              buttons: [
                {
                  text: $filter('translate')('retire_popup_absent_close'),
                  type: 'button-positive'
                              }
                          ]
            });
          }
    }

})

