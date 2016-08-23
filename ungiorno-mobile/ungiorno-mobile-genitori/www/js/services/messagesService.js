angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.messagesService', [])

.factory('messagesService', function ($http, $q, dataServerService) {
    var messagesService = {};
    var cacheMessages = [];

    messagesService.getMessages = function (timestamp, numbers, schoolId, kidId) {
        var deferred = $q.defer();
        //        if (!timestamp) {
        //            timestamp = new Date().getTime();
        //        }

        dataServerService.getMessages(timestamp, numbers, schoolId, kidId).then(function (messages) {
            deferred.resolve(messages);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    messagesService.sendMessage = function (schoolId, kidId, text) {
        var deferred = $q.defer();
        var msg = {
            "kidId": kidId,
            "text": text
        }
        dataServerService.sendMessage(schoolId, kidId, msg).then(function (message) {
            deferred.resolve(message);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    messagesService.getUnreadMessages = function (schoolId, kidId) {
        var deferred = $q.defer();
        dataServerService.getUnreadMessages(schoolId, kidId).then(function (message) {
            deferred.resolve(message);
        }, function (err) {
            deferred.reject(err);
        });
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
    return messagesService;
})
