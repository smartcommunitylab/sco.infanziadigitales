angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.notification', [])


//
//A Service to work with notifications with server
//
.factory('pushNotificationService', function ($q, $http, $rootScope, $ionicPlatform, Config, dataServerService) {

    var pushNotificationService = {};

    // Register to GCM
    pushNotificationService.register = function () {
        console.log("registration")
        var push = PushNotification.init({
            android: {
                senderID: Config.getSenderID()
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true",
                senderID: Config.getSenderID()
            },
            windows: {}
        });

        push.on('registration', function (data) {
            //alert('registration' + JSON.stringify(data));
            console.log('registration' + JSON.stringify(data));
            //register to the server
            dataServerService.pushNotificationRegister(data.registrationId);
        });
        //What to do when I get a notification
        push.on('notification', function (data) {
            console.log("notification" + JSON.stringify(data));
            console.log('received');

        });


        //...and in case of erro
        push.on('error', function (e) {
            //            alert('error' + e.message);
            console.log('error' + e.message)

        });




    }
    return pushNotificationService;
})
