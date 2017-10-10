angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.week_plan',  [])

.controller('WeekPlanCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days=[];
    var dated = new Date();
    $scope.currentDate = moment();
    var currW=week_planService.getCurrentWeek();
    $scope.currWeek = (currW != '') ? currW : $scope.currentDate.format('w');
    $scope.currDay = dated.getDay()-1;//0 ,1 ...6
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.appId=profileService.getBabyProfile().appId;
    $scope.schoolId=profileService.getBabyProfile().schoolId;
    $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
    console.log(profileService.getSchoolProfile());
    console.log(profileService.getBabyProfile());
    var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
    fromtime=$filter('date')( fromtime, 'H:mm' ).replace(/^0+/, '');
    var totime=$scope.getSchoolProfileNormalConfig['toTime'];
    totime=$filter('date')( totime, 'H:mm' ).replace(/^0+/, '');
    if(fromtime=='' && totime==''){
        alert('No school Config');//TODO translate this
    }

    $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
    if($scope.listServicesDb!=undefined){
    for(var i=0;i<$scope.listServicesDb.length;i++){
            var type=$scope.listServicesDb[i].name;
            var enabled=$scope.listServicesDb[i].enabled;
            if(enabled && type=='Anticipo'){
               var tempServ=$scope.listServicesDb[i].timeSlots;
               fromtime=tempServ[0]['fromTime'];
               fromtime=$filter('date')( fromtime, 'H:mm' ).replace(/^0+/, '');
            }
            if(enabled && type=='Posticipo'){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                totime=tempServ[0]['toTime'];
                totime=$filter('date')( totime, 'H:mm' ).replace(/^0+/, '');
            }
    }
    }
    console.log($scope.listServicesDb);
    
    week_planService.setGlobalParam($scope.appId,$scope.schoolId);
    var jsonTest=[];

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

    $scope.formatInfo = function(info){ 
        for(var i=0;i<=4;i++){
            if(info[i]['uscita']!=null && info[i]['uscita']!=undefined)
                info[i]['uscita']=$filter('date')( info[i]['uscita'], 'H:mm' ).replace(/^0+/, '');
            if(info[i]['entrata']!=null && info[i]['entrata']!=undefined)
                info[i]['entrata']=$filter('date')( info[i]['entrata'], 'H:mm' ).replace(/^0+/, '');
         } 
         return info;
    };
    
    $scope.getWeekPlanDB =  function(week) {
        week_planService.getWeekPlan(week,$scope.kidId).then(function (data) {
            if(data!=null){
                data=$scope.formatInfo(data);
                $scope.days=data;
                jsonTest=data;
                for(var i=0;i<=4;i++){
                    week_planService.setDayData(i,$scope.days[i],'');
                }
            }
            else{
                week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
                    if(data!=null){
                        data=$scope.formatInfo(data);
                        $scope.days=data;
                        jsonTest=data;
                        for(var i=0;i<=4;i++){
                           week_planService.setDayData(i,$scope.days[i],'');
                        }
                    }
                    else{
                        var jsonTest=[{'name':'monday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                        {'name':'tuesday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                        {'name':'wednesday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                        {'name':'thursday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                        {'name':'friday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'}];
                        jsonTest=$scope.formatInfo(jsonTest);
                        $scope.days=jsonTest;
                        for(var i=0;i<=4;i++){
                           week_planService.setDayData(i,$scope.days[i],'');
                        }
                    }
                }, function (error) {
                });
            }
            
        }, function (error) {
        });
    };

    $scope.getWeekPlan = function() {
        $scope.mode=week_planService.getMode();
        if($scope.mode=='edit'){
            for(var i=0;i<=4;i++){
                $scope.days[i]=week_planService.getDayData(i);
            }
        }else{
            $scope.getWeekPlanDB($scope.currWeek);
        }
    };
    $scope.getWeekPlan();

    $scope.setWeekPlan = function() {
        if(confirm('Siete sicuri di voler salvare questi dati?')){
            week_planService.setWeekPlan($scope.days,$scope.kidId,$scope.currWeek).then(function (data) {
                $scope.mode='';
                week_planService.setMode($scope.mode);
            }, function (error) {
            });
        }
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
        week_planService.setCurrentWeek($scope.currWeek);
        $scope.getWeekPlan();
    };
    
    $scope.next_week = function() {
        var next = moment().day("Monday").week($scope.currWeek);
        next.add(1, 'weeks');
        $scope.currWeek=next.format('w');
        $scope.getDateString(next);
        week_planService.setCurrentWeek($scope.currWeek);
        $scope.getWeekPlan();
    };
    
    $scope.modifyWeek = function() {
        $scope.mode='edit';
        week_planService.setMode($scope.mode);
    };

    $scope.cancel = function() {
        $scope.mode='';
        week_planService.setMode($scope.mode);
        $scope.getWeekPlanDB($scope.currWeek);
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
        week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
                $scope.days=data;
                jsonTest=data;
                for(var i=0;i<=4;i++){
                    week_planService.setDayData(i,$scope.days[i],'');
                }
        }, function (error) {
        });
    };

    $scope.copy_prev_week= function() {
        var week=$scope.currWeek-1;
        $scope.getWeekPlanDB(week);
    };
    $scope.ritiraOptions=profileService.getBabyProfile().persons;

})
.controller('DefaultWeekPlanCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days=[];
    var dated = new Date();
    $scope.currWeek = (0 | dated.getDate() / 7)+1;
    $scope.currDay = dated.getDay()-1;//0 ,1 ...6
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.appId=profileService.getBabyProfile().appId;
    $scope.schoolId=profileService.getBabyProfile().schoolId;
    $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
    var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
    fromtime=$filter('date')(fromtime, 'H:mm' ).replace(/^0+/, '');
    var totime=$scope.getSchoolProfileNormalConfig['toTime'];
    totime=$filter('date')(totime, 'H:mm' ).replace(/^0+/, '');
    if(fromtime=='' && totime==''){
        alert('No school Config');//TODO translate this
    }

    $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
    if($scope.listServicesDb!=undefined){
    for(var i=0;i<$scope.listServicesDb.length;i++){
            var type=$scope.listServicesDb[i].name;
            var enabled=$scope.listServicesDb[i].enabled;
            if(enabled && type=='Anticipo'){
               var tempServ=$scope.listServicesDb[i].timeSlots;
               fromtime=tempServ[0]['fromTime'];
               fromtime=$filter('date')(fromtime, 'H:mm' ).replace(/^0+/, '');
            }
            if(enabled && type=='Posticipo'){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                totime=tempServ[0]['toTime'];
                totime=$filter('date')(totime, 'H:mm' ).replace(/^0+/, '');
            }
    }
    }
    week_planService.setGlobalParam($scope.appId,$scope.schoolId);
    $scope.editView=false;
    $scope.ritiraOptions=[];
    var jsonTest=[];
    //var jsonTest=[{'name':'monday_reduced','entrata':'08:20','uscita':'15:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    //{'name':'tuesday_reduced','entrata':'10:20','uscita':'11:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    //{'name':'wednesday_reduced','entrata':'07:20','uscita':'14:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    //{'name':'thursday_reduced','entrata':'09:20','uscita':'18:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'},
    //{'name':'friday_reduced','entrata':'11:20','uscita':'16:20','service_bus':true,'delega_name':'NameTest','delega_type':'nono'}];

    $scope.getDateString = function () {
        var curr = new Date;
        var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()-1));
        var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay()+5));
        $scope.date = curr.getTime();
    }

    $scope.isActive =  function(day) {
        return (day==$scope.currDay ? true : false);
    };

    $scope.formatInfo = function(info){ 
        for(var i=0;i<=4;i++){
            if(info[i]['uscita']!=null && info[i]['uscita']!=undefined)
                info[i]['uscita']=$filter('date')( info[i]['uscita'], 'H:mm' ).replace(/^0+/, '');
            if(info[i]['entrata']!=null && info[i]['entrata']!=undefined)
                info[i]['entrata']=$filter('date')( info[i]['entrata'], 'H:mm' ).replace(/^0+/, '');
         } 
         return info;
    };

    $scope.getWeekPlanDB =  function(day) {
        week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
            if(data!=null){
                data=$scope.formatInfo(data);
                $scope.days=data;
                jsonTest=data;
                for(var i=0;i<=4;i++){
                    week_planService.setDayDataDefault(i,$scope.days[i],'');
                }
            }
            else{
                var jsonTest=[{'name':'monday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                {'name':'tuesday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                {'name':'wednesday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                {'name':'thursday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'},
                {'name':'friday_reduced','entrata':fromtime,'uscita':totime,'service_bus':true,'delega_name':'NameTest'}];
                jsonTest=$scope.formatInfo(jsonTest);
                $scope.days=jsonTest;
                for(var i=0;i<=4;i++){
                   week_planService.setDayData(i,$scope.days[i],'');
                }
            }
        }, function (error) {
        });
    };

    $scope.getWeekPlan = function() {
        $scope.ritiraOptions=profileService.getBabyProfile().persons;
        $scope.mode=week_planService.getModeDefault();
        if($scope.mode=='edit'){
            for(var i=0;i<=4;i++){
                $scope.days[i]=week_planService.getDayDataDefault(i);
            }
        }else{
            $scope.getWeekPlanDB();
        }
    };
    $scope.getWeekPlan();

    $scope.setWeekPlan = function() {
        //TODO add confirm popup 
        if(confirm('Siete sicuri di voler salvare questi dati?')){
        $scope.mode='';
        week_planService.setModeDefault($scope.mode);
        week_planService.setDefaultWeekPlan($scope.days,$scope.kidId).then(function (data) {
            //$scope.getWeekPlan();
        }, function (error) {
        });
    }
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
        week_planService.setModeDefault($scope.mode);
        $scope.getWeekPlanDB();
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
        $scope.getWeekPlanDB();
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
    $scope.listServices=[];
    var t=week_planService.getDayDataDefault($scope.currDay);
    
    $scope.getActualData = function() {
        $scope.currDay=week_planService.getActualDayDefault();
        var selected = moment().weekday($scope.currDay);
        var dateFormat=selected.format('dddd');
        $scope.date=dateFormat;
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
        for(var i=0;i<=4;i++){
            $scope.days[i]=week_planService.getDayDataDefault(i);
        }
        
        week_planService.setModeDefault('edit');
        $state.go('app.default_week_plan');
    };

    $scope.getFermataOptions = function(day) {
        if(profileService.getBabyProfile().services.bus && profileService.getBabyProfile().services.bus.stops){
            $scope.fermataOptions=profileService.getBabyProfile().services.bus.stops;
        }
    };
    $scope.getFermataOptions();

    $scope.getRitiroOptions = function(day) {
        $scope.ritiraOptions=profileService.getBabyProfile().persons;
    };
    $scope.getRitiroOptions();

    $scope.getListServices = function(day) {
        $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
        var fr='';
        var to='';
        for(var i=0;i<$scope.listServicesDb.length;i++){
            var type=$scope.listServicesDb[i].name;
            var enabled=$scope.listServicesDb[i].enabled;
            if(enabled){
               var tempServ=$scope.listServicesDb[i].timeSlots;
               for(var j=0;j<tempServ.length;j++){
                   fr=moment(tempServ[j]['fromTime']).format('H:mm');
                   to=moment(tempServ[j]['toTime']).format('H:mm');
                   var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                   'entry':fr,'out':to,'entry_time':new Date(moment(tempServ[j]['fromTime']).format()).getTime(),'out_time':new Date(moment(tempServ[j]['toTime']).format()).getTime(),
                   'type':type};
                   $scope.listServices.push(temp);
               }
            }
        }
        $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
        var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
        fromtimeFormatted=moment(fromtime).format('H:mm');
        fromtime=new Date(moment(fromtime).format()).getTime();
        var totime=$scope.getSchoolProfileNormalConfig['toTime'];
        totimeFormatted=moment(totime).format('H:mm');
        totime=new Date(moment(totime).format()).getTime();
        var temp={'value':'Normale','label':'Normale',
        'entry':fromtimeFormatted,'out':totimeFormatted,'entry_time':fromtime,'out_time':totime,
        'type':'Normale'};
        $scope.listServices.push(temp);
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
             template: '<input type="text" ng-model="currData.entrata"/>'+
                  ' <div><ion-list class="padlist" ng-repeat="(key, item) in listServices | orderBy:\'entry_time\' | groupBy: \'type\'   " >'+
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
              ' <div><ion-list class="padlist" ng-repeat="(key, item) in listServices | orderBy:\'out_time\' | groupBy: \'type\'  " >'+
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

    function setTimeWidget() {
        $scope.timePickerObject24Hour = {
            inputEpochTime: ((new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60), //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button-popup', //Optional
            closeButtonType: 'button-popup', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val);
            }
        };
    }

    function timePicker24Callback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            $scope.timePickerObject24Hour.inputEpochTime = val;
            var selectedTime = new Date();
            selectedTime.setHours(val / 3600);
            selectedTime.setMinutes((val % 3600) / 60);
            selectedTime.setSeconds(0);
            $scope.hourTimestamp = $filter('date')(selectedTime, 'hh:mma');
        }
    }
    setTimeWidget();

    $scope.setBusHour= function() {

    }

})
.controller('WeekEditDayCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days=[];
    var dated = new Date();
    $scope.currDay = 0;
    $scope.currData = {};
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.schoolProf=profileService.getSchoolProfile();
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

     $scope.listReasons=$scope.schoolProf.absenceTypes;
     $scope.listProblems=$scope.schoolProf.frequentIllnesses;

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
        var getIsFromHome=week_planService.getIsFromHome();
        if(getIsFromHome){
            var currWeek=week_planService.getCurrentWeek();
            for(var i=0;i<=4;i++){
                $scope.days[i]=week_planService.getDayData(i);
            }
            week_planService.setWeekPlan($scope.days,$scope.kidId,currWeek).then(function (data) {
                $state.go('app.home');
            }, function (error) {
            });
            
        }else{
            $state.go('app.week_plan');
        }
    };
    
    $scope.modifyDay = function() {
        $state.go('app.week_plan');
    };

    $scope.cancel = function() {
        var getIsFromHome=week_planService.getIsFromHome();
        if(getIsFromHome){
            $state.go('app.home');
        }else{
            $state.go('app.week_plan');
        }
    };


    $scope.getFermataOptions = function(day) {
        if(profileService.getBabyProfile().services.bus && profileService.getBabyProfile().services.bus.stops){
            $scope.fermataOptions=profileService.getBabyProfile().services.bus.stops;
        }
    };
    $scope.getFermataOptions();

    $scope.getRitiroOptions = function(day) {
        $scope.ritiraOptions=profileService.getBabyProfile().persons;
    };
    $scope.getRitiroOptions();

    $scope.getListServices = function(day) {
        $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
        for(var i=0;i<$scope.listServicesDb.length;i++){
            var type=$scope.listServicesDb[i].name;
            var enabled=$scope.listServicesDb[i].enabled;
            if(enabled){
               var tempServ=$scope.listServicesDb[i].timeSlots;
               for(var j=0;j<tempServ.length;j++){
                   var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                   'entry':$filter('date')(tempServ[j]['fromTime'],'H:mm'),out:$filter('date')(tempServ[j]['toTime'],'H:mm'),
                   'type':type};
                   $scope.listServices.push(temp);
               }
            }
        }
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
.controller('Promemoria', function ($scope, moment, dataServerService, profileService , $ionicModal ,$filter, $ionicPopup,$state,$cordovaLocalNotification,week_planService) {
    $scope.days={};
    $scope.currDay = 0;
    $scope.currData = {};
    $scope.selectables=['Monday','Tuesday','Wednesday','Thursday','Friday'];
    $scope.currData['prom_day_summary']=(localStorage.getItem('prom_day_summary') =='true' ? true : false);
    $scope.currData['prom_week']=(localStorage.getItem('prom_week') =='true' ? true : false);
    $scope.currData['prom_day_ritiro']=(localStorage.getItem('prom_day_ritiro') =='true' ? true : false);
    $scope.currData['prom_week_day']=(localStorage.getItem('prom_week_day') !== null && localStorage.getItem('prom_week_day') !== undefined ? localStorage.getItem('prom_week_day') : $scope.selectables[0]);
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.schoolId=profileService.getBabyProfile().schoolId;
    $scope.hourTimestamp = null;
    $scope.timePickerObject24Hour={};

    function setTimeWidget() {
        var tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if(localStorage.getItem('prom_day_time') !== null && localStorage.getItem('prom_day_time') !== undefined){
            temp=localStorage.getItem('prom_day_time').split(':');
            var selectedTime = new Date();
            selectedTime.setHours(temp[0]);
            selectedTime.setMinutes(temp[1]);
            selectedTime.setSeconds(0);
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24Hour = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button-norm', //Optional
            closeButtonType: 'button-norm', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,'day',$scope.timePickerObject24Hour,'prom_day_time');
            }
        };
        var val = tempVal;
        var selectedTime = new Date();
        selectedTime.setHours(val / 3600);
        selectedTime.setMinutes((val % 3600) / 60);
        selectedTime.setSeconds(0);
        $scope.currData['prom_day_time'] = $filter('date')(selectedTime, 'H:mm');

        // params for weekly notification
        tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if(localStorage.getItem('prom_week_time') !== null && localStorage.getItem('prom_week_time') !== undefined){
            temp=localStorage.getItem('prom_week_time').split(':');
            var selectedTime = new Date();
            selectedTime.setHours(temp[0]);
            selectedTime.setMinutes(temp[1]);
            selectedTime.setSeconds(0);
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24HourWeek = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button-norm', //Optional
            closeButtonType: 'button-norm', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,'day',$scope.timePickerObject24HourWeek,'prom_week_time');
            }
        };
        val = tempVal;
        var selectedTime = new Date();
        selectedTime.setHours(val / 3600);
        selectedTime.setMinutes((val % 3600) / 60);
        selectedTime.setSeconds(0);
        $scope.currData['prom_week_time']=$filter('date')(selectedTime, 'H:mm');

        // params for DAILY RITIRO notification
        tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if(localStorage.getItem('prom_ritiro_time') !== null && localStorage.getItem('prom_ritiro_time') !== undefined){
            temp=localStorage.getItem('prom_ritiro_time').split(':');
            var selectedTime = new Date();
            selectedTime.setHours(temp[0]);
            selectedTime.setMinutes(temp[1]);
            selectedTime.setSeconds(0);
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24HourRitiro = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button-norm', //Optional
            closeButtonType: 'button-norm', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,'day',$scope.timePickerObject24HourRitiro,'prom_ritiro_time');
            }
        };
        var val = tempVal;
        var selectedTime = new Date();
        selectedTime.setHours(val / 3600);
        selectedTime.setMinutes((val % 3600) / 60);
        selectedTime.setSeconds(0);
        $scope.currData['prom_ritiro_time']=$filter('date')(selectedTime, 'H:mm');
    }
    
    function timePicker24Callback(val,type,variable,name) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            variable.inputEpochTime = val;
            var selectedTime = new Date();
            selectedTime.setHours(val / 3600);
            selectedTime.setMinutes((val % 3600) / 60);
            selectedTime.setSeconds(0);
            $scope.currData[name] = $filter('date')(selectedTime, 'H:mm');
            localStorage.setItem(name,$filter('date')(selectedTime, 'H:mm')) ;
            $scope.setNotify();
        }
    }
    setTimeWidget();
    
    $scope.save_week_day=  function() {
        localStorage.setItem('prom_week_day',$scope.currData['prom_week_day']) ;
        $scope.setNotify();
    }
    var date =new Date();
    var idNotification = 7;
    var notifArray = [];
    var now = new Date().getTime();
    var day_summ={
        id: idNotification++,
        title: $filter('translate')('notification_day_summary_title'),
        text: $filter('translate')('notification_day_summary_text'),
        icon: 'res://notification.png',
        autoClear: false,
        every:  1 * 60 * 24, //1 day
        at :new Date(),
        data: {
            'type': 'day_summary'
        }
    };
    var week = {
        id: idNotification++,
        title: $filter('translate')('notification_day_summary_title'),
        text: $filter('translate')('notification_week_text'),
        icon: 'res://notification.png',
        //autoCancel: false,
        autoClear: false,
        every: 1 * 60 * 24 * 7,  // 1 week.
        at:new Date(),
        data: {
            'type': 'week'
        }
    };
    var ritiro ={
        id: idNotification++,
        title: $filter('translate')('notification_day_summary_title'),
        text: $filter('translate')('notification_ritiro_text'),
        icon: 'res://notification.png',
        //autoCancel: false,
        autoClear: false,
        every:  1 * 60 * 24, //1 day
        at:new Date(),
        data: {
            'type': 'ritiro'
        }
    };
    

    $scope.setNotify = function() {
        if (window.plugin && cordova && cordova.plugins && cordova.plugins.notification) {
            cordova.plugins.notification.local.clearAll(function () {
                cordova.plugins.notification.local.cancelAll(function () {
            
        console.log($scope.currData);
        localStorage.setItem('prom_day_summary', false);
        localStorage.setItem('prom_week', false);
        localStorage.setItem('prom_day_ritiro', false);
        var notific=[];
            if($scope.currData['prom_day_summary']){
                localStorage.setItem('prom_day_summary', true);
                temp=$scope.currData['prom_day_time'].split(':');
                var selectedTime = new Date();
                selectedTime.setHours(temp[0]);
                selectedTime.setMinutes(temp[1]);
                selectedTime.setSeconds(0);
                console.log(selectedTime.getHours());
                console.log(selectedTime.getMinutes());
                day_summ.at=selectedTime;
                notific.push(day_summ);
            }
            if($scope.currData['prom_week']){
                localStorage.setItem('prom_week', true);
                temp=$scope.currData['prom_week_time'].split(':');
                var tempDay=$scope.currData['prom_week_day'];
                var next = moment(new Date());
                next.set({
                    'hour' : temp[0],
                    'minute'  : temp[1], 
                    'day' : tempDay
                 });
                var selectedTime = next.toDate();
                console.log(selectedTime.getDate());
                console.log(selectedTime.getDay());
                console.log(selectedTime.getHours());
                console.log(selectedTime.getMinutes());
                console.log(next.format('YYYY-MM-DD HH:mm'));
                week.at=selectedTime;
                notific.push(week);
            }
            if($scope.currData['prom_day_ritiro']){
                localStorage.setItem('prom_day_ritiro', true);
                temp=$scope.currData['prom_ritiro_time'].split(':');
                $scope.briefInfo=profileService.getBriefInfo();
                var ore_uscita = $scope.briefInfo.ore_uscita.split(':');
                var usc=moment().hour(ore_uscita[0]);
                var usc=moment().minute(ore_uscita[1]);
                dateFrom = usc.subtract(temp[0],'hours');
                dateFrom = dateFrom.subtract(temp[1],'minutes');
                var selectedTime = dateFrom.toDate();
                //console.log(selectedTime);
                //console.log(dateFrom.format('YYYY/mm/dm HH:mm'));
                ritiro.at=selectedTime;
                notific.push(ritiro);
            }

            console.log(notific);
            cordova.plugins.notification.local.schedule(notific);
            cordova.plugins.notification.local.on("click", function (notification) {
                 $state.go("app.home");
            });
            cordova.plugins.notification.local.getAll(function (notifications) {
                    console.log(notifications);
            });
        });
        });
    }
        }    
})
