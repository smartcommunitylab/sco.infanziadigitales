angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.messagesService', [])

.factory('messagesService', function ($http, $q, dataServerService) {
    var messagesService = {};
    var cacheMessages = [];

    messagesService.getMessages = function (timestamp, numbers, schoolId, kidId) {
        var deferred = $q.defer();
        if (!timestamp) {
            timestamp = Date.now();
        }
        if (!numbers) {
            numbers = 10;
        }
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
    return messagesService;
})
