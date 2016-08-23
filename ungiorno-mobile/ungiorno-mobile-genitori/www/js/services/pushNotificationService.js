angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.notification', [])


//
//A Service to work with notifications with server
//
.factory('pushNotificationService', function ($q, $http, $rootScope, $ionicPlatform, $ionicScrollDelegate, $filter, Config, dataServerService, messagesService, $state) {

    var RECEIVED_MESSAGE = "RECEIVED_MESSAGE";
    var RECEIVED_COMMUNICATIONS = "RECEIVED_COMMUNICATIONS";
    var pushNotificationService = {};


    $ionicPlatform.ready(function () {
        cordova.plugins.notification.local.on("click", function (notification) {
            if (notification && notification.data) {
                //manage kind of notification if message or communication
                if (JSON.parse(notification.data)["content.type"] == "chat") {
                    $state.go("app.messages");
                    deleteMessageFromStorage(notification.id);
                } //manage different kids
                else {
                    $state.go("app.communications");
                    deleteCommunicationFromStorage(notification.id);
                    //delete entry from localstorage
                }
            }
        });
    });

    var isChatMessageReceived = function (idMessage) {
        var received_messages = localStorage.getItem(RECEIVED_MESSAGE);
        if (received_messages && received_messages.indexOf(idMessage) > 0) {
            return true;
        }
        return false;

    };
    var chatMessageReceived = function (idMessage) {
        var received_messages = localStorage.getItem(RECEIVED_MESSAGE);
        if (!received_messages) {
            received_messages = [];
        } else {
            received_messages = JSON.parse(received_messages);
        }
        received_messages.push(idMessage);
        localStorage.setItem(RECEIVED_MESSAGE, JSON.stringify(received_messages));
    };
    var deleteMessageFromStorage = function (idMessage) {
        var received_messages = JSON.parse(localStorage.getItem(RECEIVED_MESSAGE));
        var index = received_messages.indexOf(idMessage);
        received_messages.splice(index, 1);
        localStorage.setItem(RECEIVED_MESSAGE, JSON.stringify(received_messages));
    }
    var isCommunicationReceived = function (idCommunication) {
        var received_communications = localStorage.getItem(RECEIVED_COMMUNICATIONS);
        if (received_communications && received_communications.indexOf(idCommunication) > 0) {
            return true;
        }
        return false;

    };
    var communicationReceived = function (idCommunication) {
        var received_communications = localStorage.getItem(RECEIVED_COMMUNICATIONS);
        if (!received_communications) {
            received_communications = [];
        } else {
            received_communications = JSON.parse(received_communications);
        }
        received_communications.push(idCommunication);
        localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify(idCommunication));
    };
    var deleteCommunicationFromStorage = function (idCommunication) {
        var received_communications = JSON.parse(localStorage.getItem(RECEIVED_COMMUNICATIONS));
        var index = received_communications.indexOf(idCommunication);
        received_communications.splice(index, 1);
        localStorage.setItem(RECEIVED_COMMUNICATIONS, JSON.stringify(received_communications));
    }
    var isBackground = function () {
        return $rootScope.background;
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
                topics: arrayOfSchools
            },
            windows: {}
        });

        push.on('registration', function (data) {
            //alert('registration' + JSON.stringify(data));
            console.log('registration' + JSON.stringify(data));
            //register to the server
            dataServerService.pushNotificationRegister(data.registrationId);
        });
        //        //the notification event fires sometimes when notification arrives, sometimes when it is clicked.
        push.on('notification', function (notification) {
            console.log("notification" + JSON.stringify(notification));
            //double trigger
            //send received to server
            if (notification && notification.additionalData && notification.additionalData["content.type"] == "chat") {
                //check if contained in localStorage
                if (!isChatMessageReceived(notification.additionalData["content.messageId"]) && !notification.additionalData["coldstart"] && !$state.is("app.messages")) {
                    messagesService.receivedMessage(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.messageId"]);
                    chatMessageReceived(notification.additionalData["content.messageId"]);
                    if (!isBackground()) {
                        //create local notification that goes to app.messages
                        cordova.plugins.notification.local.schedule({
                            id: notification.additionalData["content.messageId"],
                            title: notification.title,
                            text: notification.message,
                            icon: 'res://icon.png',
                            autoClear: false,
                            at: new Date(),
                            data: notification.additionalData


                        });
                        $rootScope.numberMessageUnread++;
                        //update button with message and style with warch
                    };

                } else {
                    //if coldstart first send a received
                    if (notification.additionalData["coldstart"]) {
                        dataServerService.receivedMessage(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.messageId"])
                    }
                    //already received-> go, seen and delete from localstorage
                    if (!$state.is("app.messages")) {
                        $state.go("app.messages");
                    } //manage different kids
                    else {
                        //updateChat
                        $rootScope.$apply(function () {
                            dataServerService.getMessages(null, null, notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"]).then(function (notifications) {
                                $rootScope.messages.push(notifications[0]);
                                $ionicScrollDelegate.scrollBottom();

                            });

                        });
                    }
                }
            } else if (notification && notification.additionalData && notification.additionalData["content.type"] == "communication") {
                //check if contained in localStorage
                if (!isCommunicationReceived(notification.additionalData["content.communicationId"]) && !notification.additionalData["coldstart"]) {
                    //                    dataServerService.receivedCommunications(notification.additionalData["content.schoolId"], notification.additionalData["content.kidId"], notification.additionalData["content.communicationId"]);
                    communicationReceived(notification.additionalData["content.communicationId"]);
                    if (!isBackground()) {
                        //create local notification that goes to app.messages
                        cordova.plugins.notification.local.schedule({
                            id: notification.additionalData["content.communicationId"],
                            title: notification.title,
                            text: notification.communications,
                            icon: 'res://icon.png',
                            autoClear: false,
                            at: new Date(),
                            data: notification.additionalData

                        });
                        $rootScope.numberMCommunicationUnread++;
                    };

                } else {
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
                                $rootScope.messages.push(notifications[0]);
                                $ionicScrollDelegate.scrollBottom();
                            });

                        });

                    }
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
