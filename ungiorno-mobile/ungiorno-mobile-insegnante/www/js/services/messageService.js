angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.messagesService', [])

.factory('messagesService', function ($http, $q, dataServerService, $rootScope) {
    var messagesService = {};
    var cacheMessages = [];
    var stompClient;
    var subscriptions = [];

    messagesService.getMessages = function (timestamp, numbers, schoolId, kidId) {
        var deferred = $q.defer();

        dataServerService.getMessages(timestamp, numbers, schoolId, kidId).then(function (messages) {
            deferred.resolve(messages);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    messagesService.sendMessage = function (schoolId, kidId, teacherId, text) {
        var deferred = $q.defer();
        var msg = {
            "teacherId": teacherId,
            "kidId": kidId,
            "text": text
        }
        dataServerService.sendMessage(schoolId, msg).then(function (message) {
            deferred.resolve(message);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    messagesService.getUnreadMessages = function (schoolId, kidId) {
        var deferred = $q.defer();
        //        dataServerService.getUnreadMessages(schoolId, kidId).then(function (message) {
        //            deferred.resolve(message);
        //        }, function (err) {
        //            deferred.reject(err);
        //        });
        return deferred.promise;

    };
    messagesService.receivedMessage = function (schoolId, kidId, msgId) {
        var deferred = $q.defer();
        dataServerService.receivedMessage(schoolId, kidId, msgId).then(function (message) {
            deferred.resolve(message);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;

    }
    messagesService.seenMessage = function (schoolId, kidId, msgId) {
        var deferred = $q.defer();
        dataServerService.seenMessage(schoolId, kidId, msgId).then(function (message) {
            deferred.resolve(message);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;

    }
    messagesService.getByValue = function (arr, value) {

        var result = arr.filter(function (o) {
            return o.messageId == value;
        });

        return result ? result[0] : null; // or undefined

    }

    //    init socket
    messagesService.init = function (url) {
        subscriptions = [];

        stompClient = Stomp.over(new SockJS(url));
    }
    messagesService.finish = function (url) {
        subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
        stompClient.disconnect();
    }
    messagesService.connect = function (successCallback, errorCallback) {

        stompClient.connect({}, function (frame) {
            $rootScope.$apply(function () {
                successCallback(frame);
            });
        }, function (error) {
            $rootScope.$apply(function () {
                errorCallback(error);
            });
        });
    }

    messagesService.subscribe = function (destination, callback) {
        subscriptions.push(stompClient.subscribe(destination, function (message) {
            $rootScope.$apply(function () {
                callback(message);
            });
        }));
    }
    messagesService.send = function (destination, headers, object) {
        stompClient.send(destination, headers, object);
    }
    return messagesService;
})
