angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

  .controller('HomeCtrl', function ($scope, $rootScope, $location, $state, $filter, $q, $ionicPopup, $ionicPlatform, $ionicLoading, dataServerService, profileService, configurationService, retireService, busService, Toast, Config, pushNotificationService, messagesService, communicationsService, week_planService) {

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
    $scope.briefInfo = {};
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
      if (profileService.getSchoolProfile().contacts == null || profileService.getSchoolProfile().contacts == undefined) {
        alert($filter('translate')('missing_phone'));
        return;
      }
      if (profileService.getSchoolProfile().contacts.telephone.length == 0) {
        alert($filter('translate')('missing_phone'));
        return;
      }
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
      $scope.kidname = $scope.kidProfile.firstName;
      var schoolId = $scope.kidProfile.schoolId;
      var appId = $scope.kidProfile.appId;
      week_planService.setGlobalParam(appId, schoolId);
      var currentDate = moment();
      var week = currentDate.format('w');
      var day = currentDate.format('d') - 1;
      $scope.weekend = false;
      if (day == 5 || day == 6 || day == -1) {
        $scope.weekend = true;
      }
      $scope.ritiraOptions = $scope.kidProfile.persons;
      var jsonTest = {};
      $scope.weekInfo = [];

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

      // provide default config for entry/exit if the school doesn't have services/fascie
      $scope.getSchoolProfileNormalConfig = $filter('getSchoolNormalService')(profileService.getSchoolProfile().services);
      console.log($scope.getSchoolProfileNormalConfig);
      $scope.fromtime = $scope.getSchoolProfileNormalConfig['fromTime'];
      $scope.totime = $scope.getSchoolProfileNormalConfig['toTime'];
      if ($scope.fromtime == '' && $scope.totime == '') {
        alert($filter('translate')('missing_school_config'));
        $scope.fromtime = moment('7:30', 'H:mm');
        $scope.totime = moment('13:30', 'H:mm');
      }
      $scope.babyProfile = profileService.getBabyProfile();
      $scope.busEnabled = false;
      if ($scope.babyProfile.services && $scope.babyProfile.services.bus) {
        $scope.busEnabled = $scope.babyProfile.services.bus.enabled;
      }
      $scope.listServicesAnticipo = [];
      $scope.listServicesPosticipo = [];
      $scope.listServices = [];

      $scope.getListServices = function () {
        var fr = '', fr2 = '';
        var to = '', to2 = '';
        var serviz = [];
        if (profileService.getBabyProfile().services !== null && profileService.getBabyProfile().services.timeSlotServices !== null) {
          var allFascieNorm = $filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
          $scope.listServicesDb = profileService.getBabyProfile().services.timeSlotServices;
          $scope.listServicesDb = $scope.listServicesDb.concat(allFascieNorm);
          console.log($scope.listServicesDb);
          for (var i = 0; i < $scope.listServicesDb.length; i++) {
            var type = $scope.listServicesDb[i].name;
            var enabled = $scope.listServicesDb[i].enabled;
            var regular = $scope.listServicesDb[i].regular;
            if ((enabled || regular) && serviz.indexOf(type) === -1) {
              var tempServ = $scope.listServicesDb[i].timeSlots;
              for (var j = 0; j < tempServ.length; j++) {
                fr = moment(tempServ[j]['fromTime']).format('H:mm');
                to = moment(tempServ[j]['toTime']).format('H:mm');
                var temp = {
                  'value': tempServ[j]['name'], 'label': tempServ[j]['name'],
                  'entry': fr, 'entry_val': moment(fr, 'H:mm'), 'out': to, 'out_val': moment(to, 'H:mm'),
                  'type': type
                };
                $scope.listServices.push(temp);
                if (moment(to, 'H:mm').isBefore(moment('12:00', 'H:mm'))) {
                  $scope.listServicesAnticipo.push(temp);
                }
                if (moment(to, 'H:mm').isAfter(moment('12:00', 'H:mm'))) {
                  $scope.listServicesPosticipo.push(temp);
                }
              }
              serviz.push(type);
            }
          }
        }
        else {
          var allFascieNorm = $filter('getSchoolNormalSlots')(profileService.getSchoolProfile().services);
          $scope.listServicesDb = allFascieNorm;
          console.log($scope.listServicesDb);
          for (var i = 0; i < $scope.listServicesDb.length; i++) {
            var type = $scope.listServicesDb[i].name;
            var enabled = $scope.listServicesDb[i].enabled;
            var regular = $scope.listServicesDb[i].regular;
            if (enabled || regular) {
              var tempServ = $scope.listServicesDb[i].timeSlots;
              for (var j = 0; j < tempServ.length; j++) {
                fr = moment(tempServ[j]['fromTime']).format('H:mm');
                to = moment(tempServ[j]['toTime']).format('H:mm');
                var temp = {
                  'value': tempServ[j]['name'], 'label': tempServ[j]['name'],
                  'entry': fr, 'entry_val': moment(fr, 'H:mm'), 'out': to, 'out_val': moment(to, 'H:mm'),
                  'type': type
                };
                $scope.listServices.push(temp);
                if (moment(to, 'H:mm').isBefore(moment('12:00', 'H:mm'))) {
                  $scope.listServicesAnticipo.push(temp);
                }
                if (moment(to, 'H:mm').isAfter(moment('12:00', 'H:mm'))) {
                  $scope.listServicesPosticipo.push(temp);
                }
              }
            }
          }
        }
        if ($scope.listServicesAnticipo.length > 0) {
          $scope.listServicesAnticipo.sort(sortByTimeAscOut);
          $scope.fromtime = $scope.listServicesAnticipo[0]['out_val'];
        }
        if ($scope.listServicesPosticipo.length > 0) {
          $scope.listServicesPosticipo.sort(sortByTimeAscOut);
          $scope.totime = $scope.listServicesPosticipo[$scope.listServicesPosticipo.length - 1]['out_val'];
        }
        //bus precedence for exit time by default
        console.log($scope.busEnabled);
        if ($scope.busEnabled) {
          $scope.getSchoolNormalFascie = $filter('getSchoolNormalFascie')(profileService.getSchoolProfile().services);
          $scope.getSchoolNormalFascie.sort(sortByTimeAscOut);
          var length1 = $scope.getSchoolNormalFascie.length;
          if (length1 > 0) $scope.totime = $scope.getSchoolNormalFascie[length1 - 1]['out_val'];
          if ($scope.totime == '') $scope.totime = moment('14:00', 'H:mm');
          totimeFormatted = moment($scope.totime).format('H:mm');
          $scope.totime = moment($scope.totime, 'H:mm');
        }
        var infoInitial = { 'fromTime': $scope.fromtime, 'toTime': $scope.totime };
        profileService.setInfoInitial(infoInitial);
      };
      $scope.getListServices();
      // week_planService.setNotification($scope);
      week_planService.getWeekPlan(week, kidId).then(function (data) {
        if (data != null && data != undefined && data.length > 0 && !$scope.weekend) {
          var motiv_type = (data[day]['motivazione'] != undefined && data[day]['motivazione'] != null ? data[day]['motivazione']['type'] : '');
          var motiv_subtype = (data[day]['motivazione'] != undefined && data[day]['motivazione'] != null ? data[day]['motivazione']['subtype'] : '');
          jsonTest = {
            'ore_entrata': data[day]['entrata'], 'ore_uscita': data[day]['uscita'], 'addressBus': data[day]['fermata'],
            'delegaName': $filter('getRitiroName')(data[day]['delega_name'], $scope.ritiraOptions), 'delegaType': $filter('getRitiroType')(data[day]['delega_name'], $scope.ritiraOptions),
            'bus': data[day]['bus'], 'absence': data[day]['absence'],
            'motivazione': { type: motiv_type, subtype: motiv_subtype }
          };
          $scope.weekInfo = data;
          jsonTest['ore_entrata'] = moment(jsonTest['ore_entrata']).format('H:mm');
          jsonTest['ore_uscita'] = moment(jsonTest['ore_uscita']).format('H:mm');
          $scope.briefInfo = jsonTest;
          profileService.setBriefInfo($scope.briefInfo);
          $scope.modifyBefore = $scope.getRetireTimeLimit();
        }
        else {
          week_planService.getDefaultWeekPlan(kidId).then(function (data) {
            if (data != null && data != undefined && data.length > 0 && !$scope.weekend) {
              var motiv_type = (data[day]['motivazione'] != undefined && data[day]['motivazione'] != null ? data[day]['motivazione']['type'] : '');
              var motiv_subtype = (data[day]['motivazione'] != undefined && data[day]['motivazione'] != null ? data[day]['motivazione']['subtype'] : '');
              jsonTest = {
                'ore_entrata': data[day]['entrata'], 'ore_uscita': data[day]['uscita'], 'addressBus': data[day]['fermata'],
                'delegaName': $filter('getRitiroName')(data[day]['delega_name'], $scope.ritiraOptions), 'delegaType': $filter('getRitiroType')(data[day]['delega_name'], $scope.ritiraOptions),
                'bus': data[day]['bus'], 'absence': data[day]['absence'],
                'motivazione': { type: motiv_type, subtype: motiv_subtype }
              };
              $scope.weekInfo = data;
              jsonTest['ore_entrata'] = moment(jsonTest['ore_entrata']).format('H:mm');
              jsonTest['ore_uscita'] = moment(jsonTest['ore_uscita']).format('H:mm');
              $scope.briefInfo = jsonTest;
              profileService.setBriefInfo($scope.briefInfo);
              $scope.modifyBefore = $scope.getRetireTimeLimit();
            } else {
              jsonTest = {
                'ore_entrata': moment(fromtime).format('H:mm'), 'ore_uscita': moment($scope.totime).format('H:mm'), 'addressBus': '',
                'delegaName': 'none', 'delegaType': 'none',
                'bus': false, 'absence': false,
                'motivazione': { type: '', subtype: '' }
              }
              var dataTemp = { "entrata": fromtime, "uscita": $scope.totime, 'bus': false, 'absence': false, 'motivazione': { type: '', subtype: '' }, "monday": false, "tuesday": false, "wednesday": false, "thursday": false, "friday": false };
              $scope.weekInfo = [dataTemp, dataTemp, dataTemp, dataTemp, dataTemp];
              $scope.briefInfo = jsonTest;
              profileService.setBriefInfo($scope.briefInfo);
              $scope.modifyBefore = $scope.getRetireTimeLimit();
            }
          }, function (error) {
          });
        }
      }, function (error) {
      });
    }
    $scope.gotoChat = function () {
      $state.go('app.messages');
      $scope.TempPrevent.close();
    }
    $scope.callSchool = function () {
      if (profileService.getSchoolProfile().contacts == null || profileService.getSchoolProfile().contacts == undefined) {
        alert($filter('translate')('missing_phone'));
        return;
      }
      if (profileService.getSchoolProfile().contacts.telephone.length == 0) {
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

    $scope.gotoEditDate = function () {
      var temp = $scope.isRetireTimeLimitExpired();
      if ($scope.weekend) {
        Toast.show($filter('translate')('no_feature_weekend'), 'short', 'bottom');
        return;
      }
      else if (temp) {
        $scope.TempPrevent = $ionicPopup.show({
          title: $filter('translate')('retire_popup_toolate_title'),
          cssClass: 'expired-popup',
          scope: $scope,
          template: $filter('translate')('retire_popup_toolate_text') + " " + moment($scope.modifyBefore).format('HH:mm') + "<div class\"row\"><span ng-click=\"callSchool();\"  class=\"button button-expired-call\">" + $filter('translate')('home_contatta') + "</span></div>"
          + "<div class\"row\"><span ng-click=\"gotoChat();\"  class=\"button button-expired-call\">" + $filter('translate')('send_msg') + "</span></div>",
          buttons: [
            {
              text: $filter('translate')('retire_popup_absent_close'),
              type: 'button-positive'
            }
          ]
        });
      } else {
        $scope.currentDate = moment();
        $scope.currWeek = $scope.currentDate.format('w');
        var day = $scope.currentDate.format('d') - 1;
        var selected = moment().weekday(day).week($scope.currWeek);

        $scope.mode = 'edit';
        console.log($scope.weekInfo);
        var dayData = $scope.weekInfo[day];
        for (var i = 0; i <= 4; i++) {
          if ($scope.weekInfo[i]['uscita'] != null && $scope.weekInfo[i]['uscita'] != undefined)
            $scope.weekInfo[i]['uscita_display'] = moment($scope.weekInfo[i]['uscita']).format('H:mm');
          if ($scope.weekInfo[i]['entrata'] != null && $scope.weekInfo[i]['entrata'] != undefined)
            $scope.weekInfo[i]['entrata_display'] = moment($scope.weekInfo[i]['entrata']).format('H:mm');
          week_planService.setDayData(i, $scope.weekInfo[i], '');
        }
        dayData['monday'] = false;
        dayData['tuesday'] = false;
        dayData['wednesday'] = false;
        dayData['thursday'] = false;
        dayData['friday'] = false;
        var dateFormat = selected.format('dddd D MMMM');
        week_planService.setCurrentWeek($scope.currWeek);
        week_planService.setSelectedDateInfo(dateFormat);
        week_planService.setDayData(day, dayData, $scope.mode);
        week_planService.fromHome(true);
        $state.go('app.week_edit_day', {
          day: day
        });
      }
    };

    $scope.isContact = function (element) {
      return (element.string == $filter('translate')('home_contatta'));
    }

    $scope.getRetireTimeLimit = function () {
      var temp = moment('17:00', 'HH:mm');//it should be 09:10
      //if ($scope.briefInfo.ore_uscita!==null && $scope.briefInfo.ore_uscita!==undefined) {
      //  temp= moment($scope.briefInfo.ore_uscita,'HH:mm');
      //}
      return temp;
    }

    $scope.isRetireTimeLimitExpired = function () {
      console.log($scope.modifyBefore);
      return moment($scope.modifyBefore).isBefore(moment());
    }

    $rootScope.loadConfiguration = function () {
      var deferred = $q.defer();
      $ionicLoading.show();
      $scope.kidProfile = profileService.getBabyProfile();
      // week_planService.setNotification($scope);
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
                  "services": $scope.kidProfile.services,
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
              //Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
              $scope.noConnection = true;
              buildHome();
              $ionicLoading.hide();
              deferred.reject();

            });
          }, function (error) {
            console.log("ERROR -> " + error);
            //Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $scope.noConnection = true;
            buildHome();
            $ionicLoading.hide();
            deferred.reject();
          });
        });



      }, function (error) {
        console.log("ERROR -> " + error);
        //Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
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
            console.log("numero comunicazioni non lette" + $rootScope.numberCommunicationsUnread[profileService.getBabiesProfiles()[i].schoolId]);

          }
          $scope.gettingComm = false;
        });
      }
      console.log("ESCO DA getcommunications" + $rootScope.numberCommunicationsUnread);

    }
    //document.addEventListener("resume", onResume, false);
    $ionicPlatform.on('resume', onResume);

    function onResume() {
      // Handle the resume event
      getCommunications();
    }
    //corretto tutte e tre annidate? cosa succede se una salta? ma come faccio a settare il profilo temporaneo senza avere conf, prof????
    $scope.getConfiguration = function () {
      console.log(profileService.getBabiesProfiles());
      if (profileService.getBabiesProfiles().length == 0) {
        //parto da getBabyProfiles()(appid incluso nel server e qui ottengo schoolId e kidId
        $ionicLoading.show();
        dataServerService.getBabyProfiles().then(function (data) {
          //in data ho tutti i profili dei kids: memorizzo in locale e ottengo le configurazioni
          //tmp default $scope.kidConfiguration = data[0]; poi dovro' gestire un refresh delle informazioni quando switcho da profilo ad un altro
          //se non settato prendo il primo
          console.log(profileService.getBabyProfile());
          console.log(data);
          if (profileService.getBabyProfile() == null) {
            $scope.kidProfile = data[0];
            profileService.setBabiesProfiles(data);
            profileService.setBabyProfile(data[0]);
            registerPushNotification(data);
          } else {
            $scope.kidProfile = profileService.getBabyProfile();
          }
          console.log(profileService.getBabyProfile());
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
            $scope.noConnection = true;
            //Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
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
          console.log("$rootScope.numberCommunicationsUnread" + $rootScope.numberCommunicationsUnread[$scope.kidProfile.schoolId]);
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
