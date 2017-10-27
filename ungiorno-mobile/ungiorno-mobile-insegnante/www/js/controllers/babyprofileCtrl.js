angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, dataServerService, profileService, babyConfigurationService, Config, $q, $filter, Toast, $location, $ionicLoading, $rootScope, $ionicPopup, $ionicPopover, $interval, $ionicScrollDelegate, teachersService, messagesService) {

  var IS_PARENT = 'parent';
  var IS_TEACHER = 'teacher';
  $scope.all = 10;
  $scope.teacher = {};
  $scope.newMessage = {
    text: ""
  };

  $scope.userAction = false;
  var isBackground = function () {
    return $rootScope.background;
  }
  var typing = undefined;
  $scope.showLoader = function () {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: false,
      maxWidth: 200,
      showDelay: 0,
    });
    $scope.dataLoaded = false;
  };
  //  $scope.inputUp = function () {
  //    $scope.newMessage.text = ' ';
  //  }
  $scope.checkBusServiceActive = function () {
    return $scope.babyInformations.bus.enabled && $scope.babyInformations.stopId != null;
  }
  var getBusStopAddressByID = function (busStopID) {
    for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
      if ($scope.babyProfile.services.bus.stops[i].stopId === busStopID) {
        return $scope.babyProfile.services.bus.stops[i].address;
      }
    }

  }
  var getParents = function (babyProfile) {
    parents = [];
    for (var i = 0; i < babyProfile.persons.length; i++) {
      if (babyProfile.persons[i].parent)

        parents.push(babyProfile.persons[i])
    }
    return parents;
  }
  var getOtherPeople = function (babyProfile) {
    otherPeople = [];
    for (var i = 0; i < babyProfile.persons.length; i++) {
      if (!babyProfile.persons[i].parent)

        otherPeople.push(babyProfile.persons[i])
    }
    return otherPeople;
  }
  var checkAllDataLoaded = function () {
    if ($scope.babyProfileLoaded) {
      //        if ($scope.babyProfileLoaded && $scope.notesLoaded) {
      $scope.calculateOtherData();
      $scope.dataLoaded = true;
      $ionicLoading.hide();
    }
  }
  var setTeachers = function () {
    $scope.teachers = teachersService.getTeachers();
    if ($scope.teachers) {
      $scope.teacher = $scope.teachers[0];
    }

  }
  var getSubType = function (typeID) {
    for (var i = 0; i < $scope.schoolProfile.frequentIllnesses.length; i++) {
      if ($scope.schoolProfile.frequentIllnesses.typeId == typeID) {
        return $scope.schoolProfile.frequentIllnesses.type;
      }
    }
    return '';
  }
  $scope.startTyping = function () {
    // Don't send notification if we are still typing or we are typing a private message
    //if (angular.isDefined(typing) || $scope.sendTo != "everyone") return;
    if (angular.isDefined(typing)) return;
    typing = $interval(function () {
      $scope.stopTyping();
    }, 3000);

    messagesService.send("/topic/toparent." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", {}, JSON.stringify({
      //username: $scope.username,
      typing: true
    }));
  };

  $scope.stopTyping = function () {
    if (angular.isDefined(typing)) {
      $interval.cancel(typing);
      typing = undefined;

      messagesService.send("/topic/toparent." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", {}, JSON.stringify({
        //username: $scope.username,
        typing: false
      }));
    }
  };

  $scope.messageInit = function () {
    if (!$rootScope.messages) {
      $rootScope.messages = {};
    }
    $scope.end_reached = false;
    messagesService.getMessages(null, null, $scope.babyProfile.schoolId, $scope.babyProfile.kidId).then(function (data) {
      if (data) {
        $rootScope.messages[$scope.babyProfile.kidId] = data.slice().reverse(); //turn the order from top to bottom
        $ionicScrollDelegate.scrollBottom();
        $ionicLoading.hide();

      } else {
        $ionicLoading.hide();
        console.log("no messages received");
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
      }
    }, function (error) {
      $ionicLoading.hide();
      console.log(error);
      Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
    });
    messagesService.init(Config.getServerURL() + '/chat');
    messagesService.connect(function (frame) {

        //          messages seen
        if (!messagesService.alreadySubscribed("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".seen")) {
          messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".seen", function (message) {
            console.log(message);
            if (message.body && messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body)) {
              messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body).seen = true;

            }
            //set message to seen
          });
        }
        //message received
        if (!messagesService.alreadySubscribed("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".received")) {
          messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".received", function (message) {
            console.log(message);
            console.log(message);
            if (message.body && messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body)) {
              messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body).received = true;

            }
          });
        }
        //            user is typing
        if (!messagesService.alreadySubscribed("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing")) {
          messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", function (message) {
            $scope.userAction = JSON.parse(message.body);
            $ionicScrollDelegate.resize();
            if ($scope.isBottom()) {
              $ionicScrollDelegate.scrollBottom();
            }
            //                if (parsed.username == $scope.username) return;
            //
            //                for (var index in $scope.participants) {
            //                    var participant = $scope.participants[index];
            //
            //                    if (participant.username == parsed.username) {
            //                        $scope.participants[index].typing = parsed.typing;
            //                    }
            //                }
          });
        }

        //get new message
        if (!messagesService.alreadySubscribed("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId)) {
          messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId, function (message) {
            console.log(message);
            if (message.body) {
              var chatMessage = JSON.parse(message.body);
              var newMessage = {
                  "appId": Config.appId(),
                  "schoolId": chatMessage.content.schoolId,
                  "author": chatMessage.content.author,
                  "messageId": chatMessage.content.messageId,
                  "kidId": chatMessage.content.kidId,
                  "teacherId": chatMessage.content.teacherId,
                  "sender": "parent",
                  "creationDate": chatMessage.timestamp,
                  "received": true,
                  "seen": true,
                  "text": chatMessage.description
                }
                //avoid duplicated messages

              if (chatMessage.content.schoolId && chatMessage.content.kidId && chatMessage.content.messageId && $rootScope.messages[chatMessage.content.kidId] && chatMessage.content.messageId != $rootScope.messages[chatMessage.content.kidId].messageId) {
                $rootScope.messages[chatMessage.content.kidId].push(newMessage);
                messagesService.receivedMessage(chatMessage.content.schoolId, chatMessage.content.kidId, chatMessage.content.messageId);
                if (!isBackground()) {
                  messagesService.seenMessage(chatMessage.content.schoolId, chatMessage.content.kidId, chatMessage.content.messageId);
                }
              }
              $ionicScrollDelegate.scrollBottom();
            }
          });

        }
      },
      function (error) {
        console.log('Connection error ' + error);

      });
  }
  $scope.isBottom = function () {

    var currentTop = $ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top;
    var maxScrollableDistanceFromTop = $ionicScrollDelegate.$getByHandle('handler').getScrollView().__maxScrollTop;

    if (currentTop >= maxScrollableDistanceFromTop) {
      return true;
    }
    return false;
  };


  $scope.init = function () {
    $scope.parents = [];
    $scope.newNote = {
      argument: "",
      description: ""
    }

    $scope.babyProfileLoaded = false;
    $scope.notesLoaded = false;
    $scope.dataLoaded = false;
    $scope.showLoader();
    $scope.data = {
      userPIN: ""
    }
    $scope.schoolProfile = profileService.getSchoolProfile();
    $scope.babyInformations = profileService.getCurrentBaby();
    //setTeachers();
    $scope.teacher = profileService.getTeacher();
    $scope.relation = "";
    var babyProfileID = $scope.babyInformations.kidId;

    //Acquiring data from server
    profileService.getBabyProfileById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
      if (data) {
        $scope.babyProfile = data;
        $scope.parents = getParents(data);
        $scope.otherPeople = getOtherPeople(data);
        $scope.babyProfileLoaded = true;
        if ($scope.babyInformations.absenceSubtype != '') {
          for (var i = 0; i < $scope.schoolProfile.frequentIllnesses.length; i++) {
            if ($scope.schoolProfile.frequentIllnesses[i].typeId == $scope.babyInformations.absenceSubtype) {
              $scope.absenceSubtype = $scope.schoolProfile.frequentIllnesses[i].type;
            }
          }
          if (!$scope.absenceSubtype) {
            $scope.absenceSubtype = '';
          }
          //$scope.absenceSubtype = getSubtype($scope.babyInformations.absenceSubtype);
        }
        checkAllDataLoaded();
        $scope.messageInit();
        $ionicLoading.hide();

      } else {
        $ionicLoading.hide();
        console.log("No profile received");
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
      }
    }, function (err) {
      console.log(err);
      Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
      $ionicLoading.hide();
    });
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function (popover) {
      $scope.popover = popover;
    });
  }
  $scope.calculateOtherData = function () {

    console.log($scope.babyInformations);
    $scope.babyEnterHour = $scope.babyInformations.oraEntrata;
    //used to get if the baby is present
    var now = moment('HH:mm');
    if ($scope.babyInformations.exitTime == null) {
      $scope.babyStatus = $filter('translate')('absent');
    } else {
      console.log($scope.babyInformations.exitTime);
      var exitDayWithHour = moment($scope.babyInformations.exitTime).format('H:mm'); 
      console.log(now.isAfter(moment(exitDayWithHour,'HH:mm')));
      console.log(now);console.log(exitDayWithHour);
      $scope.babyStatus = now.isAfter(moment(exitDayWithHour,'HH:mm')) ? $filter('translate')('exit') : $filter('translate')('present');
    }

    if ($scope.checkBusServiceActive()) {
      $scope.babyBusStopBackName = $scope.babyInformations.stopId;
    }
    for (var i = 0; i < $scope.babyProfile.persons.length; i++) {
      if ($scope.babyProfile.persons[i].personId == $scope.babyInformations.personId)
        if (!$scope.babyProfile.persons[i].parent) {
          $scope.relation = $scope.babyProfile.persons[i].relation;
        } else {
          $scope.relation = $filter('translate')('relation_parent');

        }
    }
  }


  //Custom methods
  $scope.callPhone = function (number) {
    console.log("Calling " + number);
    document.location.href = 'tel:' + number;
  }

  $scope.sendTeacherNote = function () {
    //temporarly disabled
    //if ($scope.newNote.argument === "") {
    //Toast.show($filter('translate')('select_argument'), 'short', 'bottom');
    // } else
    if ($scope.newNote.description === "") {
      Toast.show($filter('translate')('type_description'), 'short', 'bottom');
    } else { //all data are correct
      //            var note = {
      //                date: new Date().getTime(),
      //                schoolNotes: [
      //                    {
      //                        type: $scope.newNote.argument.typeId,
      //                        note: $scope.newNote.description
      //                    }
      //                ]
      //            }
      var note = {
        "kidId": $scope.babyProfile.kidId,
        "teacherId": $scope.teacher.teacherId,
        "text": $scope.newMessage.text
      }
      var requestFail = function () {
        var myPopup = $ionicPopup.show({
          title: $filter('translate')('note_sent_fail'),
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
                $scope.sendTeacherNote();
              }
                        }
                    ]
        });
      }

      var requestSuccess = function (data) {
        Toast.show($filter('translate')('note_sent_success'), 'short', 'bottom');
        $scope.newNote.argument = "";
        $scope.newNote.description = "";
        //update the new notes

        if (data != null && data.data != null && data.data.schoolNotes != null) {
          if (!$scope.notes) {
            $scope.notes = {};
          }
          $scope.notes.schoolNotes = data.data.schoolNotes;
        }
        if (data != null && data.data != null && data.data.parentNotes != null) {
          if (!$scope.notes) {
            $scope.notes = {};
          }
          $scope.notes.parentNotes = data.data.parentNotes;
        }
      }


      dataServerService.addNewNoteForParents($scope.schoolProfile.schoolId, $scope.babyProfile.kidId, $scope.teacher.teacherId, note).then(function (data) {
        requestSuccess(data);
      }, function (data) {
        requestFail();
      });
    }

  }
  $scope.changeTeacher = function (teacher) {
    $scope.popover.hide();
    $scope.teacher = teacher;
  }

  $scope.loadMore = function () {
    if (!$scope.loading) {
      $scope.loading = true;
      //      if ($rootScope.messages[$scope.babyProfile.kidId][0]) {
      try {
        messagesService.getMessages($rootScope.messages[$scope.babyProfile.kidId][0].creationDate - 1, $scope.all, $scope.babyProfile.schoolId, $scope.babyProfile.kidId).then(function (data) {
            if (data) {
              var newmessages = data.slice();
              //var newmessages = data;

              if (!!$rootScope.messages[$scope.babyProfile.kidId]) {
                for (var i = 0; i < newmessages.length; i++)
                  $rootScope.messages[$scope.babyProfile.kidId].unshift(newmessages[i]);
              } else {
                $rootScope.messages[$scope.babyProfile.kidId] = newmessages;
              }
              // $rootScope.messages = !!$rootScope.messages ? $rootScope.messages.concat(newmessages) : newmessages;
              if ($rootScope.messages[$scope.babyProfile.kidId].length == 0) {
                $scope.emptylist = true;
              }
              if (data.length >= $scope.all) {
                $scope.end_reached = false;
              } else {
                $scope.end_reached = true;
              }
            } else {
              $scope.emptylist = true;
              $scope.end_reached = true;
              Toast.show($filter('translate')("pop_up_error_server_template"), "short", "bottom");

            }
            $scope.loading = false;

          },
          function (err) {

            $scope.end_reached = true;
            $scope.loading = false;

          });
      } catch (err) {
        $scope.emptylist = true;
        $scope.end_reached = true;
        $scope.loading = false;
      }
    }
    //    $scope.loading = false;
  };
  $scope.refresh = function () {
    if ($ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top == 0 && !$scope.end_reached) {
      //refresh
      $scope.loadMore();
    }
  }


  $scope.sendMessage = function (text) {
    if (text != null && text != '') {
      //create message
      $scope.stopTyping();
      $ionicLoading.show();
      //$scope.newMessage;
      //      messagesService.sendMessage($scope.babyProfile.schoolId, $scope.babyProfile.kidId, $scope.teacher.teacherId, text).then(
      messagesService.sendMessage($scope.babyProfile.schoolId, $scope.babyProfile.kidId, profileService.getTeacher().teacherId, text).then(
        function (msg) {
          // init(); temporary commented. why reinitialize the list?
          $rootScope.messages[$scope.babyProfile.kidId] = $rootScope.messages[$scope.babyProfile.kidId].concat(msg);
          $ionicLoading.hide();
          $scope.newMessage.text = '';
          $ionicScrollDelegate.scrollBottom();
          $scope.resetText();
        },
        function (err) {
          $ionicLoading.hide();
          console.log(err);
          Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        }
      );
    }

    $ionicScrollDelegate.scrollBottom();

  };
  $scope.isANewDate = function (indexOfMessage) {
    if (indexOfMessage == 0) {
      return true;
    }
    var date = $filter('date')($rootScope.messages[$scope.babyProfile.kidId][indexOfMessage].creationDate, 'dd,MM,yyyy');
    var previousdate = $filter('date')($rootScope.messages[$scope.babyProfile.kidId][indexOfMessage - 1].creationDate, 'dd,MM,yyyy');

    if (date != previousdate) {
      return true;

    }
    return false;
  }
  $scope.$on("$destroy", function () {

    messagesService.finish();
  });
  $scope.isMe = function (id) {
    if (id == IS_TEACHER) {
      return true;
    }
    return false;
  }

  $scope.expandText = function () {
    var element = document.getElementById("txtnotes");
    if (element) {
      element.style.height = element.scrollHeight + "px";
    }
    element = document.getElementById("txtfooter");
    if (element) {
      element.style.height = element.scrollHeight + "px";
    }


  }
  $scope.resetText = function () {
    var element = document.getElementById("txtnotes");
    if (element) {
      element.style.height = "60px";
    }
    element = document.getElementById("txtfooter");
    if (element) {
      element.style.height = "60px";
    }
  }
  var counter = 0;
  $scope.checkMessage = function (message) {

    if (!message.received) {
      //set received
      messagesService.receivedMessage(message.schoolId, message.kidId, message.messageId);
    }
    if (!message.seen) {
      //set seen
      messagesService.seenMessage(message.schoolId, message.kidId, message.messageId);
    }
  }
  $scope.getProfileImage = function () {
    if ($scope.babyProfile) {
      var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + $scope.schoolProfile.schoolId + "/" + $scope.babyProfile.kidId + "/true/images";
      return image;
    } else return "";
  }
  var userAutent = function (PIN) {
    var deferred = $q.defer();
    profileService.authenticatheWithPIN($scope.schoolProfile.schoolId, PIN).then(function (user) {
      $scope.teacher = user;
      Toast.show($filter('translate')('user_auth') + user.teacherFullname, 'short', 'bottom');
      deferred.resolve();
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
    profileService.lock();
    Toast.show($filter('translate')('user_exit_auth'), 'short', 'bottom');
  }

  function addZerotoPin() {
    $scope.data.userPIN = $scope.data.userPIN.toString();
    while ($scope.data.userPIN.length != 4)
      $scope.data.userPIN = "0" + $scope.data.userPIN;
  }
  $scope.unlock = function () {
    $scope.noAuthenicate = false;
    //open the ionic popup for authentication
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
            addZerotoPin();
            userAutent($scope.data.userPIN).then(function () {
              $scope.data.userPIN = "";
              $scope.noAuthenicate = false;
              unlockPopup.close();
            }, function (error) {
              $scope.data.userPIN = "";
              if (error) {
                $scope.noAuthenicate = true;
              } else {
                $scope.noAuthenicate = false;
              }
              $scope.openPINKeyboard();
            });
          }
          }
          ]
    });

  }
  $scope.openPINKeyboard = function () {
    document.getElementById('inputPIN').focus();
  }
  window.addEventListener('native.keyboardshow', function () {
    var element = document.getElementById("chat-footer");
    if (element) {
      element.style.bottom = "60px";
    }
    $ionicScrollDelegate.resize();
  });
  window.addEventListener('native.keyboardhide', function () {
    var element = document.getElementById("chat-footer");
    if (element) {
      element.style.bottom = "0px";
    }
  });
  $scope.init();
  $ionicScrollDelegate.resize();
});
