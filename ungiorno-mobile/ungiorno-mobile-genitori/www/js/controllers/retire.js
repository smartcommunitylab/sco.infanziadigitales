angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.retire', ['ionic-datepicker', 'ionic-timepicker'])

.controller('RetireCtrl', function ($scope, $rootScope, configurationService, profileService, dataServerService, Toast, $ionicHistory, $ionicPopup, retireService, $filter, ionicTimePicker, ionicDatePicker) {
  var retireConfiguration;
  $scope.retirePersons = [];
  $scope.babyProfile = null;
  $scope.babyConfiguration = null;
  $scope.temporary = null;
  $scope.useBus = false;
  $scope.busChecked = {
    value: false
  };
  $scope.isAbsent = false;
  $scope.schoolProfile = profileService.getSchoolProfile();
  //$scope.modifyBefore = $rootScope.retireLimit;


  $scope.getRetireTimeLimit = function (schoolProfile) {
    //return the timestamp of timelimit
    var tmpdate = new Date();
    //creo data nuova con ora configurata e setto il model della pagina
    if (schoolProfile.retireTiming) {
      tmpdate.setHours(schoolProfile.retireTiming.substring(0, 2), schoolProfile.retireTiming.substring(3, 5), 0, 0);
    } else {
      //default value is 10 am
      tmpdate.setHours(10, 0, 0, 0);
    }
    return tmpdate;
  }

  $scope.isRetireTimeLimitExpired = function (time) {
    //return true if it is expired
    var now = new Date().getTime();
    if (time < now) {
      return true;
    }
    return false;
  }
  $scope.modifyBefore = $scope.getRetireTimeLimit($scope.schoolProfile);

  function setDateWidget() {
    $scope.datePickerObject = {
      inputDate: $scope.temporary.date,
      closeLabel: $filter('translate')('timepicker_close'),
      setLabel: $filter('translate')('ok'),
      todayLabel: $filter('translate')('today'),
      mondayFirst: true,
      templateType: 'popup',
      showTodayButton: true,
      closeOnSelect: false,
      monthsList: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
      callback: function (val) {
        datePickerCallback(val);
      }
    };
  }

  function datePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Date not selected');
    } else {
      $scope.datePickerObject.inputDate = val;
      var date = new Date(val);
      $scope.temporary.date = date;
    }
  }

  function setTimeWidget() {
    $scope.timePickerObject24Hour = {
      inputTime: (($scope.temporary.time.getHours() * 60 * 60) + ($scope.temporary.time.getMinutes() * 60)),
      step: 5,
      format: 24,
      closeLabel: $filter('translate')('timepicker_close'),
      setLabel: $filter('translate')('ok'),
      setButtonType: 'button-popup',
      closeButtonType: 'button-popup',
      callback: function (val) {
        timePicker24Callback(val);
      }
    };
  }

  function timePicker24Callback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      $scope.timePickerObject24Hour.inputTime = val;
      var selectedTime = new Date();
      selectedTime.setHours(val / 3600);
      selectedTime.setMinutes((val % 3600) / 60);
      selectedTime.setSeconds(0);
      $scope.temporary.time = selectedTime;
    }
  }

  function getTime() {
    var dateInsert = new Date($scope.temporary.date);
    var timeInsert = new Date($scope.temporary.time);
    dateInsert.setHours(timeInsert.getHours(), timeInsert.getMinutes(), 0, 0);
    return dateInsert.getTime();
  }

  function getTimeForBus() {
    var dateInsert = new Date($scope.temporary.date);
    dateInsert.getHours(0, 0, 0, 0);
    return dateInsert.getTime();
  }

  function setTime(value) {
    if (value) {
      var date = new Date(value);
      // $scope.temporary.date = date;
      $scope.temporary.time = date;
    }
  }

  function setDefaultPErsonId() {
    radio[1].checked = true;
  }

  function getSelectedPersonId() {
    for (var i = 0; i < $scope.retirePersons.length; i++) {
      if ($scope.retirePersons[i].checked == true) {
        return $scope.retirePersons[i].personId;
      }
    }
    return null;
  }

  $scope.openTimePicker = function () {
    setTimeWidget();
    ionicTimePicker.openTimePicker($scope.timePickerObject24Hour);
  }

  $scope.openDatePicker = function () {
    setDateWidget();
    ionicDatePicker.openDatePicker($scope.datePickerObject);
  }

  $scope.getTimeLabel = function () {
    var day = moment($scope.temporary.time);
    var result = day.format('HH:mm');
    return result;
  }

  $scope.getDateLabel = function () {
    var day = moment($scope.temporary.date);
    var result = day.format('DD/MM/YYYY');
    return result;
  }

  $scope.checkBus = function (value) {
    $scope.useBus = value;
  }

  $scope.isUsingBus = function () {
    return $scope.useBus;
  }

  $scope.selectPerson = function (newperson) {
    for (var i = 0; i < $scope.retirePersons.length; i++) {
      if ($scope.retirePersons[i].personId == newperson.personId) {
        $scope.retirePersons[i].checked = true;
      } else {
        $scope.retirePersons[i].checked = false;
      }
    }
  }


  $scope.setRetire = function () {
    var extraperson = false;
    for (var k in $scope.babyConfiguration.extraPersons) {
      if (getSelectedPersonId() == $scope.babyConfiguration.extraPersons[k].personId) {
        extraperson = true;
      }

    }

    retireConfiguration = {
      appId: $scope.babyConfiguration.appId,
      schoolId: $scope.babyConfiguration.schoolId,
      kidId: $scope.babyConfiguration.kidId,
      date: getTime(),
      personId: getSelectedPersonId(),
      exceptional: extraperson,
      note: $scope.temporary.note
    };

    retireService.setRetire(retireConfiguration);
  };



  $scope.getRetireByDate = function (date) {
    var retirePerson = null;
    $scope.retirePersons = [];
    $scope.data = {};
    //check bus stop
    dataServerService.getFermata($scope.babyProfile.schoolId, $scope.babyProfile.kidId, date.getTime()).then(function (data) {
      var fermata = data;
      if (fermata) {
        $scope.busChecked.value = true;
        $scope.useBus = true;
        retirePerson = fermata.personId;
        for (var k in $scope.babyProfile.persons) {
          $scope.retirePersons.push({
            personId: $scope.babyProfile.persons[k].personId,
            fullName: $scope.babyProfile.persons[k].fullName,
            authorizationDeadline: $scope.babyProfile.persons[k].authorizationDeadline,
            checked: (retirePerson == $scope.babyProfile.persons[k].personId)
          })
        }
        for (var k in $scope.babyConfiguration.extraPersons) {
          $scope.retirePersons.push({
            personId: $scope.babyConfiguration.extraPersons[k].personId,
            fullName: $scope.babyConfiguration.extraPersons[k].fullName,
            authorizationDeadline: $scope.babyConfiguration.extraPersons[k].authorizationDeadline,
            checked: (retirePerson == $scope.babyConfiguration.extraPersons[k].personId)

          });
        }
      }
      //get retire conf
      dataServerService.getRitiro($scope.babyProfile.schoolId, $scope.babyProfile.kidId, date.getTime()).then(function (data) {
        retireConfiguration = data;
        if (retireConfiguration) {
          setTime(retireConfiguration.date);
          //set people to retire
          $scope.temporary.note = retireConfiguration.note;
        } else {
          //set default time
          var tmpdate = new Date($scope.temporary.date);
          if (!$scope.babyProfile.services.posticipo.enabled) {
            //creo data nuova con ora configurata e setto il model della pagina
            tmpdate.setHours(profileService.getSchoolProfile().regularTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);
            $scope.temporary.time = Date.parse(profileService.getSchoolProfile().regularTiming.toTime);
          } else {
            $scope.temporary.time = Date.parse(profileService.getSchoolProfile().posticipoTiming.toTime);
            tmpdate.setHours(profileService.getSchoolProfile().posticipoTiming.toTime.substring(0, 2), profileService.getSchoolProfile().posticipoTiming.toTime.substring(3, 5), 0, 0);

          }
          $scope.temporary.time = tmpdate;
        }
        if (!fermata) {
          $scope.busChecked.value = false;
          $scope.useBus = false;
          if (retireConfiguration && retireConfiguration.personId) {
            retirePerson = retireConfiguration.personId;
          } else {
            retirePerson = $scope.babyConfiguration.defaultPerson;
          }
          for (var k in $scope.babyProfile.persons) {
            $scope.retirePersons.push({
              personId: $scope.babyProfile.persons[k].personId,
              fullName: $scope.babyProfile.persons[k].fullName,
              authorizationDeadline: $scope.babyProfile.persons[k].authorizationDeadline,
              checked: (retirePerson == $scope.babyProfile.persons[k].personId)
            })
            if (retirePerson == $scope.babyProfile.persons[k].personId) {
              $scope.data = $scope.babyProfile.persons[k];
            }
          }
          if ($scope.babyConfiguration.extraPersons != null) {
            $scope.retirePersons.push({
              personId: $scope.babyConfiguration.extraPersons.personId,
              fullName: $scope.babyConfiguration.extraPersons.fullName,
              authorizationDeadline: $scope.babyConfiguration.extraPersons.authorizationDeadline,
              checked: (retirePerson == $scope.babyConfiguration.extraPersons.personId)
            });
            if (retirePerson == $scope.babyProfile.persons[k].personId) {
              $scope.data = $scope.babyProfile.persons[k];
            }
          }
        }
      });
    });
    //check if child is absent
    dataServerService.getAbsence($scope.babyProfile.schoolId, $scope.babyProfile.kidId, date.getTime()).then(function (response) {
      var absence = response.data;
      if (absence) {
        $scope.isAbsent = true;
      }
    });
  };
  $scope.getRetire = function () {
    $scope.babyProfile = profileService.getBabyProfile();
    $scope.babyConfiguration = configurationService.getBabyConfiguration();

    $scope.useBus = $scope.babyProfile.services.bus.enabled;

    //set default time (forget the days, because it is overwritten by new date
    $scope.temporary = {
      date: new Date(),
      time: new Date(),
      note: null
    };
    $scope.temporary.date.setHours(0, 0, 0, 0);
    $scope.temporary.time.setHours($scope.temporary.time.getHours(), $scope.temporary.time.getMinutes(), 0, 0);
    //$scope.getRetireByDate($scope.temporary.date);
    //check if time has expired, then popup
    if ($scope.isRetireTimeLimitExpired($scope.getRetireTimeLimit($scope.schoolProfile))) {
      var myPopup = $ionicPopup.show({
        title: $filter('translate')('retire_popup_toolate_title'),
        cssClass: 'expired-popup',
        template: $filter('translate')('retire_popup_toolate_text') + " " + $filter('date')($scope.modifyBefore, 'HH:mm') + "<div class\"row\"><a href=\"tel:" + profileService.getSchoolProfile().contacts.telephone[0] + "\" class=\"button button-expired-call\">" + $filter('translate')('home_contatta') + "</a></div>",
        buttons: [
          {
            text: $filter('translate')('retire_popup_absent_close'),
            type: 'button-positive'
						}
					]
      });
    }

  };

  $scope.$watch('temporary.date', function () {
    $scope.getRetireByDate($scope.temporary.date);
  });

  $scope.send = function () {
    $scope.setRetire();
    if (!retireConfiguration.personId) {
      //set default if it is not set
      retireConfiguration = $scope.babyConfiguration.defaultPerson;
      //alert("Indica chi ritira il bambino");
      //      var myPopup = $ionicPopup.show({
      //        title: $filter('translate')('retire_popup_absent_title'),
      //        template: $filter('translate')('retire_popup_person_cancel'),
      //        buttons: [
      //          {
      //            text: $filter('translate')('retire_popup_absent_cancel'),
      //            type: 'button-positive'
      //						}
      //					]
      //      });
      //return;
    }
    if ($scope.useBus) {
      var dataConfiguration = {
        appId: $scope.babyConfiguration.appId,
        schoolId: $scope.babyConfiguration.schoolId,
        kidId: $scope.babyConfiguration.kidId,
        date: getTimeForBus(),
        stopId: $scope.babyConfiguration.services.bus.defaultIdBack,
        personId: getSelectedPersonId()
      };
      dataServerService.sendFermata($scope.babyProfile.schoolId, $scope.babyProfile.kidId, dataConfiguration).then(
        function (data) {
          Toast.show($filter('translate')('retire_sendok'), 'short', 'bottom');
          console.log("SENDING OK -> " + data);
          $ionicHistory.goBack();
        },
        function (error) {
          Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
          console.log("SENDING ERROR -> " + error);
        });
    } else {
      dataServerService.sendRitiro($scope.babyProfile.schoolId, $scope.babyProfile.kidId, retireConfiguration).then(function (data) {
        Toast.show($filter('translate')('retire_sendok'), 'short', 'bottom');
        retireService.setDailyRetire(true);
        console.log("SENDING OK -> " + data);
        $ionicHistory.goBack();
      }, function (error) {
        Toast.show($filter('translate')('retire_sendno'), 'short', 'bottom');
        console.log("SENDING ERROR -> " + error);
      });
    }
  }

  $scope.showConfirm = function () {
    var now = new Date();
    var dateToModify = $scope.temporary.date;
    dateToModify.setHours(now.getHours(), now.getMinutes(), 0, 0);
    var today = new Date();
    today.setHours(23, 59, 59, 0);
    var todayMax = new Date();
    todayMax.setHours($scope.modifyBefore.getHours(), 0, 0, 0);
    if (($scope.temporary.date < today) && (dateToModify > todayMax)) {
      var myPopup = $ionicPopup.show({
        title: $filter('translate')('retire_popup_toolate_title'),
        template: $filter('translate')('retire_popup_toolate_text') + " " + $filter('date')($scope.modifyBefore, 'HH:mm'),

        buttons: [
          {
            text: $filter('translate')('retire_popup_absent_close'),
            type: 'button-positive'
						}
					]
      });
    } else if ($scope.isAbsent) {
      var myPopup = $ionicPopup.show({
        title: $filter('translate')('retire_popup_absent_title'),
        template: $filter('translate')('retire_popup_absent_text'),
        buttons: [
          {
            text: $filter('translate')('retire_popup_absent_cancel'),
            type: 'button-positive'
						},
          {
            text: $filter('translate')('retire_popup_absent_ok'),
            type: 'button-positive',
            onTap: function (e) {
              $scope.send();
            }
						}
					]
      });
    } else {
      $scope.send();
    }
  };
});
