angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.notification', [])


//
//A Service to work with notifications with server
//
.factory('pushNotificationService', function ($q, $http, $rootScope, $ionicPlatform, $ionicScrollDelegate, $filter, Config, dataServerService, profileService, messagesService, $state) {

  var RECEIVED_MESSAGE = "RECEIVED_MESSAGE";
  var RECEIVED_COMMUNICATIONS = "RECEIVED_COMMUNICATIONS";
  var pushNotificationService = {};

  //set behaviour of local notification click: change context, go to the right page and delete entry in the local storage

  $ionicPlatform.ready(function () {
    cordova.plugins.notification.local.on("click", function (notification) {
      if (notification && notification.data) {
        //manage kind of notification if message or communication
        if (JSON.parse(notification.data)["content.type"] == "chat") {
          switchProfileFromBackground(notification, true, true).then(function () {
            if ($state.is('app.messages')) {
              $state.go($state.current, {}, {
                reload: true
              });
            } else {
              $state.go("app.messages");
            }

            deleteMessageFromStorage(notification.id, JSON.parse(notification.data)["content.kidId"]);
          });


        } //manage different kids
        else {
          switchProfileFromBackground(notification, false, true).then(function () {
            if ($state.is('app.communications')) {
              $state.go($state.current, {}, {
                reload: true
              });
            } else {
              $state.go("app.communications");
            }
            deleteCommunicationFromStorage(notification.id, JSON.parse(notification.data)["content.schoolId"]);
            //delete entry from localstorage});


          });
        }
      }
    });
  });


  //check is messages are present in the local storage
  var isChatMessageReceived = function (idMessage, kidId) {
    var received_messages = JSON.parse(localStorage.getItem(RECEIVED_MESSAGE));
    if (received_messages && received_messages[kidId] && received_messages[kidId].indexOf(idMessage) > 0) {
      return true;
    }
    return false;

  };
  var chatMessageReceived = function (idMessage, kidId) {
    var received_messages = JSON.parse(localStorage.getItem(RECEIVED_MESSAGE));
    if (!received_messages) {
      received_messages = {};
      received_messages[kidId] = [];
    } else if (!received_messages[kidId]) {
      received_messages[kidId] = [];
    }

    received_messages[kidId].push(idMessage);
    localStorage.setItem(RECEIVED_MESSAGE, JSON.stringify(received_messages));
  };
  var deleteMessageFromStorage = function (idMessage, kidId) {
    var received_messages = JSON.parse(localStorage.getItem(RECEIVED_MESSAGE));
    var index = received_messages[kidId].indexOf(idMessage);
    received_messages[kidId].splice(index, 1);
    localStorage.setItem(RECEIVED_MESSAGE, JSON.stringify(received_messages));
  }
  var isCommunicationReceived = function (idCommunication, schoolId) {
    var received_communications = (localStorage.getItem(RECEIVED_COMMUNICATIONS) ? JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS)).received_communications : []);
    if (received_communications && received_communications[schoolId] && received_communications[schoolId].indexOf(idCommunication) > 0) {
      return true;
    }
    return false;

  };


  //
  var communicationReceived = function (idCommunication, schoolId) {
    var received_communications = (localStorage.getItem(RECEIVED_COMMUNICATIONS) ? JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS)).received_communications : []);
    if (!received_communications[schoolId]) {
      received_communications = {};
      received_communications[schoolId] = [];

    } else if (!received_communications[schoolId]) {
      received_communications[schoolId] = [];
    }

    received_communications[schoolId].push(idCommunication);
    localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify({
      received_communications: received_communications
    }));
  };
  var deleteCommunicationFromStorage = function (idCommunication, schoolId) {
    var received_communications = (localStorage.getItem(RECEIVED_COMMUNICATIONS) ? (JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS))).received_communications : []);
    var index = received_communications.indexOf(idCommunication);
    var index = received_communications.indexOf(idCommunication);
    received_communications.splice(index, 1);
    localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify({
      received_communications: received_communications
    }));
  }
  var isBackground = function () {
    return $rootScope.background;
  }

  var switchProfileFromBackground = function (notification, chat, local) {
    var deferred = $q.defer();
    var profiles = profileService.getBabiesProfiles();
    var item = null;
    var kidId = null;
    if (chat) {
      if (local) {
        kidId = JSON.parse(notification.data)["content.kidId"]
      } else {
        kidId = notification.additionalData["content.kidId"]
      }
      for (var k = 0; k < profiles.length; k++) {
        //            if (profiles[k].kidId == notification.additionalData["content.kidId"]) {
        if (profiles[k].kidId == kidId) {
          item = profiles[k];
          break;
        }
      }
    } else {
      if (local) {
        schoolId = JSON.parse(notification.data)["content.schoolId"]
      } else {
        schoolId = notification.additionalData["content.schoolId"]
      }
      for (var k = 0; k < profiles.length; k++) {
        //            if (profiles[k].kidId == notification.additionalData["content.kidId"]) {
        if (profiles[k].schoolId == schoolId) {
          item = profiles[k];
          break;
        }
      }
    }
    if (item) {
      profileService.setBabyProfile(item);
      $rootScope.loadConfiguration(item.schoolId, item.kidId).then(function () {
        deferred.resolve();
      }, function (err) {
        deferred.reject(err);
      });
    }

    return deferred.promise;
  }

  pushNotificationService.getNewComunications = function (communications, schoolId) {
    //check time since last update and number of those elements I didnt' updated

    if (!localStorage.getItem(RECEIVED_COMMUNICATIONS)) {
      return 0;
    }
    var received_communications = JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS)).received_communications;
    if (!received_communications || !received_communications[schoolId] || received_communications[schoolId].length == 0) {
      return 0

    }
    return received_communications[schoolId].length;
  }
  pushNotificationService.resetNewComunications = function () {
      localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify({
        received_communications: []
      }));
    }
    // Register to GCM
  pushNotificationService.register = function (schooldIds) {
    console.log("registration");
    var arrayOfSchools = [];

    for (var i = 0; i < schooldIds.length; i++) {
      arrayOfSchools.push(Config.getMessagingAppId() + ".comms." + schooldIds[i]);
    }
    var push = PushNotification.init({
      android: {
        senderID: Config.getSenderID(),
        topics: arrayOfSchools
      },
      ios: {
        alert: "true",
        badge: "true",
        sound: "true",
        senderID: Config.getSenderID(),
        topics: arrayOfSchools,
        gcmSandbox: "true"
      },
      windows: {}
    });

    push.on('registration', function (data) {
      //alert('registration' + JSON.stringify(data));
      console.log('registration' + JSON.stringify(data));
      //register to the server
      dataServerService.pushNotificationRegister(data.registrationId, ionic.Platform.platform());
    });

    //the main method triggers when a new notification arrives and in case of background when the application restore
    push.on('notification', function (notification) {
      console.log("notification" + JSON.stringify(notification));
      //double trigger
      //send received to server
      if (notification && notification.additionalData && notification.additionalData["content.type"] == "chat") {
        //check if contained in localStorage
        if (!isChatMessageReceived(notification.additionalData["content.messageId"], notification.additionalData["content.kidId"]) && !notification.additionalData["coldstart"] && !(notification.additionalData["content.kidId"] == profileService.getBabyProfile().kidId && $state.is("app.messages"))) {
          messagesService.receivedMessage(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.messageId"]);
          chatMessageReceived(notification.additionalData["content.messageId"], notification.additionalData["content.kidId"]);
          if (!isBackground()) {
            //update button with message and style with warch
            //create local notification that goes to app.messages
            cordova.plugins.notification.local.schedule({
              id: new Date().getTime(),
              title: notification.title,
              text: notification.message,
              icon: 'res://icon.png',
              autoClear: false,
              at: new Date(),
              data: notification.additionalData
            });
            $rootScope.$apply(function () {
              $rootScope.numberMessageUnread[notification.additionalData["content.kidId"]]++;
            });
          };

        } else {
          //switch profile and go to
          switchProfileFromBackground(notification, true, false).then(function () {
            //if coldstart first send a received
            if (notification.additionalData["coldstart"]) {
              dataServerService.receivedMessage(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.messageId"])
            }
            //already received-> go, seen and delete from localstorage
            if (!$state.is("app.messages")) {
              $state.go("app.messages");
            }

          }, function (error) {

          });

        }
      } else if (notification && notification.additionalData && notification.additionalData["content.type"] == "communication") {
        //check if contained in localStorage
        if (!isCommunicationReceived(notification.additionalData["content.communicationId"], notification.additionalData["content.schoolId"]) && !notification.additionalData["coldstart"]) {
          //                    dataServerService.receivedCommunications(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.communicationId"]);
          communicationReceived(notification.additionalData["content.communicationId"], notification.additionalData["content.schoolId"]);
          if (!isBackground()) {

            //create local notification that goes to app.messages
            cordova.plugins.notification.local.schedule({
              id: new Date().getTime(),
              title: notification.title,
              text: notification.message,
              icon: 'res://icon.png',
              autoClear: false,
              at: new Date(),
              data: notification.additionalData

            });
            if (!$state.is("app.communications")) {


              $rootScope.$apply(function () {
                if (ionic.Platform.isAndroid()) {
                  $rootScope.numberCommunicationsUnread[notification.additionalData["content.schoolId"]]++;
                }
              });
            } else {
              $state.reload();
            }

          };

        } else {
          //switch profile and go to
          switchProfileFromBackground(notification, false, false).then(function () {
            //if coldstart first send a received
            if (notification.additionalData["coldstart"]) {
              //                        dataServerService.receivedCommunications(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.communicationId"])
            }
            //already received-> go, seen and delete from localstorage
            if (!$state.is("app.communications")) {
              $state.go("app.communications");
            } else {
              //updateCommunications
              $rootScope.$apply(function () {
                dataServerService.getMessages(null, null, notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"]).then(function (notifications) {
                  $rootScope.messages[notification.additionalData["content.kidId"]].push(notifications[0]);
                  $ionicScrollDelegate.scrollBottom();
                });

              });

            }
          }, function (err) {

          });
        }
      }
    });


    //...and in case of erro
    push.on('error', function (e) {
      //            alert('error' + e.message);
      console.log('error' + e.message)

    });
  }
  return pushNotificationService;
})
