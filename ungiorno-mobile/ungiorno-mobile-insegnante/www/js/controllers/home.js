angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.home', [])

  .controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, $filter, $q, $state, Toast, $ionicModal, $ionicLoading, moment, teachersService, sectionService, communicationService, Config, $ionicSideMenuDelegate, $ionicPopup, $rootScope, loginService, pushNotificationService, $ionicHistory) {
    $scope.sections = null;
    $scope.section = null;
    $scope.childrenConfigurations = [];
    $scope.childrenProfiles = [];
    $scope.childrenNotes = [];
    $scope.availableChildren = [];
    $scope.totalChildrenNumber = [];
    $rootScope.numberMessageUnread = {};
    $scope.colors = [];
    $scope.noteExpanded = false;
    $scope.teachersNote = true;
    $scope.parentsNote = false;
    $scope.newNoteExpandend = false;
    $scope.communicationExpanded = false;
    $scope.schoolProfile = null;
    $scope.numberOfChildren = 0;
    $scope.communications = [];
    $scope.noConnection = false;
    $scope.numberOfDeliveries = 0;
    // $scope.communicationTocheck = {};

    $scope.childrenCommunicationDelivery = null;
    $scope.selectedNote = false;
    $scope.data = {
      communication: ""
    };
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      //if I come from login, initialize
      if (fromState.name == 'app.login') {

        $scope.initialize();
        sectionService.setSection(null);

      }
    });

    function contains(a, obj) {
      var i = a.length;
      while (i--) {
        if (a[i] === obj) {
          return true;
        }
      }
      return false;
    }
    $scope.calculateNumberDeliveriesByClass = function (classID) {
      $scope.numberOfDeliveries = 0;
      if ('all' === classID) {
        $scope.numberOfDeliveries = $scope.childrenCommunicationDelivery.length;
      } else {
        //check deliveries id with current babies id
        for (var i = 0; i < $scope.childrenProfiles['allPeriod'].length; i++) {
          if (contains($scope.childrenCommunicationDelivery, $scope.childrenProfiles['allPeriod'][i].kidId)) {
            $scope.numberOfDeliveries++;
          }
        }
      }
    }
    $scope.$on('$ionicView.beforeEnter', function () {
      if (communicationService.getToCheck()) {
        //expand side menu on communication
        $scope.openCommunications();
        //hide sidemenu
        $rootScope.hideMenu = true;
        if (communicationService.getCommunication()) {
          $scope.data = {
            communication: communicationService.getCommunication().communicationId,
            description: communicationService.getCommunication().description,
            dateToCheck: new Date(communicationService.getCommunication().dateToCheck),
            creationDate: new Date(communicationService.getCommunication().creationDate),
            groupId: communicationService.getCommunication().groupId
          }
        };
        $scope.childrenCommunicationDelivery = communicationService.getCommunication().children;
        //$scope.numberOfDeliveries = $scope.childrenCommunicationDelivery.length;
      }
      if ($scope.communicationExpanded) {
        $ionicSideMenuDelegate.canDragContent(false);
      }
    });

    $scope.getDateString = function () {
      var today = new Date();
      $scope.date = today.getTime();;
    }
    $scope.viewClose = function () {
      return $scope.noteExpanded || $scope.communicationExpanded;
    }

    $scope.cancelNotesAndComm = function () {
      $state.go('app.communications').then(function () {
        //$ionicLoading.hide();
        communicationService.setToCheck(false);
      });
    }

    $scope.closeNotesAndComm = function () {
      if ($scope.communicationExpanded) {
        //popup;
        var myPopup = $ionicPopup.show({
          title: $filter('translate')('comm_you_must_save_title'),
          template: $filter('translate')('comm_you_must_save_text'),
          scope: $scope,
          buttons: [
            {
              text: $filter('translate')('ok'),
              type: 'cancel-button',
              onTap: function (e) {
                $scope.communicationExpanded = false;

              }
            }
          ]
        });

      } else {
        $scope.noteExpanded = false;
        $scope.teachersNote = true;
        $scope.parentsNote = false;
        $scope.newNoteExpandend = false;
      }
      //put the same list of children on the check
    }

    $scope.saveNotesAndComm = function () {
      //    $scope.noteExpanded = false;
      //    $scope.communicationExpanded = false;
      //    $scope.teachersNote = true;
      //    $scope.parentsNote = false;
      //    $scope.newNoteExpandend = false;
      $ionicLoading.show();
      //save the new list
      var communication = communicationService.getCommunication();
      if (communication.creationDate instanceof Date) {
        communication.creationDate = new Date(communication.creationDate).getTime();
      }
      if (communication.dateToCheck instanceof Date) {
        communication.dateToCheck = new Date(communication.dateToCheck).getTime();
      }
      //          tmp.creationDate = new Date(tmp.creationDate).getTime();
      //      if (tmp.creation) {
      //        delete tmp['creation'];
      //      }
      //      tmp.dateToCheck = new Date(tmp.dateToCheck).getTime();
      communication.children = $scope.childrenCommunicationDelivery;
      dataServerService.modifyCommunication($scope.schoolProfile.schoolId, communicationService.getCommunication().coomunicationId, communication).then(function (data) {
        Toast.show($filter('translate')('communication_modified'), 'short', 'bottom');
        communicationService.modifyCommunication(communication);
        $state.go('app.communications').then(function () {
          //$ionicLoading.hide();
          communicationService.setToCheck(false);
          $scope.noteExpanded = false;
          $scope.communicationExpanded = false;
          $scope.teachersNote = true;
          $scope.parentsNote = false;
          $scope.newNoteExpandend = false;
        });
      }, function (data) {
        Toast.show($filter('translate')('communication_not_modified'), 'short', 'bottom');
        //      communicationService.setToCheck(false);
        //      $scope.noteExpanded = false;
        //      $scope.communicationExpanded = false;
        //      $scope.teachersNote = true;
        //      $scope.parentsNote = false;
        //      $scope.newNoteExpandend = false;
        $ionicLoading.hide();
      });
    }
    $scope.data = {
      communication: null
    };
    $scope.newNote = {
      possibleChildrens: [],
      associatedKids: [],
      search: '',
      kidIds: [],
      showHints: false
    };

    $scope.hintSearchBoxFocus = false;
    $scope.hintPanelFocus = false;

    $scope.focused = function (searchbox, state) {
      if (searchbox) {
        $scope.hintSearchBoxFocus = state;
      } else {
        $scope.hintPanelFocus = state;
      }
    }

    $scope.displayHint = function () {
      return $scope.hintSearchBoxFocus || $scope.hintPanelFocus;
    }


    $scope.search = function () {
      if ($scope.newNote.search != "") {
        profileService.searchChildrenBySection($scope.newNote.search, $scope.section).then(
          function (children) {
            $scope.newNote.possibleChildrens = children;
          }
        )
      } else {
        $scope.newNote.possibleChildrens = [];
      }
    }

    var getPeriodToNow = function () {
      var period = '';
      var now = moment();
      for (var i = 0; i < $scope.listServices.length; i++) {
        $scope.currService = $scope.listServices[i];
        beforeTime = $scope.currService.entry_val;
        afterTime = $scope.currService.out_val;
        if (moment(now, 'H:mm').isBetween(beforeTime, afterTime)) {
          period = $scope.currService.value;
          console.log(period);
          break;
        }
      }
      return period;
    }

    $scope.title = moment().locale('it').format("dddd, D MMMM gggg");
    //  $scope.checkConnection = function () {
    //    var deferred = $q.defer();
    //    if (window.Connection) {
    //      if (navigator.connection.type == Connection.NONE) {
    //        deferred.reject();
    //      } else {
    //        deferred.resolve();
    //
    //      }
    //    };
    //return deferred.promise;
    // }
    $scope.refreshHome = function () {
      //$scope.checkConnection().then(function () {
      $scope.initialize();
      $scope.noConnection = false;
    }, function (err) {
      //Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
      //  $scope.showNoConnection();
      //  $scope.noConnection = true;
      //});
    }
    $scope.initialize = function () {
      //    $ionicLoading.show({
      //      template: $filter('translate')('loading_data')
      //    });
      $ionicLoading.show();
      $scope.title = $filter('date')(new Date(), 'EEEE, dd MMMM yyyy'); // cat - profile teacher

      $scope.listServices = [];
      $scope.listServicesAnticipo = [];
      $scope.listServicesPosticipo = [];
      $scope.cnt = 0;
      dataServerService.getSchoolProfileForTeacher().then(function (schoolProfile) {
        $scope.cnt++;
        if (schoolProfile && $scope.cnt < 2) {
          $scope.schoolProfile = schoolProfile;
          $scope.datePosticipo = new Date();
          console.log($scope.schoolProfile.services);
          $scope.listServicesDb = $scope.schoolProfile.services;
          $scope.getSchoolProfileNormalConfig = $filter('getSchoolNormalService')($scope.listServicesDb);
          console.log($scope.getSchoolProfileNormalConfig);
          var fromtime = $scope.getSchoolProfileNormalConfig['fromTime'];
          var totime = $scope.getSchoolProfileNormalConfig['toTime'];
          if (fromtime == '' && totime == '') {
            // alert($filter('translate')('missing_school_config'));
            fromtime = moment('7:30', 'H:mm');
            totime = moment('13:30', 'H:mm');
          }
          totimeFormatted = moment(totime).format('H:mm');
          fromtimeFormatted = moment(fromtime).format('H:mm');
          var temp = {
            'value': 'Normale', 'label': 'Normale',
            'entry': fromtimeFormatted, 'out': totimeFormatted,
            'type': 'Normale'
          };

          for (var i = 0; i < $scope.listServicesDb.length; i++) {
            var type = $scope.listServicesDb[i].name;
            var enabled = $scope.listServicesDb[i].enabled;
            if (true) {
              var tempServ = $scope.listServicesDb[i].timeSlots;
              for (var j = 0; j < tempServ.length; j++) {
                fr = moment(tempServ[j]['fromTime']).format('H:mm');
                to = moment(tempServ[j]['toTime']).format('H:mm');
                var temp = { 'value': tempServ[j]['name'], 'entry': fr, 'entry_val': moment(fr, 'H:mm'), 'out': to, 'out_val': moment(to, 'H:mm'), 'type': type };
                $scope.listServices.push(temp);
                $scope.colors[temp['value']] = 'white';
                if (moment(fr, 'H:mm').isBefore(moment(fromtimeFormatted, 'H:mm'))) {
                  $scope.listServicesAnticipo.push(temp);
                }
                if (moment(to, 'H:mm').isAfter(moment(totimeFormatted, 'H:mm'))) {
                  $scope.listServicesPosticipo.push(temp);
                }
              }
            }
          }

          sortByTimeAsc = function (lhs, rhs) {
            var results;
            results = lhs.entry_val.hours() > rhs.entry_val.hours() ? 1 : lhs.entry_val.hours() < rhs.entry_val.hours() ? -1 : 0;
            if (results === 0) results = lhs.entry_val.minutes() > rhs.entry_val.minutes() ? 1 : lhs.entry_val.minutes() < rhs.entry_val.minutes() ? -1 : 0;
            if (results === 0) results = lhs.entry_val.seconds() > rhs.entry_val.seconds() ? 1 : lhs.entry_val.seconds() < rhs.entry_val.seconds() ? -1 : 0;
            return results;
          };

          $scope.listServices = $scope.listServices.sort(sortByTimeAsc)
          profileService.setSchoolProfile($scope.schoolProfile);

          pushNotificationService.register($scope.schoolProfile.schoolId);

          dataServerService.getSections($scope.schoolProfile.schoolId, true).then(function (data) {
            if (data != null) {
              //order by sectionName
              $scope.sections = $filter('orderBy')(data, 'sectionName');
              $rootScope.sharedSections = data;
              //select period after all data has been selected
              if ($rootScope.selectedPeriod == null) {
                $rootScope.selectedPeriod = getPeriodToNow();
              }
              if (sectionService.getSection() == null) {
                $scope.section = $scope.sections[0];
                sectionService.setSection(0);
              } else {
                $scope.changeSection(sectionService.getSection());
              }
              $scope.getChildrenByCurrentSection();
              $scope.loadNotes();
              $ionicLoading.hide();
              if (!$scope.communicationExpanded) {
                Toast.show($filter('translate')('data_updated'), 'short', 'bottom');
              }
            }

          }, function (err) {
            //manage error sections
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
            $scope.noConnection = true;
          })
          dataServerService.getTeachers($scope.schoolProfile.schoolId).then(function (data) {
            teachersService.setTeachers(data);
            // select the right teacher
            for (var k = 0; k < data.length; k++) {
              if (data[k].username == localStorage.username) {
                $scope.selectedTeacher = data[k];
                $scope.title += ' - ' + $scope.selectedTeacher.teacherFullname;
              }
            }


            //                if (localStorage.name || localStorage.surname) {
            //                    $scope.title += ' - ' + localStorage.name + ' ' + localStorage.surname;
            //                }
            teachersService.setSelectedTeacher($scope.selectedTeacher);
            console.log($scope.selectedTeacher);
            $ionicLoading.hide();

          }, function (err) {
            //manage error teachers
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
            $scope.noConnection = true;
          });
        } else {
          $ionicLoading.hide();

        }
        if ($scope.schoolProfile) {
          communicationService.getCommunicationsFromServer($scope.schoolProfile.schoolId).then(function (data) {
            $scope.communications = [];
            if (data) {
              for (var i = 0; i < data.length; i++) {
                if (data[i].doCheck) {
                  $scope.communications.push(data[i]);
                }
              }
            }
            //manage kids' profiles with notifications for messages
            //check if parameter is sent otherwise take the first
            /*$scope.data.communication = $scope.communications[0].communicationId;
            $scope.changeCommunication($scope.data.communication);*/
          }, function (err) {
            //manage error communications
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
            $scope.noConnection = true;
          });
        }
      }, function (err) {
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        $ionicLoading.hide();
        $scope.noConnection = true;
      });


    };

    $scope.getClassByPeriod = function (child, selectedPeriod) {
      switch (selectedPeriod) {
        case 'anticipo':

          if (child.exitTime != null && child.anticipo.enabled) {
            //presente se iscritto ad anticipo e non assente
            return 'child-presente';
          } else return 'child-assente';
          break;
        case 'mensa':
          //totale di bambini iscritti a scuola
          if (child.exitTime != null) {
            //presente se iscritto e non assente
            return 'child-presente';
          } else return 'child-assente';
          break;
        case 'posticipo':

          if (child.exitTime != null && child.exitTime > $scope.datePosticipo.getTime() && child.posticipo.enabled) {
            //presente se iscritto  a posticipo e non assente e non ritirto prima dell'inizio del posticipo

            return 'child-presente';
          } else return 'child-assente';
          break;
      }
    }
    $scope.openParentsNotes = function () {
      $scope.parentsNote = true;
      $scope.teachersNote = false;
      $scope.newNoteExpandend = false;
    }

    $scope.openTeacherNotes = function () {
      $scope.parentsNote = false;
      $scope.teachersNote = true;
      $scope.newNoteExpandend = false;
    }

    $scope.createNotes = function () {
      $scope.parentsNote = false;
      $scope.teachersNote = false;
      $scope.newNoteExpandend = true;
    }

    $scope.cancelNewNote = function () {
      $scope.newNoteExpandend = false;
      $scope.parentsNote = false;
      $scope.teachersNote = true;
    }


    //when select is clicked
    $scope.changeCommunication = function (communicationId) {
      communicationService.setCommunicationById(communicationId);
      $scope.childrenCommunicationDelivery = communicationService.getCommunication().children;
      $scope.numberOfDeliveries = $scope.childrenCommunicationDelivery.length;
    }
    $scope.getChildrenDeliveryByID = function (id) {
      if ($scope.communicationExpanded && $scope.childrenCommunicationDelivery != null) {
        if ($scope.childrenCommunicationDelivery.indexOf(id) >= 0)
          return true
        return false
      }
      return false
    }
    $scope.switchChildrenDeliveryByID = function (childId) {
      // if ($scope.childrenCommunicationDelivery.indexOf(id) >= 0) {
      //se presente rimuovi, se assente aggiungi
      //var childrenID = $scope.childrenProfiles[id].kidId
      var index = -1;
      if ($scope.childrenCommunicationDelivery) {
        index = $scope.childrenCommunicationDelivery.indexOf(childId);
        if (index > -1) {
          $scope.childrenCommunicationDelivery.splice(index, 1);
          //remove delivery
          $scope.numberOfDeliveries--;
        } else {
          $scope.childrenCommunicationDelivery.push(childId);
          //add delivery
          $scope.numberOfDeliveries++;
        }
      }


    }
    //  $scope.showNoConnection = function () {
    //    var alertPopup = $ionicPopup.alert({
    //      title: $filter('translate')("signal_send_no_connection_title"),
    //      template: $filter('translate')("signal_send_no_connection_template"),
    //      cssClass: 'no-connection-popup',
    //      buttons: [
    //        {
    //          text: $filter('translate')("signal_send_toast_alarm"),
    //          type: 'button-custom'
    //            }
    //        ]
    //    });
    //
    //    alertPopup.then(function (res) {
    //      console.log('no place');
    //    });
    //  };
    $scope.detailOrCommunication = function (child) {
      if (!child.partecipateToSperimentation) {
        Toast.show($filter('translate')('child_not_partecipate'), 'short', 'bottom');
        return;
      }
      //$scope.checkConnection().then(function () {

      //se modalita' communication, modifico lista consegne e poi confermo
      //altrimenti openDetail(index)
      if (child.active) {
        if ($scope.communicationExpanded) {
          $scope.switchChildrenDeliveryByID(child.kidId)
        } else {
          $scope.openDetail(child);
        }
      } else {
        Toast.show($filter('translate')('child_not_partecipate'), 'short', 'bottom');
      }
      // }, function (err) {
      //  $scope.showNoConnection();

      // })
    }
    $scope.communicationDone = function (childId) {
      //se sono in modalita' communication e id contenuto nella lista attuale return true

      if ($scope.communicationExpanded && communicationService.childSelectedCommunication(childId)) {
        return true;
      }
      return false;
    }
    $scope.getChildrenByCurrentSection = function () {
      //get children info
      $scope.childrenProfiles = [];
      for (var j = 0; j < $scope.listServices.length; j++) {
        fasciaName = $scope.listServices[j]['value'];
        $scope.getChildrenNumber(fasciaName);
      }
      $scope.getChildrenProfilesByPeriod($rootScope.selectedPeriod);
    }
    var getAllChildren = function () {
      var allchildren = [];
      for (var i = 0; i < $scope.sections.length; i++) {
        allchildren = allchildren.concat($scope.sections[i].children);
      }
      return allchildren;
    }
    $scope.isThisSection = function (sectionId) {
      if (sectionId != 'all') {
        return sectionService.getSection() === sectionId;
      } else {
        return sectionService.getSection() === -1;
      }

    }
    $scope.changeSection = function (sectionId) {
      sectionService.setSection(sectionId);
      //if (sectionId != -1) {
      if (sectionId != 'all' && sectionId != -1) {
        $scope.section = $scope.sections[sectionId];
        $scope.getChildrenByCurrentSection();
      } else {
        //section == allchildren
        sectionService.setSection(-1);

        $scope.section = {
          appId: "a",
          schoolId: "a",
          sectionId: "all",
          sectionName: "All",
          children: getAllChildren()
        }
        $scope.getChildrenByCurrentSection();
      }
      $scope.loadNotes();
      //id I'm in delivery mode
      if ($scope.childrenCommunicationDelivery != null) {
        $scope.calculateNumberDeliveriesByClass(sectionId);
      }
    }

    var injectBabyInformationsInNote = function (note) {
      if (note.kidIds !== null) {
        note.kids = [];

        var kidToFind = note.kidIds.length;
        var sectionChildrenIndex = 0;
        while (kidToFind !== 0 && sectionChildrenIndex < $scope.section.children.length) {
          for (var i = 0; i < note.kidIds.length; i++) {
            if ($scope.section.children[sectionChildrenIndex].kidId === note.kidIds[i]) {
              var baby = {
                kidId: $scope.section.children[sectionChildrenIndex].kidId,
                image: $scope.section.children[sectionChildrenIndex].image,
                name: $scope.section.children[sectionChildrenIndex].childrenName

              }
              note.kids.push(baby);
              kidToFind--;
            }
          }
          sectionChildrenIndex++;
        }
      }
    }
    var updateMsg = function (unreadMsgs) {
      if (!$rootScope.numberMessageUnread) {
        $rootScope.numberMessageUnread = {};
      }
      for (var schoolClass in unreadMsgs) {
        if (unreadMsgs.hasOwnProperty(schoolClass)) {
          for (var kid in unreadMsgs[schoolClass]) {
            if (unreadMsgs[schoolClass].hasOwnProperty(kid)) {
              // $scope.msg[kid] = unreadMsgs[schoolClass][kid];
              $rootScope.numberMessageUnread[kid] = unreadMsgs[schoolClass][kid];
            }
          }
        }
      }
    }
    $scope.loadNotes = function () {
      dataServerService.getUnreadMessages($scope.schoolProfile.schoolId).then(function (data) {
        console.log(JSON.stringify(data));
        //put the icon of new messages on the right children
        updateMsg(data);
      });
    }

    $scope.isBabyAssignedToNote = function (note) {
      var asd = note.kidIds !== null;
      return note.kidIds !== null;
    }

    $scope.openDetailById = function (childId) {
      var found = false;
      var i = 0;
      var child;
      while (!found && i < $scope.section.children.length) {
        if ($scope.section.children[i].kidId === childId) {
          child = $scope.section.children[i];
          found = true;
        }
        i++;
      }
      $scope.openDetail(child);
    }

    $scope.openDetail = function (child) {
      profileService.setCurrentBaby(child);
      window.location.assign('#/app/babyprofile');
    }

    $scope.openNotes = function () {
      if (!$scope.noteExpanded) {
        $scope.noteExpanded = true;
        $scope.communicationExpanded = false;

      } else {
        $scope.noteExpanded = false;
      }
    }
    $scope.openCommunications = function () {
      if (!$scope.communicationExpanded) {
        $scope.communicationExpanded = true;
        $scope.noteExpanded = false;

      } else {
        $scope.communicationExpanded = false;

      }
    }

    $scope.changeHorizzontalLineStyle = function (period) {
      if (!$scope.communicationExpanded) {
        var leftLine = document.getElementById("leftLine");
        var rightLine = document.getElementById("rightLine");
        switch (period) {
          case 'anticipo':
            leftLine.style.width = "15%";
            rightLine.style.width = "81%";
            break;
          case 'mensa':
            leftLine.style.width = "48%";
            rightLine.style.width = "48%";
            break;
          case 'posticipo':
            leftLine.style.width = "82%";
            rightLine.style.width = "14%";
            break;
        }
      }
    };

    $scope.getChildrenProfilesByPeriod = function (periodOfTheDay) {
      $scope.childrenProfiles[periodOfTheDay] = [];
      if (!$scope.childrenProfiles['allPeriod']) {
        $scope.childrenProfiles['allPeriod'] = [];
      }
      console.log($scope.section);
      for (var i = 0; i < $scope.listServices.length; i++) {
        $scope.colors[$scope.listServices[i]['value']] = 'white';
      }
      $scope.colors[periodOfTheDay] = '#98ba3c';
      console.log($scope.colors);
      if ($scope.section != null) {
        for (var i = 0; i < $scope.section.children.length; i++) {
          //create string child[selectedPeriod].presenza
          // IF ABSENT, SHOW WITH "ABSENT" MESSAGE
          if ($scope.section.children[i].exitTime == null) {
            $scope.section.children[i].presenza = $filter('translate')('absent');
            // IF PRESENT BUT NOT FOR THIS SLOT, HIDE IT
          } else if ($scope.section.children[i].slotPresent.indexOf(periodOfTheDay) < 0 && $scope.section.children[i].notPresent.indexOf(periodOfTheDay) < 0) {
            continue;
          } else {
            var oraUscita = new Date($scope.section.children[i].exitTime);
            var oraEntrata = new Date($scope.section.children[i].entryTime);
            var busActive = $scope.section.children[i].bus.active;
            //$scope.section.children[i].presenza = $filter('translate')('exit_to') + $filter('date')(oraUscita, 'HH:mm');
            $scope.section.children[i].presenza = moment(oraUscita).format('H:mm');
            $scope.section.children[i].oraEntrata = moment(oraEntrata).format('H:mm');
            $scope.section.children[i].busActive = busActive;
          }
          //retrieve all fascie of Kid active services
          var kidFascieNames = $scope.section.children[i].fascieNames;
          if (kidFascieNames !== null && kidFascieNames != undefined && kidFascieNames.indexOf(periodOfTheDay) !== -1) {
            $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
            console.log($scope.section.children[i]);
          }

          //putNotification($scope.section.children[i]):
          //console.log($scope.childrenProfiles[periodOfTheDay]);

          /*switch (periodOfTheDay) {
          case 'anticipo':
            if ($scope.section.children[i][periodOfTheDay].enabled) {
              //aggiungi se iscritto al servizio
              $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
            }
            break;
          case 'mensa':
            //totale di bambini iscritti a scuola
            $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
            break;
          case 'posticipo':
            if ($scope.section.children[i][periodOfTheDay].enabled) {
              //totalNumber++;
              $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
            }
            break;
          }*/
          $scope.childrenProfiles['allPeriod'].push($scope.section.children[i]);
        }
        $scope.childrenProfiles[periodOfTheDay] = $filter('orderBy')($scope.childrenProfiles[periodOfTheDay], 'childrenName');
        $scope.childrenProfiles['allPeriod'] = $filter('orderBy')($scope.childrenProfiles['allPeriod'], 'childrenName');
      }
    }
    $scope.isNotNow = function (child) {
      if (child.notPresent.indexOf($scope.selectedPeriod) < 0)
        return false;
      return true;
    }
    $scope.getNowDate = function () {
      return Date.now()
    }
    $scope.getChildrenNumber = function (periodOfTheDay) {
      $scope.totalChildrenNumber[periodOfTheDay] = 0;
      $scope.availableChildren[periodOfTheDay] = 0;

      if ($scope.section != null) {
        for (var i = 0; i < $scope.section.children.length; i++) {
          var kid = $scope.section.children[i];
          console.log();
          var kidFascieNames = kid.fascieNames;
          var idx = kidFascieNames !== null && kidFascieNames != undefined ? kidFascieNames.indexOf(periodOfTheDay) : -1;
          if (idx !== -1) {
            $scope.totalChildrenNumber[periodOfTheDay]++;
            // add to present only if kid is present and his presence overlaps with the slot
            if (kid.slotPresent.indexOf(periodOfTheDay) >= 0) {
              $scope.availableChildren[periodOfTheDay]++;
            }
          }
        }
      }
    }



    //    return true if the actual time is the same of the period
    $scope.isNow = function (periodOfTheDay) {
      if ($scope.schoolProfile) {
        //var now = $filter('date')(new Date(), 'HH:mm'); //bad workaround, but current schoolprofile timings aren't timestamps!
        var now = moment().format('H:mm');
        $scope.currService = {};
        for (var i = 0; i < $scope.listServices.length; i++) {
          if ($scope.listServices[i]['value'] == periodOfTheDay) {
            $scope.currService = $scope.listServices[i];
          }
        }
        if (moment(now, 'H:mm').isAfter($scope.currService.entry_val) && moment(now, 'H:mm').isBefore($scope.currService.out_val)) {
          return true;
        }
        return false;
      }

    }

    $scope.getLineStroke = function (getNumberChildren, totalNumberOfChildren) {
      var lineStroke = null;
      lineStroke = (250 / totalNumberOfChildren) * getNumberChildren;
      return lineStroke + ",250";
    }
    $scope.getStrokeWith = function (children) {
      var lineStroke = 13;
      if (children == 0) {
        lineStroke = 0
      }
      return lineStroke;
    }
    $scope.sectionColor = function (period) {
      if (period == $rootScope.selectedPeriod)
        return '#abc';
      return '#ddd';
    }

    $scope.changeSectionPeriod = function (period) {
      $rootScope.selectedPeriod = period;
      $scope.getChildrenProfilesByPeriod(period);
      //$scope.changeHorizzontalLineStyle(period);    
    }

    $scope.getChildImage = function (child) {
      var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + $scope.schoolProfile.schoolId + "/" + child.kidId + "/true/imagesnew";
      return image;
    }


    //$scope.refreshHome();
  });
