angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $rootScope, $location, $state, $filter, $q, $ionicPopup, $ionicPlatform, $ionicLoading, dataServerService, profileService, configurationService, retireService, busService, Toast, Config, pushNotificationService, messagesService, communicationsService,week_planService) {

  $scope.date = "";
  $scope.kidProfile = {};
  $scope.kidConfiguration = {};
  $scope.school = {};
  $scope.notes = {};
  $scope.communications = [];
  $rootScope.numberCommunicationsUnread = {};
  $rootScope.numberMessageUnread = {};
  $scope.fromTime = "";
  $scope.toTime = "";
  //build options
  $scope.elements = [];
  $scope.dailyFermata = null;
  $scope.dailyRitiro = null;
  $rootScope.allowed = true;
  //$rootScope.absenceLimitHours = 9;
  //$rootScope.absenceLimitMinutes = 15;
  $rootScope.retireLimit = 10;
  $scope.noConnection = false;
  $scope.gettingComm = false;
  $scope.briefInfo={};
  $scope.noConnectionMessage = $filter('translate')('home_no_connection');
  $scope.refresh = function () {
    //window.location.reload(true);
    $scope.getConfiguration();
  }

  $scope.goTo = function (location) {

    window.location.assign(location);
  }

  $scope.getDateString = function () {
    var today = new Date();
    $scope.date = today.getTime();;
  }

  var isRetireSet = function () {
    if ($scope.dailyFermata || $scope.dailyRitiro) {
      return true
    }
    return false
  }
  var isBusDisabled = function () {
    if (!$scope.kidConfiguration.services.bus.active) {
      return true
    }
    return false
  }
  var isBusSet = function () {
    if (busService.getDailyBusStop()) {
      return true
    }
    return false
  }
  var getButtonStyle = function (button) {
      if (button == "default") {
        return "button-norm"
      }
      if (button == "retire") {
        if (isRetireSet()) {
          return "button-norm";
        }
        return "button-alrt";
      }
      if (button == "bus") {
        if (isBusDisabled()) {
          return "button-stab";
        }
        if (isRetireSet()) {
          return "button-norm";
        }
        return "button-alrt";

      }
      if (button == "disabled") {
        return "button-norm disabled";
      }
    }
    //!dailyFermata">
    //        {{'home_entry_to' | translate}} {{fromTime}}{{'home_exit_to' | translate}}{{toTime}}</div>
    //    <div ng-if="dailyFermata">
    //        {{'home_entry_to' | translate}} {{fromTime}}{{'go_home_by_bus' | translate}}
    //
  var buildHome = function () {
    var style = null;
    //build the array
    $scope.elements = [];
    style = getButtonStyle("retire");
    var note = "";
    if (!$scope.isPresent) {
      note = $filter('translate')('home_absent')
    }
    if ($scope.dailyFermata) {
      note = $filter('translate')('home_entry_to') + $scope.fromTime + $filter('translate')('go_home_by_bus');
    } else if ($scope.dailyRitiro) {
      note = $filter('translate')('home_entry_to') + $scope.fromTime + $filter('translate')('home_exit_to') + $scope.toTime;
    }
    
    /*
    $scope.elements.push({
      click: "app.retire",
      string: $filter('translate')('home_retire') + $scope.kidProfile.firstName,
      note: note,
      class: style,
      img: 'img/ritiro.png',
      disabled: false
    });
    style = getButtonStyle("default");
    $scope.elements.push({
      click: "app.absence",
      string: $filter('translate')('home_assenza'),
      //            note: $filter('translate')('home_absence_before') + $rootScope.absenceLimitHours + '.' + $rootScope.absenceLimitMinutes,
      class: style,
      img: 'img/assenza.png',
      disabled: false
    });
*/

    style = ($rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId] ? "button-alrt" : "button-norm");
    $rootScope.buttonHomeCommunication = {
      click: "app.communications",
      string: $filter('translate')('home_comunicazioni'),
      note: $filter('translate')('home_comunicazioni_unread') + $rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId],
      class: style,
      img: 'img/comunicazioni.png',
      disabled: false
    };

    $scope.elements.push($rootScope.buttonHomeCommunication);
    style = ($rootScope.numberMessageUnread[$scope.kidProfile.kidId] ? "button-alrt" : "button-norm");
    $rootScope.buttonHomeMessage = {
      click: "app.messages",
      string: $filter('translate')('home_messaggi'),
      note: $filter('translate')('home_messaggi_unread') + $rootScope.numberMessageUnread[$scope.kidProfile.kidId],
      class: style,
      img: 'img/chat.png',
      disabled: false
    };

    $scope.elements.push($rootScope.buttonHomeMessage);
    style = getButtonStyle("default");
    $scope.elements.push({
      click: function () {
        $scope.call();
      },
      string: $filter('translate')('home_contatta'),
      class: style,
      img: 'img/contattaLaScuola.png',
      disabled: false
    });
    /*//if bus is available put it
    if (profileService.getBabyProfile().services.bus.enabled) {
        style = getButtonStyle("bus");
        $scope.elements.push({
            click: "app.bus",
            string: $filter('translate')('home_bus'),
            class: style,
            img: 'img/bus.png'
        });
    }*/
    /*if (profileService.getBabyProfile().services.mensa.enabled) {
        style = getButtonStyle("default");
        $scope.elements.push({
            click: "app.canteen",
            string: $filter('translate')('home_mensa'),
            class: style,
            img: 'img/mensa.png'
        });
    }*/
    $ionicLoading.hide();

  }
  var contact = function () {
    $scope.contactPopup = $ionicPopup.show({
      templateUrl: 'templates/contacts.html',
      title: $filter('translate')('contact_school'),
      scope: $scope,
      buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
        text: $filter('translate')('cancel'),
        type: 'button-norm',
        onTap: function (e) {
          $scope.contactPopup.close();
          $scope.call();
        }
              }]
    });
  }
  $scope.call = function () {
    var num = profileService.getSchoolProfile().contacts.telephone[0];
    num = num.replace(/\D/g, '');
    window.open('tel:' + num, '_system');
    if ($scope.contactPopup) {
      $scope.contactPopup.close();
    }
  }
  $scope.createNote = function () {
    $state.go('app.addnote');
    if ($scope.contactPopup) {
      $scope.contactPopup.close();
    }
  };

  $scope.checkConnection = function () {
    var deferred = $q.defer();
    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        deferred.reject();
      } else {
        deferred.resolve();

      }
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  }
  $scope.execute = function (element) {
    $scope.checkConnection().then(function () {
      if (element.class != "button-stable" && !($scope.noConnection && !$scope.isContact(element))) {
        if (typeof element.click == "string") {
          $state.go(element.click);
        } else {
          element.click();
        }
      } else {
        Toast.show($filter('translate')('home_disabledbutton'), 'short', 'bottom');
      }
    }, function (error) {
      //ricarica pagina
      $scope.noConnection = true;
      buildHome();
    });
  }

  var checkNewCommunication = function (Allcommunications, schoolId) {
    //return number of comunications from localstorage (all the new omunication not visualized get from push)
    // return pushNotificationService.getNewComunications(schoolId);
    return communicationsService.getNewComunications($filter('orderBy')(Allcommunications, '-creationDate'), schoolId);
  }
  var getBriefInfo = function (schoolId) {
    var kidId = $scope.kidProfile.kidId;
    $scope.kidname=$scope.kidProfile.firstName;
    var schoolId = $scope.kidProfile.schoolId;
    var appId = $scope.kidProfile.appId;
    week_planService.setGlobalParam(appId,schoolId);
    var currentDate = moment();
    var week=currentDate.format('w');
    var day=currentDate.format('d')-1;
    $scope.ritiraOptions=$scope.kidProfile.persons;
    var jsonTest={};
    $scope.weekInfo=[];
    $scope.getSchoolProfileNormalConfig=$filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
    var fromtime=$scope.getSchoolProfileNormalConfig['fromTime'];
    var ent=moment(fromtime).format('H:m');
    fromtime=ent.replace(/^0+/, '');
    var totime=$scope.getSchoolProfileNormalConfig['toTime'];
    var usc=moment(totime).format('H:m');
    totime=usc.replace(/^0+/, '');
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
               var ent=moment(fromtime).format('H:m');
               fromtime=ent;//fromtime.replace(/^0+/, '');
            }
            if(enabled && type=='Posticipo'){
                var tempServ=$scope.listServicesDb[i].timeSlots;
                totime=tempServ[0]['toTime'];
                var usc=moment(totime).format('H:m');
                totime=usc;//totime.replace(/^0+/, '');
            }
    }
    }
    week_planService.getWeekPlan(week,kidId).then(function (data) {
      if(data!=null && data!= undefined && data.length>0){
        var motiv_type=(data[day]['motivazione']!=undefined && data[day]['motivazione']!=null ? data[day]['motivazione']['type'] : '');
        var motiv_subtype=(data[day]['motivazione']!=undefined && data[day]['motivazione']!=null ? data[day]['motivazione']['subtype'] : '');
        jsonTest={'ore_entrata':data[day]['entrata'].replace(/^0+/, ''),'ore_uscita':data[day]['uscita'].replace(/^0+/, ''),'addressBus':'Nome Test',
        'delegaName':$filter('getRitiroName')(data[day]['delega_name'],$scope.ritiraOptions),'delegaType':$filter('getRitiroType')(data[day]['delega_name'],$scope.ritiraOptions),
        'bus':data[day]['bus'],'absence':data[day]['absence'],
        'motivazione':{type:motiv_type,subtype:motiv_subtype}
      };
        $scope.weekInfo=data;
        $scope.briefInfo= jsonTest;
        profileService.setBriefInfo($scope.briefInfo);
      }
      else{
          week_planService.getDefaultWeekPlan(kidId).then(function (data) {
            if(data!=null && data!= undefined && data.length>0){
                var motiv_type=(data[day]['motivazione']!=undefined && data[day]['motivazione']!=null ? data[day]['motivazione']['type'] : '');
               var motiv_subtype=(data[day]['motivazione']!=undefined && data[day]['motivazione']!=null ? data[day]['motivazione']['subtype'] : '');
               jsonTest={'ore_entrata':data[day]['entrata'].replace(/^0+/, ''),'ore_uscita':data[day]['uscita'].replace(/^0+/, ''),'addressBus':'Nome Test',
               'delegaName':$filter('getRitiroName')(data[day]['delega_name'],$scope.ritiraOptions),'delegaType':$filter('getRitiroType')(data[day]['delega_name'],$scope.ritiraOptions),
               'bus':data[day]['bus'],'absence':data[day]['absence'],
               'motivazione':{type:motiv_type,subtype:motiv_subtype}
             };
             $scope.weekInfo=data;
             $scope.briefInfo= jsonTest;
             profileService.setBriefInfo($scope.briefInfo);
            }else{
              jsonTest={'ore_entrata':fromtime,'ore_uscita':totime,'addressBus':'Nome Test',
              'delegaName':'','delegaType':'',
              'bus':false,'absence':false,
              'motivazione':{type:'',subtype:''}
            }
              $scope.weekInfo=data;
              $scope.briefInfo= jsonTest;
              profileService.setBriefInfo($scope.briefInfo);
          }}, function (error) {
          });
      }
  }, function (error) {
  });
  }

  $scope.gotoEditDate = function() {
    $scope.currentDate = moment();
    $scope.currWeek = $scope.currentDate.format('w');
    var day=$scope.currentDate.format('d')-1;
    var selected = moment().weekday(day).week($scope.currWeek);

    $scope.mode='edit';
    var dayData=$scope.weekInfo[day];
    for(var i=0;i<=4;i++){
      week_planService.setDayData(i,$scope.weekInfo[i],'');
    }
    dayData['monday']=false;
    dayData['tuesday']=false;
    dayData['wednesday']=false;
    dayData['thursday']=false;
    dayData['friday']=false;
    var dateFormat=selected.format('dddd D MMMM');
    week_planService.setCurrentWeek($scope.currWeek);
    week_planService.setSelectedDateInfo(dateFormat);
    week_planService.setDayData(day,dayData,$scope.mode);
    week_planService.fromHome(true);
    $state.go('app.week_edit_day', {
         day: day
    });
};

  $scope.isContact = function (element) {
    return (element.string == $filter('translate')('home_contatta'));
  }
  $rootScope.loadConfiguration = function () {
    var deferred = $q.defer();
    $ionicLoading.show();
    $scope.kidProfile = profileService.getBabyProfile();
    var schoolId = $scope.kidProfile.schoolId;
    var kidId = $scope.kidProfile.kidId;
    dataServerService.getBabyConfigurationById(schoolId, kidId).then(function (data) {
      var config = data;

      $scope.kidConfiguration = config;
      configurationService.setBabyConfiguration(config);
      //getSchoolProfile(appId, schoolId) puo' essere diversa in base al bambino
      //ottengo
      //ottengo la scuola in base alla schoolId del bambino
      dataServerService.getSchoolProfile(schoolId, kidId).then(function (data) {
        var profile = data;
        profileService.setSchoolProfile(profile);
        $scope.school = profile;
        getBriefInfo($scope.kidProfile.schoolId);
        dataServerService.getRitiro($scope.kidProfile.schoolId, $scope.kidProfile.kidId, new Date().getTime()).then(function (data) {
          $scope.dailyRitiro = data;
          dataServerService.getFermata($scope.kidProfile.schoolId, $scope.kidProfile.kidId, new Date().getTime()).then(function (data) {
            $scope.dailyFermata = data;
            if (config == null) {
              config = {
                "appId": Config.appId(),
                "schoolId": schoolId,
                "kidId": kidId,
                "services": $scope.kidProfile.services.timeSlotServices,
                  //{"anticipo": {
                  //  "active": $scope.kidProfile.services.anticipo.enabled
                  //},
                  //"posticipo": {
                 //   "active": $scope.kidProfile.services.posticipo.enabled
                 // },
                 // "bus": {
                   // "active": $scope.kidProfile.services.bus.enabled,
                   // "defaultIdGo": $scope.kidProfile.services.bus.stops[0].stopId,
                   // "defaultIdBack": $scope.kidProfile.services.bus.stops[0].stopId
                  //},
                  //"mensa": {
                   // "active": $scope.kidProfile.services.mensa.enabled
                 // }
                 //}
                "exitTime": $scope.briefInfo['ore_uscita'],
                "defaultPerson": $scope.kidProfile.persons[0].personId,
                "receiveNotification": true,
                "extraPersons": null
              }
              $scope.kidConfiguration = config;
              configurationService.setBabyConfiguration(config);
            }
            $scope.noConnection = false;
            buildHome();
            
          }, function (error) {
            console.log("ERROR -> " + error);
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $scope.noConnection = true;
            buildHome();
            $ionicLoading.hide();
            deferred.reject();

          });
        }, function (error) {
          console.log("ERROR -> " + error);
          Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
          $scope.noConnection = true;
          buildHome();
          $ionicLoading.hide();
          deferred.reject();
        });
      });



    }, function (error) {
      console.log("ERROR -> " + error);
      Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
      $scope.noConnection = true;
      buildHome();
      $ionicLoading.hide();
      deferred.reject();
    });
    return deferred.promise;
  }
  var registerPushNotification = function (data) {
    if (data) {
      var arrayOfSchoolId = [];
      for (var i = 0; i < data.length; i++) {
        if (arrayOfSchoolId.indexOf(data[i].schoolId) == -1) {
          arrayOfSchoolId.push(data[i].schoolId);
        }
      }
      pushNotificationService.register(arrayOfSchoolId);

    }
  }
  var getMessages = function () {
    var messagePromises = [];
    for (var i = 0; i < profileService.getBabiesProfiles().length; i++) {
      var kidProfile = profileService.getBabiesProfiles()[i];
      messagePromises.push(messagesService.getUnreadMessages(kidProfile.schoolId, kidProfile.kidId));
    }
    $q.all(messagePromises).then(function (values) {
      for (var i = 0; i < values.length; i++) {
        $rootScope.numberMessageUnread[profileService.getBabiesProfiles()[i].kidId] = values[i];
      }
    });
  }
  var getCommunications = function () {
    console.log("entro in getcommunications");
      var communicationPromises = [];
          if (!$scope.gettingComm) {

      $scope.gettingComm = true;
        for (var i = 0; i < profileService.getBabiesProfiles().length; i++) {
          var kidProfile = profileService.getBabiesProfiles()[i];
          communicationPromises.push(communicationsService.getCommunications($scope.kidProfile.schoolId, $scope.kidProfile.kidId));
        }
        $q.all(communicationPromises).then(function (values) {
          for (var i = 0; i < values.length; i++) {

            $rootScope.numberCommunicationsUnread[profileService.getBabiesProfiles()[i].schoolId] = checkNewCommunication(values[i], profileService.getBabiesProfiles()[i].schoolId);
                console.log("numero comunicazioni non lette"+$rootScope.numberCommunicationsUnread[profileService.getBabiesProfiles()[i].schoolId] );

          }
          $scope.gettingComm = false;
        });
      }
        console.log("ESCO DA getcommunications" +$rootScope.numberCommunicationsUnread);

    }
    //document.addEventListener("resume", onResume, false);
  $ionicPlatform.on('resume', onResume);

  function onResume() {
    // Handle the resume event
    getCommunications();
  }
  //corretto tutte e tre annidate? cosa succede se una salta? ma come faccio a settare il profilo temporaneo senza avere conf, prof????
  $scope.getConfiguration = function () {
    if (profileService.getBabiesProfiles().length == 0) {
      //parto da getBabyProfiles()(appid incluso nel server e qui ottengo schoolId e kidId
      $ionicLoading.show();
      dataServerService.getBabyProfiles().then(function (data) {
          //in data ho tutti i profili dei kids: memorizzo in locale e ottengo le configurazioni
          //tmp default $scope.kidConfiguration = data[0]; poi dovro' gestire un refresh delle informazioni quando switcho da profilo ad un altro
          //se non settato prendo il primo
          if (profileService.getBabyProfile() == null) {
            $scope.kidProfile = data[0];
            profileService.setBabiesProfiles(data);
            profileService.setBabyProfile(data[0]);
            registerPushNotification(data);
          } else {
            $scope.kidProfile = profileService.getBabyProfile();
          }
          //                    $scope.loadConfiguration($scope.kidProfile.schoolId, $scope.kidProfile.kidId);
          $scope.loadConfiguration();
          $rootScope.allowed = true;

          //get messages from last time
          //load all message from all profiles
          getMessages();


          //get communication from last time
          getCommunications();


        },
        function (error) {
          console.log("ERROR -> " + error);
          Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
          $ionicLoading.hide();
          if (error == 406) {
            $rootScope.allowed = false;
          }
        });
    } else {
      $scope.loadConfiguration();
      $rootScope.allowed = true;
      getMessages();
      getCommunications();

    }
  }

  //watch the root variables which changes in case of notifications
  $scope.$watch('numberCommunicationsUnread', function () {
    if ($scope.kidProfile && $scope.kidProfile.kidId) {
      var style = ($rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId] ? "button-alrt" : "button-norm");
      if ($rootScope.buttonHomeCommunication) {
        $rootScope.buttonHomeCommunication.note = $filter('translate')('home_comunicazioni_unread') + $rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId];
        console.log("$rootScope.numberCommunicationsUnread"+$rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId]);
        $rootScope.buttonHomeCommunication.class = style;
      }
    }
  }, true);
  $scope.$watch('numberMessageUnread', function () {
    if ($scope.kidProfile && $scope.kidProfile.kidId) {
      var style = ($rootScope.numberMessageUnread[$scope.kidProfile.kidId] ? "button-alrt" : "button-norm");
      if ($rootScope.buttonHomeMessage) {
        $rootScope.buttonHomeMessage.note = $filter('translate')('home_messaggi_unread') + $rootScope.numberMessageUnread[$scope.kidProfile.kidId];
        $rootScope.buttonHomeMessage.class = style;
      }
    }
  }, true);
  Config.init().then(function () {
    $rootScope.absenceLimitHours = Config.getAbsenceLimitHours();
    $rootScope.absenceLimitMinutes = Config.getAbsenceLimitMinutes();
  });

  $scope.getConfiguration();

});
