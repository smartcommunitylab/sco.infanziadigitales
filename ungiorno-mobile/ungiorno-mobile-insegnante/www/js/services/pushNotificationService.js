angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.pushNotificationService', [])


//
//A Service to work with notifications with server
//
.factory('pushNotificationService', function ($q, $http, $rootScope, $ionicPlatform, $ionicScrollDelegate, $filter, Config, dataServerService, profileService, messagesService, $state) {

    var RECEIVED_MESSAGE = "RECEIVED_MESSAGE";
    var RECEIVED_COMMUNICATIONS = "RECEIVED_COMMUNICATIONS";
    var pushNotificationService = {};

    //set behaviour of local notification click: change context, go to the right page and delete entry in the local storage

    $ionicPlatform.ready(function () {
        Config.init().then(function () {
            window.cordova.plugins.notification.local.on("click", function (notification) {
                if (notification && notification.data) {

                    //manage kind of notification if message or communication
                    if (JSON.parse(notification.data)["content.type"] == "chat") {
                        switchProfileFromBackground(notification, true, true).then(function () {
                            $state.go("app.babyprofile");
                            deleteMessageFromStorage(notification.id, JSON.parse(notification.data)["content.kidId"]);
                        });


                    } //manage different kids
                    else {
                        switchProfileFromBackground(notification, false, true).then(function () {
                            $state.go("app.communications");
                            deleteCommunicationFromStorage(notification.id, JSON.parse(notification.data)["content.schoolId"]);
                            //delete entry from localstorage});


                        });
                    }
                }
            });
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
        var received_communications = JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS));
        if (received_communications && received_communications[schoolId] && received_communications[schoolId].indexOf(idCommunication) > 0) {
            return true;
        }
        return false;

    };
    var communicationReceived = function (idCommunication, schoolId) {
        var received_communications = JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS));
        if (!received_communications) {
            received_communications = {};
            received_communications[schoolId] = [];

        } else if (!received_communications[schoolId]) {
            received_communications[schoolId] = [];
        }

        received_communications[schoolId].push(idCommunication);
        localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify(received_communications));
    };
    var deleteCommunicationFromStorage = function (idCommunication, schoolId) {
        var received_communications = JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS));
        var index = received_communications.indexOf(idCommunication);
        var index = received_communications.indexOf(idCommunication);
        received_communications.splice(index, 1);
        localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify(received_communications));
    }
    var isBackground = function () {
        return $rootScope.background;
    }
    var getProfileFromsharedSection = function (kidId) {
        for (var section in $rootScope.sharedSections) {
            if ($rootScope.sharedSections.hasOwnProperty(section)) {
                for (var profile in $rootScope.sharedSections[section].children) {
                    if ($rootScope.sharedSections[section].children.hasOwnProperty(profile)) {
                        if ($rootScope.sharedSections[section].children[profile].kidId = kidId)
                            return $rootScope.sharedSections[section].children[profile]
                    }
                }
            }
        }
        return null;
    }
    var searchProfile = function (kidId) {
        var deferred = $q.defer();
        if (!$rootScope.sharedSections) {
            dataServerService.getSections(profileService.getSchoolProfile().schoolId).then(function (data) {
                if (data != null) {
                    $rootScope.sharedSections = data;
                    deferred.resolve(getProfileFromsharedSection(kidId));
                }
            });
        } else {
            deferred.resolve(getProfileFromsharedSection(kidId));
        }
        return deferred.promise;

    };
    var switchProfileFromBackground = function (notification, chat, local) {
        var deferred = $q.defer();
        //var profiles = profileService.getBabiesProfiles();
        var item = null;
        var kidId = null;
        if (chat) {
            if (local) {
                kidId = JSON.parse(notification.data)["content.kidId"];
            } else {
                kidId = notification.additionalData["content.kidId"];
            }
            searchProfile(kidId).then(function (item) {
                profileService.setCurrentBaby(item);
                deferred.resolve();

            });
            //            item = profileService.getBabyProfileById(profileService.getSchoolProfile().schoolId, kidId).then(function (item) {
            //                if (item) {
            //                    profileService.setCurrentBaby(item);
            //                    deferred.resolve();
            //                }
            //            });

        } else {
            if (local) {
                schoolId = JSON.parse(notification.data)["content.schoolId"];
            } else {
                schoolId = notification.additionalData["content.schoolId"];
            }

            kidId = notification.additionalData["content.kidId"];
            searchProfile(kidId).then(function (item) {
                profileService.setCurrentBaby(item);
                deferred.resolve();

            });
            //            item = profileService.getBabyProfileById(profileService.getSchoolProfile(), kidId).then(function (item) {
            //                if (item) {
            //                    profileService.setCurrentBaby(item);
            //                    deferred.resolve();
            //
            //                }
            //            });
        }


        return deferred.promise;
    }

    pushNotificationService.getNewComunications = function (schoolId) {
        var received_communications = JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS));
        if (!received_communications || received_communications.length == 0) {
            return 0

        }
        return received_communications[schoolId].length;
    }
    pushNotificationService.resetNewComunications = function () {
            localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify([]));
        }
        // Register to GCM
    pushNotificationService.register = function (schoolId) {
        console.log("registration");
        var schoolIdArray = [];
        schoolIdArray.push(Config.getMessagingAppId() + ".teacher." + schoolId);

        //        for (var i = 0; i < schooldIds.length; i++) {
        //            arrayOfSchools.push(Config.getMessagingAppId() + ".comms." + schooldIds[i]);
        //        }
        var push = PushNotification.init({
            android: {
                senderID: Config.getSenderID(),
                //                topics: arrayOfSchools
                topics: schoolIdArray
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true",
                senderID: Config.getSenderID(),
                topics: schoolIdArray
            },
            windows: {}
        });

        push.on('registration', function (data) {
            //alert('registration' + JSON.stringify(data));
            console.log('registration' + JSON.stringify(data));
            //            //register to the server
            //            dataServerService.pushNotificationRegister(data.registrationId);
        });

        //the main method triggers when a new notification arrives and in case of background when the application restore
        push.on('notification', function (notification) {
            console.log("notification" + JSON.stringify(notification));
            //double trigger
            //send received to server
            if (notification && notification.additionalData && notification.additionalData["content.type"] == "chat") {
                //check if contained in localStorage
                if (!isChatMessageReceived(notification.additionalData["content.messageId"], notification.additionalData["content.kidId"]) && !notification.additionalData["coldstart"] && (!profileService.getCurrentBaby() || !(notification.additionalData["content.kidId"] == profileService.getCurrentBaby().kidId && $state.is("app.babyprofile")))) {
                    messagesService.receivedMessage(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.messageId"]);
                    chatMessageReceived(notification.additionalData["content.messageId"], notification.additionalData["content.kidId"]);
                    if (!isBackground()) {
                        //update button with message and style with warch
                        //create local notification that goes to app.messages
                        $rootScope.$apply(function () {
                            if (!$rootScope.numberMessageUnread[notification.additionalData["content.kidId"]]) {
                                $rootScope.numberMessageUnread[notification.additionalData["content.kidId"]] = 1;
                            } else {
                                $rootScope.numberMessageUnread[notification.additionalData["content.kidId"]]++;
                            }
                        });
                        cordova.plugins.notification.local.schedule({
                            id: new Date().getTime(),
                            title: notification.title,
                            text: notification.message,
                            icon: 'res://icon.png',
                            autoClear: false,
                            at: new Date(),
                            data: notification.additionalData


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
                        if (!$state.is("app.babyprofile")) {
                            $state.go("app.babyprofile");
                        } //manage different kids
                        //                        else {
                        //                            //updateChat
                        //                            $rootScope.$apply(function () {
                        //                                dataServerService.getMessages(null, null, notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"]).then(function (notifications) {
                        //                                    $rootScope.messages[notification.additionalData["content.kidId"]].push(notifications[0]);
                        //                                    $ionicScrollDelegate.scrollBottom();
                        //
                        //                                });
                        //
                        //                            });
                        //                        }
                    }, function (error) {

                    });
                    //                    //if coldstart first send a received
                    //                    if (notification.additionalData["coldstart"]) {
                    //                        dataServerService.receivedMessage(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.messageId"])
                    //                    }
                    //                    //already received-> go, seen and delete from localstorage
                    //                    if (!$state.is("app.messages")) {
                    //                        $state.go("app.messages");
                    //                    } //manage different kids
                    //                    else {
                    //                        //updateChat
                    //                        $rootScope.$apply(function () {
                    //                            dataServerService.getMessages(null, null, notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"]).then(function (notifications) {
                    //                                $rootScope.messages[notification.additionalData["content.kidId"]].push(notifications[0]);
                    //                                $ionicScrollDelegate.scrollBottom();
                    //
                    //                            });
                    //
                    //                        });
                    //                    }
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
                        $rootScope.$apply(function () {
                            $rootScope.numberCommunicationsUnread[notification.additionalData["content.schoolId"]]++;
                        });
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
                        } //manage different kids
                        else {
                            //updateCommuincations
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
