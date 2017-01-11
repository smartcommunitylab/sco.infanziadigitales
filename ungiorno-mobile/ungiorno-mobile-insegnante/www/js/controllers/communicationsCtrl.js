angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, dataServerService, $ionicPopup, $ionicScrollDelegate, $ionicPosition, $q, $rootScope, communicationService, profileService, teachersService, Toast, $filter, $ionicLoading, $compile, $ionicPopover, $state, ionicDatePicker) {

  var selectedCommunicationIndex = -1;
  $rootScope.hideMenu = false;
  var MODE_NORMAL_LIST = "normal";
  var MODE_EDIT = "edit";
  var MODE_NEW = "new";
  // $scope.editedCommunication
  var currentMode = MODE_NORMAL_LIST;
  $scope.datepickerObject = {};
  $scope.datepickerObject.inputDate = new Date();
  //  $scope.$on('$ionicView.beforeEnter', function () {
  //    $ionicLoading.show();
  //  });
  $scope.data = {
    userPIN: ""
  }
  var monthList = [
        $filter('translate')('popup_datepicker_jan'),
        $filter('translate')('popup_datepicker_feb'),
        $filter('translate')('popup_datepicker_mar'),
        $filter('translate')('popup_datepicker_apr'),
        $filter('translate')('popup_datepicker_may'),
        $filter('translate')('popup_datepicker_jun'),
        $filter('translate')('popup_datepicker_jul'),
        $filter('translate')('popup_datepicker_ago'),
        $filter('translate')('popup_datepicker_sep'),
        $filter('translate')('popup_datepicker_oct'),
        $filter('translate')('popup_datepicker_nov'),
        $filter('translate')('popup_datepicker_dic')
    ];
  var weekDaysList = [
        $filter('translate')('popup_datepicker_sun'),
        $filter('translate')('popup_datepicker_mon'),
        $filter('translate')('popup_datepicker_tue'),
        $filter('translate')('popup_datepicker_wed'),
        $filter('translate')('popup_datepicker_thu'),
        $filter('translate')('popup_datepicker_fri'),
        $filter('translate')('popup_datepicker_sat')
    ];


  function setDateWidget() {
    $scope.datepickerObjectPopup = {
      inputDate: $scope.datepickerObject.inputDate,
      closeLabel: $filter('translate')('close'),
      setLabel: $filter('translate')('popup_datepicker_set'),
      todayLabel: $filter('translate')('popup_datepicker_today'),
      mondayFirst: true,
      templateType: 'popup',
      showTodayButton: true,
      closeOnSelect: false,
      monthList: monthList,
      callback: function (val) {
        datePickerCallbackPopup(val);
      }
    };

  }
  var datePickerCallbackPopup = function (val) {
    if (typeof (val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObjectPopup.inputDate = val;
      $scope.dateTimestamp = val;
      if ($scope.isMode(MODE_NEW)) {
        $scope.newCommunication.dateToCheck = $scope.datepickerObjectPopup.inputDate;
      } else {
        $scope.editedCommunication.dateToCheck = $scope.datepickerObjectPopup.inputDate;
      }
    }
  };
  setDateWidget();
  $scope.communicationTypes = [
    {
      typeId: "0",
      name: $filter('translate')('communication_type_without_parents'),
      checked: false
        }, {
      typeId: "1",
      name: $filter('translate')('communication_type_parents'),
      checked: true
        }
    ];
  $scope.delivery = false;
  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function (popover) {
    $scope.popover = popover;
  });
  var sortCommunications = function () {
    $scope.communications = $filter('orderBy')($scope.communications, '-creation');
  }

  var setTeachers = function () {
    //    $scope.teacher = {};
    //    $scope.teachers = teachersService.getTeachers();
    //    if ($scope.teachers) {
    //      $scope.teacher = $scope.teachers[0];
    //    }
    $scope.teacher = profileService.getTeacher();
  }
  setTeachers();
  $scope.changeTeacher = function (teacher) {
    $scope.popover.hide();
    $scope.teacher = teacher;
  }
  $scope.getDateLabel = function () {
    var day = moment($scope.datepickerObjectPopup.inputDate);
    var result = day.format('DD/MM/YYYY');
    return result;
  }
  $scope.openDatePicker = function () {
      if ($scope.delivery) {
        setDateWidget();
        ionicDatePicker.openDatePicker($scope.datepickerObjectPopup);
      }
    }
    //setTeachers();
  $ionicLoading.show();
  dataServerService.getCommunications(profileService.getSchoolProfile().schoolId).then(function (data) {
    $scope.communications = data;
    if ($scope.communications) {
      for (var i = 0; i < $scope.communications.length; i++) {
        $scope.communications[i].dateToCheck = new Date($scope.communications[i].dateToCheck);
        $scope.communications[i].creation = $scope.communications[i].creationDate;
        $scope.communications[i].creationDate = $scope.communications[i].creationDate;
      }
      sortCommunications();
    }
    $ionicLoading.hide();
  }, function (err) {
    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
    $scope.communications = [];
    $ionicLoading.hide();
  });
  $scope.initMod = function (communication) {
    for (var i = 0; i < $scope.teachers.length; i++) {
      if ($scope.teachers[i].teacherId == communication.author.id) {
        return $scope.teacher = $scope.teachers[i]
      }
    }
    $scope.teacher = $scope.teachers[0];
  }
  $scope.selectCommunication = function (index) {

    if ($scope.isMode(MODE_NORMAL_LIST)) {
      if (selectedCommunicationIndex === index) {
        selectedCommunicationIndex = -1;
      } else {
        selectedCommunicationIndex = index;
      }
    }
  }

  $scope.isMode = function (mode) {
    return currentMode === mode;
  }

  $scope.editCommunicationMode = function (index) {
    //se gia' authenticato crea, altrimenti autentica
    //    if ($rootScope.userAuth) {
    //      $scope.newCommunication = {
    //        dateToCheck: new Date(),
    //        creationDate: new Date(),
    //        description: "",
    //        doCheck: false,
    //        author: {},
    //        children: []
    //      };
    //      currentMode = MODE_NEW;
    //    } else {
    //      $scope.unlock().then(function () {
    //        $scope.newCommunication = {
    //          dateToCheck: new Date(),
    //          creationDate: new Date(),
    //          description: "",
    //          doCheck: false,
    //          author: {},
    //          children: []
    //        };
    //        currentMode = MODE_NEW;
    //      });
    //    }
    if ($scope.isMode('edit') || $scope.isMode('new')) {
      Toast.show($filter('translate')('communication_function_not_possible'), 'short', 'bottom');
      return;
    }
    if ($rootScope.userAuth) {
      var tmp = $scope.communications[index];
      $scope.editedCommunication = {
        appId: tmp.appId,
        children: tmp.children,
        communicationId: tmp.communicationId,
        author: tmp.author,
        schoolId: tmp.schoolId,
        dateToCheck: new Date(tmp.dateToCheck),
        creationDate: new Date(),
        description: tmp.description,
        doCheck: tmp.doCheck
          //children: []
      };
      currentMode = MODE_EDIT;
      selectedCommunicationIndex = index;

      $scope.delivery = $scope.editedCommunication.doCheck;

      if (document.getElementById("communication-datepicker-" + index)) {
        document.getElementById("communication-datepicker-" + index).innerHTML = "      <span class=\" communication-name\"> {{teacher.teacherFullname}} </span> <span class=\"communication-title\"> {{ 'communication_edit' | translate}} </span>            <div class=\"communication-kind\"> {{ 'communication_kind' | translate}} </div><ion-list class=\"padlist\"><div ng-repeat=\"communicationType in communicationTypes\" class=\"communication-radio\">                    <ion-radio class=\"communication-radio\" ng-class=\"communication-radio\" ng-value=\"communicationType.checked\" ng-change=\"selectType(communicationType)\" ng-checked=\"communicationType.checked\" ng-model=\"editedCommunication.doCheck\">                        {{communicationType.name}}                    </ion-radio>                    <button class=\"button button-clear button-dark button-communication-date\" ng-class=\"{'button-disabled':!delivery }\" ng-if=\"communicationType.typeId=='1'\" ng-click=\"openDatePicker() \"><span class=\"label-time-date\">{{getDateLabel()}}</span></button>                </div></ion-list>                                 <div class=\"row\">                <div class=\"col\">               <textarea ng-init=\"expandText('editdescription')\" class = \"input-communication\" placeholder=\"{{'communication_description' | translate}}\" ng-model=\"editedCommunication.description\" id=\"editdescription\" ng-keydown=\"expandText('editdescription')\">      </textarea>           </div>    </div>        <div class=\"communication-buttons\">                <button class=\"button communication-button cancel\" ng-click=\"discardCommunication()\" ng-show=\"isMode('edit') || isMode('new')\">                    {{'communication_annulla' | translate}}                </button>                <button class=\"button communication-button send\" ng-click=\"submitCommunication()\" ng-show=\"isMode('edit') || isMode('new')\">                    {{'communication_modifica' | translate}}                </button>            </div>         </div>";
        $compile(document.getElementById('communication-datepicker-' + index))($scope);
        var communication = document.getElementById("communication-datepicker-" + index);
        $scope.communicationPosition = communication.getBoundingClientRect();
      }
    } else {
      $scope.unlock('edit', $scope.communications[index], index).then(function () {

      })
    }
  }

  $scope.isCommunicationSelected = function (index) {
    return selectedCommunicationIndex === index;
  }

  $scope.someCommunicationSelected = function () {
    return selectedCommunicationIndex !== -1;
  }

  $scope.controlDateToCheck = function (index) {
    return $scope.communications[index].doCheck;
  }
  var userAutent = function (PIN) {
    var deferred = $q.defer();
    profileService.authenticatheWithPIN(profileService.getSchoolProfile().schoolId, PIN).then(function (user) {
      $scope.teacher = user;
      deferred.resolve(user);
    }, function (error) {
      if (error) {
        Toast.show($filter('translate')('user_not_auth'), 'short', 'bottom');
      } else {
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
      }
      deferred.reject(error);
    });
    return deferred.promise;
  };
  $scope.exit = function () {
    //exit  from profile and from mode
    $scope.discardCommunication();
    profileService.lock();

    Toast.show($filter('translate')('user_exit_auth'), 'short', 'bottom');

  }
  var modifyComm = function (communication, index) {
    'edit' //var tmp = $scope.communications[index];
    $scope.editedCommunication = {
      appId: communication.appId,
      children: communication.children,
      communicationId: communication.communicationId,
      author: communication.author,
      schoolId: communication.schoolId,
      dateToCheck: new Date(communication.dateToCheck),
      creationDate: new Date(),
      description: communication.description,
      doCheck: communication.doCheck,
      children: []
    };
    currentMode = MODE_EDIT;
    selectedCommunicationIndex = index;

    $scope.delivery = $scope.editedCommunication.doCheck;

    if (document.getElementById("communication-datepicker-" + index)) {
      document.getElementById("communication-datepicker-" + index).innerHTML = "      <span class=\" communication-name\"> {{teacher.teacherFullname}} </span> <span class=\"communication-title\"> {{ 'communication_edit' | translate}} </span>            <div class=\"communication-kind\"> {{ 'communication_kind' | translate}} </div><ion-list class=\"padlist\"><div ng-repeat=\"communicationType in communicationTypes\" class=\"communication-radio\">                    <ion-radio class=\"communication-radio\" ng-class=\"communication-radio\" ng-value=\"communicationType.checked\" ng-change=\"selectType(communicationType)\" ng-checked=\"communicationType.checked\" ng-model=\"editedCommunication.doCheck\">                        {{communicationType.name}}                    </ion-radio>                    <button class=\"button button-clear button-dark button-communication-date\" ng-class=\"{'button-disabled':!delivery }\" ng-if=\"communicationType.typeId=='1'\" ng-click=\"openDatePicker() \"><span class=\"label-time-date\">{{getDateLabel()}}</span></button>                </div></ion-list>                                <div class=\"row\">                <div class=\"col\">               <textarea ng-init=\"expandText('editdescription')\" class = \"input-communication\" placeholder=\"{{'communication_description' | translate}}\" ng-model=\"editedCommunication.description\" id=\"editdescription\" ng-keydown=\"expandText('editdescription')\">      </textarea>           </div>    </div>        <div class=\"communication-buttons\">                <button class=\"button communication-button cancel\" ng-click=\"discardCommunication()\" ng-show=\"isMode('edit') || isMode('new')\">                    {{'communication_annulla' | translate}}                </button>                <button class=\"button communication-button send\" ng-click=\"submitCommunication()\" ng-show=\"isMode('edit') || isMode('new')\">                    {{'communication_modifica' | translate}}                </button>            </div>         </div>";
      $compile(document.getElementById('communication-datepicker-' + index))($scope);
    }
  }


  var createNewComm = function () {
    $scope.newCommunication = {
      dateToCheck: new Date(),
      creationDate: new Date(),
      description: "",
      doCheck: false,
      author: {},
      children: []
    };
    currentMode = MODE_NEW;
  }
  $scope.unlock = function (action, communication, index) {
    var deferred = $q.defer();
    $scope.noAuthenicate = false;
    var unlockPopup = $ionicPopup.show({
      title: $filter('translate')("insert_pin_title"),
      //      template: $filter('translate')("pop_up__expired_template"),
      templateUrl: 'templates/insertPINPopup.html',
      cssClass: 'pin-popup',
      scope: $scope,
      buttons: [
        {
          text: $filter('translate')("cancel"),

        },
        {
          text: $filter('translate')("insert_pin_confim_button"),
          type: 'button-popup',
          onTap: function (e) {
            e.preventDefault();
            userAutent($scope.data.userPIN).then(function (user) {
                deferred.resolve();
                $scope.noAuthenicate = false;
                Toast.show($filter('translate')('user_auth') + user.teacherFullname, 'short', 'bottom');
                if (action == 'new') {
                  createNewComm();
                } else {
                  modifyComm(communication, index);
                }
                unlockPopup.close();
              },
              function (error) {
                deferred.reject();
                if (error) {
                  $scope.noAuthenicate = true;
                } else {
                  $scope.noAuthenicate = false;
                }
                //Toast.show($filter('translate')('user_not_auth'), 'short', 'bottom');

              });
            $scope.data.userPIN = "";
          }
        }
            ]
    });
    return deferred.promise;
  }
  $scope.openPINKeyboard = function () {
    document.getElementById('inputPIN').focus();
  }
  $scope.createCommunicationMode = function () {
    //se gia' authenticato crea, altrimenti autentica
    if ($rootScope.userAuth) {
      $scope.newCommunication = {
        dateToCheck: new Date(),
        creationDate: new Date(),
        description: "",
        doCheck: false,
        author: {},
        children: []
      };
      currentMode = MODE_NEW;
    } else {
      $scope.unlock('new').then(function () {

      });
    }
  }



  var setNormalMode = function () {
    currentMode = MODE_NORMAL_LIST;
    if (document.getElementById("communication-datepicker-" + selectedCommunicationIndex)) {
      //document.getElementById("communication-datepicker").innerHTML = "<div ng-include=\'communicationDatepicker.html\'></div>";
      document.getElementById("communication-datepicker-" + selectedCommunicationIndex).innerHTML = "";
      $compile(document.getElementById('communication-datepicker-' + selectedCommunicationIndex))($scope);
    }
  }
  $scope.discardCommunication = function () {
    setNormalMode();
    selectedCommunicationIndex = -1;
    $ionicScrollDelegate.scrollTo(0, $scope.communicationPosition.top, true);
  }

  $scope.selectType = function (newType) {


    if (newType.typeId === "0") {
      $scope.delivery = false;
    } else {
      $scope.delivery = true;

      if (document.getElementById("communication-datepicker-" + selectedCommunicationIndex)) {
        document.getElementById("communication-datepicker-" + selectedCommunicationIndex).innerHTML = "      <span class=\" communication-name\"> {{teacher.teacherFullname}} </span> <span class=\"communication-title\"> {{ 'communication_edit' | translate}} </span>            <div class=\"communication-kind\"> {{ 'communication_kind' | translate}} </div><ion-list class=\"padlist\"><div ng-repeat=\"communicationType in communicationTypes\" class=\"communication-radio\">                    <ion-radio class=\"communication-radio\" ng-class=\"communication-radio\" ng-value=\"communicationType.checked\" ng-change=\"selectType(communicationType)\" ng-checked=\"communicationType.checked\" ng-model=\"editedCommunication.doCheck\">                        {{communicationType.name}}                    </ion-radio>                    <button class=\"button button-clear button-dark button-communication-date\" ng-class=\"{'button-disabled':!delivery }\" ng-if=\"communicationType.typeId=='1'\" ng-click=\"openDatePicker() \"><span class=\"label-time-date\">{{getDateLabel()}}</span></button>                </div></ion-list>            <div class=\"row\">                <div class=\"col\">                    <textarea ng-init=\"expandText('editdescription');\" class=\"input-communication\" placeholder=\"{{'communication_description' | translate}}\" ng-model=\"editedCommunication.description\" id=\"editdescription\" ng-keydown=\"expandText('editdescription')\"  data-resizable=\"true \">      </textarea>  </div>    </div>        <div class=\"communication-buttons\">                <button class=\"button communication-button cancel\" ng-click=\"discardCommunication()\" ng-show=\"isMode('edit') || isMode('new')\">                    {{'communication_annulla' | translate}}                </button>                <button class=\"button communication-button send\" ng-click=\"submitCommunication()\" ng-show=\"isMode('edit') || isMode('new')\">                    {{'communication_modifica' | translate}}                </button>            </div>         </div>";
        $compile(document.getElementById('communication-datepicker-' + selectedCommunicationIndex))($scope);
      }
    }


  }

  $scope.deleteCommunication = function (index) {
    if ($scope.isMode('edit') || $scope.isMode('new')) {
      Toast.show($filter('translate')('communication_function_not_possible'), 'short', 'bottom');
      return;
    }

    var communicationFail = function () {
      var communicationFailPopup = $ionicPopup.show({
        title: $filter('translate')('communication_delete_fail'),
        scope: $scope,
        buttons: [
          {
            text: $filter('translate')('cancel'),
            type: 'cancel-button'


                    },
          {
            text: '<b>' + $filter('translate')('retry') + '</b>',
            type: 'create-button',
            onTap: function (e) {
              deleteFromServer();
            }
                    }
                ]
      });
    }
    var deleteFromServer = function () {
      dataServerService.deleteCommunication(profileService.getSchoolProfile().schoolId, $scope.communications[index].communicationId).then(function (data) {
        //            dataServerService.deleteCommunication(profileService.getSchoolProfile().schoolId, $scope.communications[selectedCommunicationIndex].communicationId).then(function (data) {
        //toast deleted
        Toast.show($filter('translate')('communication_deleted'), 'short', 'bottom');

        $scope.communications.splice(index, 1);
        selectedCommunicationIndex = -1;
      }, function (error) {
        if (!error) {
          Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        }
        communicationFail();
      });
    }


    var deleteConfirm = function () {
      var deleteConfirmPopup = $ionicPopup.show({
        title: $filter('translate')('communication_delete_title'),
        template: $filter('translate')("communication_delete_confirm"),
        scope: $scope,
        buttons: [
          {
            text: $filter('translate')('communication_discard'),
            type: 'cancel-button'
                    },
          {
            text: '<b>' + $filter('translate')('communication_confirm') + '</b>',
            type: 'create-button',
            onTap: function (e) {
              deleteFromServer();
            }
                    }
                ]
      });
    }

    deleteConfirm();

  }

  var updateCurrentCommunicationList = function (response) {
    var found = false;
    var i = 0;

    while (i < $scope.communications.length && !found) {
      if (response.communicationId === $scope.communications[i].communicationId) {
        $scope.communications[i] = response;
        found = true;
      }
      i++;
    }
    if (!found) { //new communication
      $scope.communications.push(response);
    }
    sortCommunications();
    $ionicLoading.hide();
  }



  $scope.submitCommunication = function () { //edit or new

    var requestFail = function () {
      var myPopup = $ionicPopup.show({
        title: $filter('translate')('communication_fail'),
        scope: $scope,
        buttons: [
          {
            text: $filter('translate')('cancel'),
            type: 'cancel-button'
                    },
          {
            text: '<b>' + $filter('translate')('retry') + '</b>',
            type: 'create-button',
            onTap: function (e) {
              $scope.submitCommunication();
            }
                    }
                ]
      });
    }

    var requestSuccess = function (data) {
      if ($scope.isMode(MODE_EDIT)) {
        $scope.communications[selectedCommunicationIndex].description = data.description;
        Toast.show($filter('translate')('communication_updated'), 'short', 'bottom');
      } else {
        Toast.show($filter('translate')('communication_sent'), 'short', 'bottom');
      }
      updateCurrentCommunicationList(data);

      //currentMode = MODE_NORMAL_LIST;
      setNormalMode();
      //scroll to the top where is the updated element
      $ionicScrollDelegate.scrollTop(true);
      if (selectedCommunicationIndex >= 0) {
        selectedCommunicationIndex = -1;
      }
    }


    if ($scope.isMode(MODE_EDIT) || $scope.isMode(MODE_NEW)) {
      if ($scope.isMode(MODE_NEW) && $scope.newCommunication.description == "") {
        Toast.show($filter('translate')('communication_empty'), 'short', 'bottom');
        return;
      }
      if ($scope.isMode(MODE_EDIT) && $scope.editedCommunication.description == "") {
        Toast.show($filter('translate')('communication_empty'), 'short', 'bottom');
        return;
      }
      if ($scope.isMode(MODE_EDIT)) {
        var tmp = JSON.parse(JSON.stringify($scope.editedCommunication));
      } else {
        var tmp = JSON.parse(JSON.stringify($scope.newCommunication));
      }
      tmp.creationDate = new Date(tmp.creationDate).getTime();
      if (tmp.creation) {
        delete tmp['creation'];
      }
      tmp.dateToCheck = new Date(tmp.dateToCheck).getTime();
      tmp.author = {
        fullname: $scope.teacher.teacherFullname,
        id: $scope.teacher.teacherId,
        name: $scope.teacher.teacherName,
        surname: $scope.teacher.teacherSurname
      }
      communicationService.addCommunication(profileService.getSchoolProfile().schoolId, tmp).then(function (data) {
        requestSuccess(data);
      }, function (data) {
        if (!data) {
          Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        }
        requestFail();
      });
    }

  }

  $scope.rende = function (index) {

  }

  $scope.expandText = function (id) {
    //var element = document.getElementById(id);

    setTimeout(function () {
      var element = document.getElementById(id);
      if (element) {
        element.style.height = element.scrollHeight + "px";
      }

    })
  }
  $scope.$watch("editedCommunication.doCheck", function (newvalue, oldvalue) {
    console.log(JSON.stringify(newvalue));
    console.log(JSON.stringify(oldvalue));
  });
  $scope.homeRedirect = function (index) {
    if ($scope.isMode('edit') || $scope.isMode('new')) {
      return;
    }
    //check connection
    $scope.checkConnection().then(function () {
      selectedCommunicationIndex = -1;
      //    communicationService.setCommunication($scope.communications[index].communicationId);
      communicationService.setCommunication($scope.communications[index]);
      communicationService.setToCheck(true);
      $state.go('app.home');
      // window.location.assign('#/app/home');
    }, function (err) {
      Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
    })

  }


});
