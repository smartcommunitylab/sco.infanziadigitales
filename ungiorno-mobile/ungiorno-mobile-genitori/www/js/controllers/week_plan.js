angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.week_plan',  [])

.controller('WeekPlanCtrl', function ($scope, moment, dataServerService, week_planService, profileService , $ionicModal, $filter, $ionicPopup,$state) {
    $scope.days=[];
    var dated = new Date();
    $scope.currentDate = moment();
    var currW=week_planService.getCurrentWeek();
    var currY=week_planService.getCurrentYear();
    $scope.currWeek = (currW != '') ? currW : $scope.currentDate.format('w');
    $scope.currYear = (currY != '') ? currY : $scope.currentDate.format('YYYY');
    $scope.currentDate.week($scope.currWeek).year($scope.currYear);
    $scope.currDay = dated.getDay()-1;//0 ,1 ...6
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.appId=profileService.getBabyProfile().appId;
    $scope.schoolId=profileService.getBabyProfile().schoolId;
    $scope.listServicesAnticipo=[];
    $scope.listServicesPosticipo=[];
    $scope.listServices=[];
    // provide default config for entry/exit if the school doesn't have services/fascie
    $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
    var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
    var totime=$scope.getSchoolProfileNormalConfig['toTime'];
    if(fromtime=='' && totime==''){
        alert($filter('translate')('missing_school_config'));
        fromtime=moment('7:30','H:mm');
        totime=moment('13:30','H:mm');
        fromtimeFormatted=moment(fromtime).format('H:mm');
        totimeFormatted=moment(totime).format('H:mm');
    }

    $scope.getListServices = function() {
        var fr='',fr2='';
        var to='',to2='';
        var serviz=[];
        if(profileService.getBabyProfile().services!==null && profileService.getBabyProfile().services.timeSlotServices!==null){
            var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
            $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
            $scope.listServicesDb=$scope.listServicesDb.concat(allFascieNorm);
            for(var i=0;i<$scope.listServicesDb.length;i++){
                var type=$scope.listServicesDb[i].name;
                var enabled=$scope.listServicesDb[i].enabled;
                var regular=$scope.listServicesDb[i].regular;
                if((enabled || regular) && serviz.indexOf(type)===-1){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                for(var j=0;j<tempServ.length;j++){
                    fr=moment(tempServ[j]['fromTime']).format('H:mm');
                    to=moment(tempServ[j]['toTime']).format('H:mm');
                    var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                    'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                    'type':type};
                    $scope.listServices.push(temp);
                    if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                        $scope.listServicesAnticipo.push(temp);
                    }
                    if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                        $scope.listServicesPosticipo.push(temp);
                    }
                }
                serviz.push(type);
                }
            }
        }
        else{
            var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
            $scope.listServicesDb=allFascieNorm;
            for(var i=0;i<$scope.listServicesDb.length;i++){
                var type=$scope.listServicesDb[i].name;
                var enabled=$scope.listServicesDb[i].enabled;
                var regular=$scope.listServicesDb[i].regular;
                if(enabled || regular){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                for(var j=0;j<tempServ.length;j++){
                    fr=moment(tempServ[j]['fromTime']).format('H:mm');
                    to=moment(tempServ[j]['toTime']).format('H:mm');
                    var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                    'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                    'type':type};
                    $scope.listServices.push(temp);
                    if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                        $scope.listServicesAnticipo.push(temp);
                    }
                    if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                        $scope.listServicesPosticipo.push(temp);
                    }
                }
                }
            }
        }
        if($scope.listServicesAnticipo.length>0){
            $scope.listServicesAnticipo.sort(sortByTimeAscOut);
            fromtime=$scope.listServicesAnticipo[0]['out_val'];
        }
        if($scope.listServicesPosticipo.length>0){
            $scope.listServicesPosticipo.sort(sortByTimeAscOut);
            totime=$scope.listServicesPosticipo[$scope.listServicesPosticipo.length-1]['out_val'];
        }
        
    };
    $scope.getListServices();
    
    week_planService.setGlobalParam($scope.appId,$scope.schoolId);
    var jsonTest=[];

    $scope.getDateString = function (next) {
        var currentDate = next;
        var weekStart = currentDate.clone().startOf('week');
        var weekEnd = currentDate.clone().endOf('week');
        var sDate=moment(weekStart).format("D");
        var eDate=moment(weekEnd).format("D");
        var month=moment(weekEnd).format("MMM");
        var year=moment(weekEnd).format("YYYY");
        $scope.date = sDate+' - '+eDate+' '+month+' '+year;
    }

    $scope.isActive =  function(day) {
        var selected = $scope.currentDate.weekday(day).week($scope.currWeek).format("M D YYYY");
        var format=moment().format("M D YYYY");
        return (selected==format ? true : false);
    };

    $scope.currentWeek = function(){ 
        return $scope.currentDate.format('w');      
    };

    $scope.formatInfo = function(info){ 
        var days = ['monday_reduced','tuesday_reduced', 'wednesday_reduced', 'thursday_reduced', 'friday_reduced'];
        for(var i=0;i<=4;i++){
            info[i].name = days[i];
            if(info[i]['uscita']!=null && info[i]['uscita']!=undefined)
                info[i]['uscita_display']=moment(info[i]['uscita']).format('H:mm' );
            if(info[i]['entrata']!=null && info[i]['entrata']!=undefined)
                info[i]['entrata_display']=moment(info[i]['entrata']).format('H:mm' );
         } 
         return info;
    };
        
    $scope.getWeekPlanDB =  function(week) {
        week_planService.getWeekPlan(week,$scope.kidId).then(function (data) {
            if(data!=null && data!= undefined && data.length>0){
                data=$scope.formatInfo(data);
                $scope.days=data;
                jsonTest=data;
                for(var i=0;i<=4;i++){
                    week_planService.setDayData(i,$scope.days[i],'');
                }
            }
            else{
                week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
                    if(data!=null && data!= undefined && data.length>0){
                        data=$scope.formatInfo(data);
                        $scope.days=data;
                        jsonTest=data;
                        for(var i=0;i<=4;i++){
                           week_planService.setDayData(i,$scope.days[i],'');
                        }
                    }
                    else{
                        var jsonTest=[{'name':'monday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'tuesday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'wednesday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'thursday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'friday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''}];
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
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Questa operazione sovrascriverà i dati attuali. Si vuole procedere ugualmente?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                week_planService.setWeekPlan($scope.days,$scope.kidId,$scope.currWeek).then(function (data) {
                    $scope.mode='';
                    week_planService.setMode($scope.mode);
                }, function (error) {
                });
              }              
            }]
        });
    };

    $scope.whatClassIsIt = function(day,type) {
        var selected = moment($scope.currentDate.clone().weekday(day).week($scope.currWeek).year($scope.currYear).format('M D YYYY'));
        var actualDate=moment(moment().format('M D YYYY'));
        var ret;
        if((selected.isAfter(actualDate) || selected.isSame(actualDate)) && type==''){
            ret= 'button-day editable';
        }else if(selected.isBefore(actualDate) && type==''){
            ret= 'button-day readonly';
        }else if((selected.isAfter(actualDate) || selected.isSame(actualDate)) && type=='delega'){
            ret= 'delega_day editable';
        }else if(selected.isBefore(actualDate) && type=='delega'){
            ret= 'delega_day readonly';
        }else{
            ret= 'button-day editable';
        }
        return ret;
    };
    
    $scope.prev_week = function() {
        var prev = $scope.currentDate;
        prev.subtract(1, "weeks");
        $scope.currentDate=moment(prev,'M D YYYY');
        $scope.currWeek=$scope.currentDate.format('w');
        $scope.currYear=$scope.currentDate.format('YYYY');
        week_planService.setCurrentWeek($scope.currWeek);
        week_planService.setCurrentYear($scope.currYear);
        $scope.getDateString(angular.copy($scope.currentDate));
        $scope.getWeekPlan();
    };
    
    $scope.next_week = function() {
        var next = $scope.currentDate;
        next.add(1, 'weeks');
        $scope.currentDate=moment(next,'M D YYYY');
        $scope.currWeek=$scope.currentDate.format('w');
        $scope.currYear=$scope.currentDate.format('YYYY');
        week_planService.setCurrentWeek($scope.currWeek);
        week_planService.setCurrentYear($scope.currYear);
        $scope.getDateString(angular.copy($scope.currentDate));
        $scope.getWeekPlan();
    };
    
    $scope.modifyWeek = function() {
        $scope.mode='edit';
        week_planService.setMode($scope.mode);
    };

    $scope.cancel = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Sei sicuro di voler annullare le informazioni inserite?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                $scope.mode='';
                week_planService.setMode($scope.mode);
                $scope.getWeekPlanDB($scope.currWeek);
              }              
            }]
        });        
    };

    $scope.getRetireTimeLimit = function () {
        var temp=moment().startOf('day').add(10,'hours');
        if ($scope.briefInfo.ore_uscita!==null && $scope.briefInfo.ore_uscita!==undefined) {
          temp= moment($scope.briefInfo.ore_uscita,'HH:mm');
        } else {
          temp= moment().startOf('day').add(10,'hours');
        }
        return temp;
      }
     
      $scope.isRetireTimeLimitExpired = function () {
        return moment($scope.modifyBefore).isBefore(moment());
      }

      $scope.gotoChat=function() {
        $state.go('app.messages');
        $scope.TempPrevent.close();
      }

      $scope.callSchool = function () {
        if(profileService.getSchoolProfile().contacts==null || profileService.getSchoolProfile().contacts==undefined ){
          alert($filter('translate')('missing_phone'));
          return;
        }
        if(profileService.getSchoolProfile().contacts.telephone.length==0 ){
          alert($filter('translate')('missing_phone'));
          return;
        }
        var num = profileService.getSchoolProfile().contacts.telephone[0];
        num = num.replace(/\D/g, '');
        window.open('tel:' + num, '_system');
        if ($scope.TempPrevent) {
          $scope.TempPrevent.close();
        }
      }

    $scope.gotoEditDate = function(day) {
        var selected = $scope.currentDate.clone().weekday(day).week($scope.currWeek).year($scope.currYear).startOf('day');//moment($scope.currentDate.clone().weekday(day).week($scope.currWeek).year($scope.currYear).format('M D YYYY'));
        var actualDate = moment().startOf('day');//moment(moment().format('M D YYYY'));
        var dayData = $scope.days[day];
        var usc = dayData['uscita'];
        var temp = moment('17:00','HH:mm');// it should be 09:10
        if(temp.isBefore(moment()) && day == $scope.currDay && selected.isSame(actualDate)){
            $scope.TempPrevent = $ionicPopup.show({
                title: $filter('translate')('retire_popup_toolate_title'),
                cssClass: 'expired-popup',
                scope:$scope,
                template: $filter('translate')('retire_popup_toolate_text') + " " + moment(temp).format('HH:mm') + "<div class\"row\"><span ng-click=\"callSchool();\"  class=\"button button-expired-call\">" + $filter('translate')('home_contatta') + "</span></div>"
                + "<div class\"row\"><span ng-click=\"gotoChat();\"  class=\"button button-expired-call\">" + $filter('translate')('send_msg') + "</span></div>",
                buttons: [
                  {
                    text: $filter('translate')('retire_popup_absent_close'),
                    type: 'button-positive'
                    }
                  ]
              });
        }
        else if(!selected.isBefore(actualDate)){
          $scope.mode='edit';
          var dayData=$scope.days[day];
          dayData['monday']=false;
          dayData['tuesday']=false;
          dayData['wednesday']=false;
          dayData['thursday']=false;
          dayData['friday']=false;
          var dateFormat=selected.format('dddd D MMMM');
          week_planService.setCurrentWeek($scope.currWeek);
          week_planService.setCurrentYear($scope.currYear);
          week_planService.setSelectedDateInfo(dateFormat);
          week_planService.fromHome(false);
          week_planService.setDayData(day,dayData,$scope.mode);
          $state.go('app.week_edit_day', {
               day: day
          });
       }
    };

    $scope.load_def_week= function() {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Questa operazione sovrascriverà i dati attuali. Si vuole procedere ugualmente?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
                    if(data!=null && data!= undefined && data.length>0){
                        data=$scope.formatInfo(data);
                        $scope.days=data;
                        jsonTest=data;
                        for(var i=0;i<=4;i++){
                        week_planService.setDayData(i,$scope.days[i],'');
                        }
                    }
                    else{
                        var jsonTest=[{'name':'monday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'tuesday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'wednesday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'thursday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                        {'name':'friday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''}];
                        jsonTest=$scope.formatInfo(jsonTest);
                        $scope.days=jsonTest;
                        for(var i=0;i<=4;i++){
                        week_planService.setDayData(i,$scope.days[i],'');
                        }
                    }
                }, function (error) {
                });
              }              
            }]
        });
    };

    $scope.copy_prev_week= function() {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Questa operazione sovrascriverà i dati attuali. Si vuole procedere ugualmente?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                var week=$scope.currWeek-1;
                $scope.getWeekPlanDB(week);
              }              
            }]
        });
    };
    $scope.ritiraOptions=profileService.getBabyProfile().persons;

    $scope.disableEdit = function() {
        var actWeek=moment();
        var selWeek = moment().day(5).week($scope.currWeek).year($scope.currYear);
        if(selWeek.isBefore(actWeek)){
            return true;
        }
        return false;
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
    $scope.listServicesAnticipo=[];
    $scope.listServicesPosticipo=[];
    $scope.listServices=[];
    // provide default config for entry/exit if the school doesn't have services/fascie
    $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
    var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
    var totime=$scope.getSchoolProfileNormalConfig['toTime'];
    if(fromtime=='' && totime==''){
        alert($filter('translate')('missing_school_config'));
        fromtime=moment('7:30','H:mm');
        totime=moment('13:30','H:mm');
        fromtimeFormatted=moment(fromtime).format('H:mm');
        totimeFormatted=moment(totime).format('H:mm');
    }
    $scope.babyProfile=profileService.getBabyProfile();
    $scope.busEnabled=false;
    $scope.busDefaultStop='';
    if ($scope.babyProfile.services && $scope.babyProfile.services.bus) {
        $scope.busEnabled = $scope.babyProfile.services.bus.enabled;
        if($scope.babyProfile.services.bus.stops && $scope.babyProfile.services.bus.stops.length>0){
            $scope.busDefaultStop=$scope.babyProfile.services.bus.stops[0].stopId;
        }
    }

    $scope.getListServices = function() {
        var fr='',fr2='';
        var to='',to2='';
        var serviz=[];
        if(profileService.getBabyProfile().services!==null && profileService.getBabyProfile().services.timeSlotServices!==null){
            var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
            $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
            $scope.listServicesDb=$scope.listServicesDb.concat(allFascieNorm);
            for(var i=0;i<$scope.listServicesDb.length;i++){
                var type=$scope.listServicesDb[i].name;
                var enabled=$scope.listServicesDb[i].enabled;
                var regular=$scope.listServicesDb[i].regular;
                if((enabled || regular) && serviz.indexOf(type)===-1){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                for(var j=0;j<tempServ.length;j++){
                    fr=moment(tempServ[j]['fromTime']).format('H:mm');
                    to=moment(tempServ[j]['toTime']).format('H:mm');
                    var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                    'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                    'type':type};
                    $scope.listServices.push(temp);
                    if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                        $scope.listServicesAnticipo.push(temp);
                    }
                    if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                        $scope.listServicesPosticipo.push(temp);
                    }
                }
                serviz.push(type);
                }
            }
        }
        else{
            var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
            $scope.listServicesDb=allFascieNorm;
            for(var i=0;i<$scope.listServicesDb.length;i++){
                var type=$scope.listServicesDb[i].name;
                var enabled=$scope.listServicesDb[i].enabled;
                var regular=$scope.listServicesDb[i].regular;
                if(enabled || regular){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                for(var j=0;j<tempServ.length;j++){
                    fr=moment(tempServ[j]['fromTime']).format('H:mm');
                    to=moment(tempServ[j]['toTime']).format('H:mm');
                    var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                    'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                    'type':type};
                    $scope.listServices.push(temp);
                    if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                        $scope.listServicesAnticipo.push(temp);
                    }
                    if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                        $scope.listServicesPosticipo.push(temp);
                    }
                }
                }
            }
        }
        if($scope.listServicesAnticipo.length>0){
            $scope.listServicesAnticipo.sort(sortByTimeAscOut);
            fromtime=$scope.listServicesAnticipo[0]['out_val'];
        }
        if($scope.listServicesPosticipo.length>0){
            $scope.listServicesPosticipo.sort(sortByTimeAscOut);
            totime=$scope.listServicesPosticipo[$scope.listServicesPosticipo.length-1]['out_val'];
        }
        
    };
    $scope.getListServices();
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
        var days = ['monday_reduced','tuesday_reduced', 'wednesday_reduced', 'thursday_reduced', 'friday_reduced'];
        for(var i=0;i<=4;i++){
            info[i].name = days[i];
            if(info[i]['uscita']!=null && info[i]['uscita']!=undefined)
                info[i]['uscita_display']=moment(info[i]['uscita']).format('H:mm' );
            if(info[i]['entrata']!=null && info[i]['entrata']!=undefined)
                info[i]['entrata_display']=moment(info[i]['entrata']).format('H:mm' );
         } 
         return info;
    };
    $scope.formatInfoToServer = function(info){ 
        for(var i=0;i<=4;i++){
            if(info[i]['uscita']!=null && info[i]['uscita']!=undefined)
                info[i]['uscita']=moment(info[i]['uscita'],'H:mm')
            if(info[i]['entrata']!=null && info[i]['entrata']!=undefined)
                info[i]['entrata']=moment(info[i]['entrata'],'H:mm')
         } 
         return info;
    };

    $scope.formatInfoToServer = function(info){ 
        for(var i=0;i<=4;i++){
            if(info[i]['uscita']!=null && info[i]['uscita']!=undefined)
                info[i]['uscita']=moment(info[i]['uscita'],'H:mm')
            if(info[i]['entrata']!=null && info[i]['entrata']!=undefined)
                info[i]['entrata']=moment(info[i]['entrata'],'H:mm')
         } 
         return info;
    };

    $scope.getWeekPlanDB =  function(day) {
        week_planService.getDefaultWeekPlan($scope.kidId).then(function (data) {
            if(data!=null && data!= undefined && data.length>0){
                data=$scope.formatInfo(data);
                $scope.days=data;
                jsonTest=data;
                for(var i=0;i<=4;i++){
                    week_planService.setDayDataDefault(i,$scope.days[i],'');
                }
            }
            else{
                var jsonTest=[{'name':'monday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                {'name':'tuesday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                {'name':'wednesday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                {'name':'thursday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''},
                {'name':'friday_reduced','entrata':fromtime,'uscita':totime,'bus':false,'delega_name':''}];
                jsonTest=$scope.formatInfo(jsonTest);
                $scope.days=jsonTest;
                for(var i=0;i<=4;i++){
                   week_planService.setDayDataDefault(i,$scope.days[i],'');
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
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Questa operazione sovrascriverà i dati attuali. Si vuole procedere ugualmente?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                $scope.mode='';
                //$scope.formatInfoToServer($scope.days);
                week_planService.setDefaultWeekPlan($scope.days,$scope.kidId).then(function (data) {
                    //$scope.getWeekPlan();
                    week_planService.setModeDefault($scope.mode);
                }, function (error) {
                });
              }              
            }]
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
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Sei sicuro di voler annullare le informazioni inserite?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                $scope.mode='';
                week_planService.setModeDefault($scope.mode);
                $scope.getWeekPlanDB();
              }              
            }]
        });
        
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
        var totimeOrig=totime;
        //bus precedence for exit time by default
        if($scope.busEnabled){
            $scope.getSchoolNormalFascie=$filter('getSchoolNormalFascie')(profileService.getSchoolProfile().services);
            $scope.getSchoolNormalFascie.sort(sortByTimeAscOut);
            var length1 =$scope.getSchoolNormalFascie.length;
            if(length1>0) totimeOrig=$scope.getSchoolNormalFascie[length1-1]['out_val'];
            if(totimeOrig=='') totimeOrig=moment('14:00','H:mm');
            totimeFormatted=moment(totimeOrig).format('H:mm');
            totimeOrig=moment(totimeOrig,'H:mm');
        }

        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Questa operazione sovrascriverà i dati attuali. Si vuole procedere ugualmente?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                var jsonTest=[{'name':'monday_reduced','entrata':fromtime,'uscita':totimeOrig,'bus':$scope.busEnabled,'fermata':$scope.busDefaultStop,'delega_name':''},
                {'name':'tuesday_reduced','entrata':fromtime,'uscita':totimeOrig,'bus':$scope.busEnabled,'fermata':$scope.busDefaultStop,'delega_name':''},
                {'name':'wednesday_reduced','entrata':fromtime,'uscita':totimeOrig,'bus':$scope.busEnabled,'fermata':$scope.busDefaultStop,'delega_name':''},
                {'name':'thursday_reduced','entrata':fromtime,'uscita':totimeOrig,'bus':$scope.busEnabled,'fermata':$scope.busDefaultStop,'delega_name':''},
                {'name':'friday_reduced','entrata':fromtime,'uscita':totimeOrig,'bus':$scope.busEnabled,'fermata':$scope.busDefaultStop,'delega_name':''}];
                jsonTest=$scope.formatInfo(jsonTest);
                $scope.days=jsonTest;
                for(var i=0;i<=4;i++){
                   week_planService.setDayDataDefault(i,$scope.days[i],'');
                }
              }              
            }]
        });
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
    $scope.babyProfile=profileService.getBabyProfile();
    $scope.busEnabled=false;
    $scope.busDefaultStop='';
    if ($scope.babyProfile.services && $scope.babyProfile.services.bus) {
        $scope.busEnabled = $scope.babyProfile.services.bus.enabled;
    }

    function setTimeWidget() {
        var tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if($scope.currData.uscita !== null && $scope.currData.uscita !== undefined){
            var selectedTime = moment($scope.currData.uscita).toDate();
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24Hour = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button_save', //Optional
            closeButtonType: 'button_cancel', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,$scope.timePickerObject24Hour,'uscita');
            }
        };
        tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if($scope.currData.entrata !== null && $scope.currData.entrata !== undefined){
            var selectedTime = moment($scope.currData.entrata).toDate();
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24HourEntrata = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button_save', //Optional
            closeButtonType: 'button_cancel', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,$scope.timePickerObject24HourEntrata,'entrata');
            }
        };
    }

    function timePicker24Callback(val,variable,name) {
        if (typeof (val) === 'undefined') {
        } else {
            variable.inputEpochTime = val;
            var selectedTime = new Date();
            selectedTime.setHours(val / 3600);
            selectedTime.setMinutes((val % 3600) / 60);
            selectedTime.setSeconds(0);
            $scope.currData[name] = moment($filter('date')(selectedTime, 'H:mm'),'H:mm');
            $scope.currData[name+'_display'] = $filter('date')(selectedTime, 'H:mm');
        }
    }
    
    $scope.getActualData = function() {
        $scope.currDay=week_planService.getActualDayDefault();
        var selected = moment().weekday($scope.currDay);
        var dateFormat=selected.format('dddd');
        $scope.date=dateFormat;
        $scope.currData=angular.copy(week_planService.getDayDataDefault($scope.currDay));
        if($scope.currData.fermata=='' || $scope.currData.fermata==null || $scope.currData.fermata==undefined){
            $scope.currData.fermata='none_f';
        }
        if($scope.currData.delega_name==null || $scope.currData.delega_name==undefined || $scope.currData.delega_name==''){
            $scope.currData.delega_name='none';            
        }
        if($scope.currData['uscita']!=null && $scope.currData['uscita']!=undefined)
            $scope.currData['uscita_display']=moment($scope.currData['uscita']).format('H:mm' );
        else
            $scope.currData['uscita_display']=$filter('translate')('none');
        if($scope.currData['entrata']!=null && $scope.currData['entrata']!=undefined)
            $scope.currData['entrata_display']=moment($scope.currData['entrata']).format('H:mm' );
        else
            $scope.currData['entrata_display']=$filter('translate')('none');
        setTimeWidget();
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
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Sei sicuro di voler annullare le informazioni inserite?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                for(var i=0;i<=4;i++){
                    $scope.days[i]=week_planService.getDayDataDefault(i);
                }
                
                week_planService.setModeDefault('edit');
                $state.go('app.default_week_plan');
              }              
            }]
        });
        
    };

    $scope.getFermataOptions = function(day) {
        $scope.fermataOptions.push({'stopId':'none_f'});
        if(profileService.getBabyProfile().services && profileService.getBabyProfile().services.bus && profileService.getBabyProfile().services.bus.stops){
            $scope.fermataOptions = $scope.fermataOptions.concat(angular.copy(profileService.getBabyProfile().services.bus.stops));
        }
    };
    $scope.getFermataOptions();

    $scope.getRitiroOptions = function(day) {
        $scope.ritiraOptions.push({'personId':'none','firstName':'none','relation':'none'});
        $scope.ritiraOptions=$scope.ritiraOptions.concat(angular.copy(profileService.getBabyProfile().persons));
    };
    $scope.getRitiroOptions();

    sortByTimeAscEntry = function (lhs, rhs) {
        var results;
        results = lhs.entry_val.hours() > rhs.entry_val.hours() ? 1 : lhs.entry_val.hours() < rhs.entry_val.hours() ? -1 : 0;
        if (results === 0) results = lhs.entry_val.minutes() > rhs.entry_val.minutes() ? 1 : lhs.entry_val.minutes() < rhs.entry_val.minutes() ? -1 : 0;
        if (results === 0) results = lhs.entry_val.seconds() > rhs.entry_val.seconds() ? 1 : lhs.entry_val.seconds() < rhs.entry_val.seconds() ? -1 : 0;
        return results;
      };
    sortByTimeAscOut = function (lhs, rhs) {
        var results;
        results = lhs.out_val.hours() > rhs.out_val.hours() ? 1 : lhs.out_val.hours() < rhs.out_val.hours() ? -1 : 0;
        if (results === 0) results = lhs.out_val.minutes() > rhs.out_val.minutes() ? 1 : lhs.out_val.minutes() < rhs.out_val.minutes() ? -1 : 0;
        if (results === 0) results = lhs.out_val.seconds() > rhs.out_val.seconds() ? 1 : lhs.out_val.seconds() < rhs.out_val.seconds() ? -1 : 0;
        return results;
      };

      $scope.listServicesAnticipo=[];
      $scope.listServicesPosticipo=[];
  
      $scope.getListServices = function(day) {
          // provide default config for entry/exit if the school doesn't have services/fascie
          $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
          var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
          var totime=$scope.getSchoolProfileNormalConfig['toTime'];
          if(fromtime=='' && totime==''){
              fromtime=moment('7:30','H:mm');
              totime=moment('13:30','H:mm');
              fromtimeFormatted=moment(fromtime).format('H:mm');
              totimeFormatted=moment(totime).format('H:mm');
          }
  
          var fr='',fr2='';
          var to='',to2='';
          var serviz=[];
          if(profileService.getBabyProfile().services!==null && profileService.getBabyProfile().services.timeSlotServices!==null){
              var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
              $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
              $scope.listServicesDb=$scope.listServicesDb.concat(allFascieNorm);
              for(var i=0;i<$scope.listServicesDb.length;i++){
                  var type=$scope.listServicesDb[i].name;
                  var enabled=$scope.listServicesDb[i].enabled;
                  var regular=$scope.listServicesDb[i].regular;
                  if((enabled || regular) && serviz.indexOf(type)===-1){
                  var tempServ=$scope.listServicesDb[i].timeSlots;
                  for(var j=0;j<tempServ.length;j++){
                      fr=moment(tempServ[j]['fromTime']).format('H:mm');
                      to=moment(tempServ[j]['toTime']).format('H:mm');
                      var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                      'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                      'type':type};
                      $scope.listServices.push(temp);
                      if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                          $scope.listServicesAnticipo.push(temp);
                      }
                      if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                          $scope.listServicesPosticipo.push(temp);
                      }
                  }
                  serviz.push(type);
                  }
              }
              $scope.listServicesAnticipo.sort(sortByTimeAscOut);
              $scope.listServicesPosticipo.sort(sortByTimeAscOut);
          }
          else{
              var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
              $scope.listServicesDb=allFascieNorm;
              for(var i=0;i<$scope.listServicesDb.length;i++){
                  var type=$scope.listServicesDb[i].name;
                  var enabled=$scope.listServicesDb[i].enabled;
                  var regular=$scope.listServicesDb[i].regular;
                  if(enabled || regular){
                  var tempServ=$scope.listServicesDb[i].timeSlots;
                  for(var j=0;j<tempServ.length;j++){
                      fr=moment(tempServ[j]['fromTime']).format('H:mm');
                      to=moment(tempServ[j]['toTime']).format('H:mm');
                      var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                      'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                      'type':type};
                      $scope.listServices.push(temp);
                      if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                          $scope.listServicesAnticipo.push(temp);
                      }
                      if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                          $scope.listServicesPosticipo.push(temp);
                      }
                  }
                  }
              }
              $scope.listServicesAnticipo.sort(sortByTimeAscOut);
              $scope.listServicesPosticipo.sort(sortByTimeAscOut);
          }
      };
    $scope.getListServices();
    
    $scope.setEntry = function(item) {
        $scope.currData.entrata=moment(item.out,'H:mm');
        $scope.currData.entrata_display=item.out;
        $scope.manual_time=false;
        setTimeWidget();
    };

    $scope.setOut = function(item) {
        $scope.currData.uscita=moment(item.out,'H:mm');
        $scope.currData.uscita_display=item.out;
        $scope.manual_time=false;
        setTimeWidget();
    };

    $scope.openPopupEntry= function() {
      $scope.tempData=$scope.currData.entrata;
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: $filter('translate')('orario_entrata'),
              templateUrl: 'templates/week_popup_entry.html',
              cssClass: 'expired-popup',
              buttons: [
                {
                  text: $filter('translate')('cancel'),
                  type: 'button_cancel',
                  onTap: function(e) {
                    $scope.currData.entrata=$scope.tempData;
                    $scope.currData.entrata_display=moment($scope.currData.entrata).format('H:mm');
                    $scope.manual_time=false;
                  }
                },
                {
                text: $filter('translate')('Salva'),
                type: 'button_save',
                onTap: function(e) {
                    $scope.manual_time=false;
                  }
                }
            ]
            });
    }

    $scope.openPopupOut= function() {
        $scope.tempData=$scope.currData.uscita;
              var myPopup = $ionicPopup.show({
                scope: $scope,
                title: $filter('translate')('orario_uscita'),
                templateUrl: 'templates/week_popup_exit.html',
                cssClass: 'expired-popup',
                buttons: [
                  {
                    text: $filter('translate')('cancel'),
                    type: 'button_cancel',
                    onTap: function(e) {
                      $scope.currData.uscita=$scope.tempData;
                      $scope.currData.uscita_display=moment($scope.currData.uscita).format('H:mm');
                      $scope.manual_time=false;
                    }
                  },
                  {
                  text: $filter('translate')('Salva'),
                  type: 'button_save',
                  onTap: function(e) {
                      $scope.manual_time=false;
                    }
                  }
              ]
              });
      }

    $scope.manual_time=false;
    $scope.showManualTime = function(){
        $scope.manual_time=true;
    }
    $scope.setBusHour= function() {
        $scope.getSchoolNormalFascie=$filter('getSchoolNormalFascie')(profileService.getSchoolProfile().services);
        $scope.getSchoolNormalFascie.sort(sortByTimeAscOut);
        var totime='';
        var length1 =$scope.getSchoolNormalFascie.length;
        if(length1>0) totime=$scope.getSchoolNormalFascie[length1-1]['out_val'];
        if(totime=='') totime=moment('14:00','H:mm');
        totimeFormatted=moment(totime).format('H:mm');
        totimeOrig=moment(totimeFormatted,'H:mm');
        $scope.currData.uscita=totimeOrig;
        $scope.currData.uscita_display=totimeFormatted;
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
    $scope.reason_text='add_reason';
    $scope.tempCurrData={};
    $scope.babyProfile=profileService.getBabyProfile();
    $scope.busEnabled=false;
    $scope.busDefaultStop='';
    if ($scope.babyProfile.services && $scope.babyProfile.services.bus) {
        $scope.busEnabled = $scope.babyProfile.services.bus.enabled;
    }
    
    $scope.getDateString = function () {
        $scope.date = week_planService.getSelectedDateInfo();
    }
    function setTimeWidget() {
        var tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if($scope.currData.uscita !== null && $scope.currData.uscita !== undefined){
            var selectedTime = moment($scope.currData.uscita).toDate();
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24Hour = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button_save', //Optional
            closeButtonType: 'button_cancel', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,$scope.timePickerObject24Hour,'uscita');
            }
        };
        tempVal=(new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60;
        if($scope.currData.entrata !== null && $scope.currData.entrata !== undefined){
            var selectedTime = moment($scope.currData.entrata).toDate();
            tempVal=(selectedTime).getHours() * 60 * 60 + (selectedTime).getMinutes() * 60;
        }
        $scope.timePickerObject24HourEntrata = {
            inputEpochTime: tempVal, //Optional
            step: 5, //Optional
            format: 24, //Optional
            titleLabel: $filter('translate')('popup_timepicker_title'), //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'), //Optional
            setLabel: $filter('translate')('popup_timepicker_select'), //Optional
            setButtonType: 'button_save', //Optional
            closeButtonType: 'button_cancel', //Optional
            callback: function (val) { //Mandatory
                timePicker24Callback(val,$scope.timePickerObject24HourEntrata,'entrata');
            }
        };
    }

    function timePicker24Callback(val,variable,name) {
        if (typeof (val) === 'undefined') {
        } else {
            variable.inputEpochTime = val;
            var selectedTime = new Date();
            selectedTime.setHours(val / 3600);
            selectedTime.setMinutes((val % 3600) / 60);
            selectedTime.setSeconds(0);
            $scope.currData[name] = moment($filter('date')(selectedTime, 'H:mm'),'H:mm');
            $scope.currData[name+'_display'] = $filter('date')(selectedTime, 'H:mm');
        }
    }

    $scope.getFermataOptions = function(day) {
        $scope.fermataOptions.push({'stopId':'none_f'});
        if(profileService.getBabyProfile().services && profileService.getBabyProfile().services.bus && profileService.getBabyProfile().services.bus.stops){
            $scope.fermataOptions = $scope.fermataOptions.concat(angular.copy(profileService.getBabyProfile().services.bus.stops));
        }
    };
    $scope.getFermataOptions();

    $scope.getRitiroOptions = function(day) {
        $scope.ritiraOptions.push({'personId':'none','firstName':'none','relation':'none'});
        $scope.ritiraOptions=$scope.ritiraOptions.concat(angular.copy(profileService.getBabyProfile().persons));
    };
    $scope.getRitiroOptions();
    
    $scope.getActualData = function() {
        $scope.currDay=week_planService.getActualDay();
        $scope.currData=angular.copy(week_planService.getDayData($scope.currDay));
        console.log($scope.babyProfile);
        console.log($scope.currData);
        if($scope.currData.delega_name==null || $scope.currData.delega_name==undefined || $scope.currData.delega_name==''){
            $scope.currData.delega_name='none';            
        }
        if($scope.currData.absence && $scope.currData.motivazione!=null && $scope.currData.motivazione.type!=null && $scope.currData.motivazione.type!=''){
            $scope.reason_text='remove_reason';           
        }
        if($scope.currData.fermata=='' || $scope.currData.fermata==null || $scope.currData.fermata==undefined){
            $scope.currData.fermata='none_f';
        }
        if($scope.currData['uscita']!=null && $scope.currData['uscita']!=undefined)
            $scope.currData['uscita_display']=moment($scope.currData['uscita']).format('H:mm' );
        else
            $scope.currData['uscita_display']=$filter('translate')('none_f');
        if($scope.currData['entrata']!=null && $scope.currData['entrata']!=undefined)
            $scope.currData['entrata_display']=moment($scope.currData['entrata']).format('H:mm' );
        else
            $scope.currData['entrata_display']=$filter('translate')('none_f');
        setTimeWidget();
        $scope.tempCurrData=angular.copy($scope.currData);
    };
    $scope.getActualData();

    $scope.repeatDays={0:{'name':'monday','label':'monday_reduced'},
    1:{'name':'tuesday','label':'tuesday_reduced'},
    2:{'name':'wednesday','label':'wednesday_reduced'},
    3:{'name':'thursday','label':'thursday_reduced'},
    4:{'name':'friday','label':'friday_reduced'}};

    $scope.listReasons=[{'typeId':'','type':$filter('translate')('none_f')}];
    $scope.listReasonsTemp=angular.copy($scope.schoolProf.absenceTypes);
    $scope.listReasonsTemp=$filter('orderBy')($scope.listReasonsTemp, 'type');
    $scope.listReasons=$scope.listReasons.concat(angular.copy($scope.listReasonsTemp));
    
    $scope.listProblems=[{'typeId':'','type':$filter('translate')('none')}];
    $scope.listProblemsTemp=angular.copy($scope.schoolProf.frequentIllnesses);
    $scope.listProblemsTemp=$filter('orderBy')($scope.listProblemsTemp, 'type');
    $scope.listProblems=$scope.listProblems.concat(angular.copy($scope.listProblemsTemp));

    $scope.add_removeReason = function(){ 
        if($scope.reason_text=='remove_reason'){
                $scope.currData.motivazione={
                type:'',
                subtype:''
            };
            $scope.reason_text='add_reason'; 
        }
        else {
            $scope.reason_text='remove_reason';
        }
    };

    $scope.setAbsent = function(){ 
        $scope.currData.motivazione={
            type:'',
            subtype:''
        };
        if($scope.currData.absence){
            $scope.reason_text='add_reason'; 
            $scope.tempCurrData=angular.copy($scope.currData);
            $scope.currData.bus=false;
            $scope.currData.entrata=null;
            $scope.currData.uscita=null;
            $scope.currData.fermata=null;
            $scope.currData.delega_name=null;
        }
        else {
            $scope.reason_text='remove_reason';
            $scope.tempCurrData.absence=false;
            $scope.currData=angular.copy($scope.tempCurrData);
        }
    };

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
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('Avviso'),
            template: 'Sei sicuro di voler annullare le informazioni inserite?',
            buttons: [{ 
              text: $filter('translate')('cancel'),
              type: 'button_cancel',
              scope: null,
              onTap: function(e) {
              }

            }, {
              text: 'OK',
              type: 'button_save',
              onTap: function(e) {
                var getIsFromHome=week_planService.getIsFromHome();
                if(getIsFromHome){
                    $state.go('app.home');
                }else{
                    $state.go('app.week_plan');
                }
              }              
            }]
        });
        
    };

    sortByTimeAscEntry = function (lhs, rhs) {
        var results;
        results = lhs.entry_val.hours() > rhs.entry_val.hours() ? 1 : lhs.entry_val.hours() < rhs.entry_val.hours() ? -1 : 0;
        if (results === 0) results = lhs.entry_val.minutes() > rhs.entry_val.minutes() ? 1 : lhs.entry_val.minutes() < rhs.entry_val.minutes() ? -1 : 0;
        if (results === 0) results = lhs.entry_val.seconds() > rhs.entry_val.seconds() ? 1 : lhs.entry_val.seconds() < rhs.entry_val.seconds() ? -1 : 0;
        return results;
      };
    sortByTimeAscOut = function (lhs, rhs) {
        var results;
        results = lhs.out_val.hours() > rhs.out_val.hours() ? 1 : lhs.out_val.hours() < rhs.out_val.hours() ? -1 : 0;
        if (results === 0) results = lhs.out_val.minutes() > rhs.out_val.minutes() ? 1 : lhs.out_val.minutes() < rhs.out_val.minutes() ? -1 : 0;
        if (results === 0) results = lhs.out_val.seconds() > rhs.out_val.seconds() ? 1 : lhs.out_val.seconds() < rhs.out_val.seconds() ? -1 : 0;
        return results;
      };

    $scope.listServicesAnticipo=[];
    $scope.listServicesPosticipo=[];

    $scope.getListServices = function(day) {
        // provide default config for entry/exit if the school doesn't have services/fascie
        $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
        var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
        var totime=$scope.getSchoolProfileNormalConfig['toTime'];
        if(fromtime=='' && totime==''){
            fromtime=moment('7:30','H:mm');
            totime=moment('13:30','H:mm');
            fromtimeFormatted=moment(fromtime).format('H:mm');
            totimeFormatted=moment(totime).format('H:mm');
        }

        var fr='',fr2='';
        var to='',to2='';
        var serviz=[];
        if(profileService.getBabyProfile().services!==null && profileService.getBabyProfile().services.timeSlotServices!==null){
            var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
            $scope.listServicesDb=profileService.getBabyProfile().services.timeSlotServices;
            $scope.listServicesDb=$scope.listServicesDb.concat(allFascieNorm);
            for(var i=0;i<$scope.listServicesDb.length;i++){
                var type=$scope.listServicesDb[i].name;
                var enabled=$scope.listServicesDb[i].enabled;
                var regular=$scope.listServicesDb[i].regular;
                if((enabled || regular) && serviz.indexOf(type)===-1){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                for(var j=0;j<tempServ.length;j++){
                    fr=moment(tempServ[j]['fromTime']).format('H:mm');
                    to=moment(tempServ[j]['toTime']).format('H:mm');
                    var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                    'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                    'type':type};
                    $scope.listServices.push(temp);
                    if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                        $scope.listServicesAnticipo.push(temp);
                    }
                    if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                        $scope.listServicesPosticipo.push(temp);
                    }
                }
                serviz.push(type);
                }
            }
            $scope.listServicesAnticipo.sort(sortByTimeAscOut);
            $scope.listServicesPosticipo.sort(sortByTimeAscOut);
        }
        else{
            var allFascieNorm=$filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
            $scope.listServicesDb=allFascieNorm;
            for(var i=0;i<$scope.listServicesDb.length;i++){
                var type=$scope.listServicesDb[i].name;
                var enabled=$scope.listServicesDb[i].enabled;
                var regular=$scope.listServicesDb[i].regular;
                if(enabled || regular){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                for(var j=0;j<tempServ.length;j++){
                    fr=moment(tempServ[j]['fromTime']).format('H:mm');
                    to=moment(tempServ[j]['toTime']).format('H:mm');
                    var temp={'value':tempServ[j]['name'],'label':tempServ[j]['name'],
                    'entry':fr,'entry_val':moment(fr,'H:mm'),'out':to,'out_val':moment(to,'H:mm'),
                    'type':type};
                    $scope.listServices.push(temp);
                    if(moment(to,'H:mm').isBefore(moment('12:00','H:mm'))){
                        $scope.listServicesAnticipo.push(temp);
                    }
                    if(moment(to,'H:mm').isAfter(moment('12:00','H:mm'))){
                        $scope.listServicesPosticipo.push(temp);
                    }
                }
                }
            }
            $scope.listServicesAnticipo.sort(sortByTimeAscOut);
            $scope.listServicesPosticipo.sort(sortByTimeAscOut);
        }
    };
    $scope.getListServices();
    
    
    $scope.setEntry = function(item) {
        $scope.currData.entrata=moment(item.out,'H:mm');
        $scope.currData.entrata_display=item.out;
        $scope.manual_time=false;
        setTimeWidget();
    };

    $scope.setOut = function(item) {
        $scope.currData.uscita=moment(item.out,'H:mm');
        $scope.currData.uscita_display=item.out;
        $scope.manual_time=false;
        setTimeWidget();
    };

    $scope.openPopupEntry= function() {
      $scope.tempData=$scope.currData.entrata;
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: $filter('translate')('orario_entrata'),
              templateUrl: 'templates/week_popup_entry.html',
              cssClass: 'expired-popup',
              buttons: [
                {
                  text: $filter('translate')('cancel'),
                  type: 'button_cancel',
                  onTap: function(e) {
                    $scope.currData.entrata=$scope.tempData;
                    $scope.currData.entrata_display=moment($scope.currData.entrata).format('H:mm');
                    $scope.manual_time=false;
                  }
                },
                {
                text: $filter('translate')('Salva'),
                type: 'button_save',
                onTap: function(e) {
                    $scope.manual_time=false;
                  }
                }
            ]
            });
    }

    $scope.openPopupOut= function() {
        $scope.tempData=$scope.currData.uscita;
              var myPopup = $ionicPopup.show({
                scope: $scope,
                title: $filter('translate')('orario_uscita'),
                templateUrl: 'templates/week_popup_exit.html',
                cssClass: 'expired-popup',
                buttons: [
                  {
                    text: $filter('translate')('cancel'),
                    type: 'button_cancel',
                    onTap: function(e) {
                      $scope.currData.uscita=$scope.tempData;
                      $scope.currData.uscita_display=moment($scope.currData.uscita).format('H:mm');
                      $scope.manual_time=false;
                    }
                  },
                  {
                  text: $filter('translate')('Salva'),
                  type: 'button_save',
                  onTap: function(e) {
                      $scope.manual_time=false;
                    }
                  }
              ]
              });
      }

    $scope.manual_time=false;
    $scope.showManualTime = function(){
        $scope.manual_time=true;
    }
    
    $scope.setBusHour= function() {
        $scope.getSchoolNormalFascie=$filter('getSchoolNormalFascie')(profileService.getSchoolProfile().services);
        $scope.getSchoolNormalFascie.sort(sortByTimeAscOut);
        var totime='';
        var length1 =$scope.getSchoolNormalFascie.length;
        if(length1>0) totime=$scope.getSchoolNormalFascie[length1-1]['out_val'];
        if(totime=='') totime=moment('14:00','H:mm');
        totimeFormatted=moment(totime).format('H:mm');
        totimeOrig=moment(totimeFormatted,'H:mm');
        $scope.currData.uscita=totimeOrig;
        $scope.currData.uscita_display=totimeFormatted;
    }

})
.controller('Promemoria', function ($scope, moment, dataServerService, profileService , $ionicModal ,$filter, $ionicPopup,$state,$cordovaLocalNotification,week_planService) {
    $scope.days={};
    $scope.currDay = 0;
    $scope.currData = {};
    $scope.selectables=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    $scope.currData['prom_day_summary']=(localStorage.getItem('prom_day_summary') =='true' ? true : false);
    $scope.currData['prom_week']=(localStorage.getItem('prom_week') =='true' ? true : false);
    $scope.currData['prom_day_ritiro']=(localStorage.getItem('prom_day_ritiro') =='true' ? true : false);
    $scope.currData['prom_week_day']=(localStorage.getItem('prom_week_day') !== null && localStorage.getItem('prom_week_day') !== undefined ? localStorage.getItem('prom_week_day') : $scope.selectables[0]);
    $scope.kidId=profileService.getBabyProfile().kidId;
    $scope.kidFirstName=profileService.getBabyProfile().firstName;
    $scope.kidLastName=profileService.getBabyProfile().lastName;
    $scope.schoolId=profileService.getBabyProfile().schoolId;
    $scope.hourTimestamp = null;
    $scope.timePickerObject24Hour={};

    $scope.isActive =  function(type) {
        if($scope.currData[type])
        {
            return true;
        }
        return false;
    };

    function setTimeWidget() {
        var tempVal=(new Date()).getHours() * 60 * 60 ;
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
        tempVal=(new Date()).getHours() * 60 * 60 ;
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
        tempVal=30;
        if(localStorage.getItem('prom_ritiro_time') !== null && localStorage.getItem('prom_ritiro_time') !== undefined){
            tempVal=localStorage.getItem('prom_ritiro_time');
        }
        $scope.numberPickerObject = {
            inputValue: tempVal, //Optional
            minValue: 0,
            maxValue: 600,
            //precision: 3,  //Optional
            wholeStep: 15,  //Optional
            format: "WHOLE",  //Optional - "WHOLE" or "DECIMAL"
            unit: "",  //Optional - "m", "kg", "℃" or whatever you want
            titleLabel: 'Minuti',  //Optional
            setLabel: $filter('translate')('popup_timepicker_select'),  //Optional
            closeLabel: $filter('translate')('popup_timepicker_cancel'),  //Optional
            setButtonType: 'button-norm',  //Optional
            closeButtonType: 'button-stable',  //Optional
            callback: function (val) {    //Mandatory
                numberPickerCallback(val,'prom_ritiro_time');
            }
        };
        $scope.currData['prom_ritiro_time']=tempVal;
    }
    
    function timePicker24Callback(val,type,variable,name) {
        if (typeof (val) === 'undefined') {
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

    function numberPickerCallback(val,name) {
        if (typeof (val) === 'undefined') {
        } else {
            $scope.currData[name] = val;
            localStorage.setItem(name,val) ;
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
        icon: 'res://icon.png',
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
        icon: 'res://icon.png',
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
        text: $filter('translate')('notification_ritiro_text')+" "+$scope.kidFirstName+" "+$scope.kidLastName,
        icon: 'res://icon.png',
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
                //console.log(selectedTime.getHours());
                //console.log(selectedTime.getMinutes());
                day_summ.at=selectedTime;
                notific.push(day_summ);
            }
            if($scope.currData['prom_week']){
                localStorage.setItem('prom_week', true);
                temp=$scope.currData['prom_week_time'].split(':');
                var tempDay=$scope.currData['prom_week_day'];
                var next = moment();
                next.set({
                    'hour' : temp[0],
                    'minute'  : temp[1], 
                    'day' : tempDay
                 });
                var selectedTime = next.toDate();
                //console.log(selectedTime.getDate());
                //console.log(selectedTime.getDay());
                //console.log(selectedTime.getHours());
                //console.log(selectedTime.getMinutes());
                console.log(next.format('YYYY-MM-DD HH:mm'));
                week.at=selectedTime;
                notific.push(week);
            }
            if($scope.currData['prom_day_ritiro']){
                localStorage.setItem('prom_day_ritiro', true);
                temp=parseInt($scope.currData['prom_ritiro_time']);
                $scope.briefInfo=profileService.getBriefInfo();
                console.log($scope.briefInfo.ore_uscita);
                var ore_uscita = $scope.briefInfo.ore_uscita.split(':');
                var usc=moment().hour(ore_uscita[0]);
                var usc=usc.minute(ore_uscita[1]);
                //dateFrom = usc.subtract(temp[0],'hours');
                dateFrom = usc.subtract(temp,'minutes');
                var selectedTime = dateFrom.toDate();
                //console.log(selectedTime);
                //console.log(dateFrom.format('YYYY-MM-DD HH:mm'));
                ritiro.at=selectedTime;
                notific.push(ritiro);
            }

            console.log(notific);
            cordova.plugins.notification.local.schedule(notific);
            cordova.plugins.notification.local.on("click", function (notification) {
                 $state.go("app.home");
            });
            cordova.plugins.notification.local.getAll(function (notifications) {
            });
        });
        });
    }
        }    
})
