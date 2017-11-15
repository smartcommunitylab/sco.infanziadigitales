angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var schoolProfile = null; //static info
    var dataServerService = {};

    /**
     * Get children profiles associated to the signed parent
     */
    dataServerService.getBabyProfiles = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/profiles',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    /**
     * Read school profile
     * @param {*} schoolId 
     */
    dataServerService.getSchoolProfile = function (schoolId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/profile',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    /**
     * Read school communications for the specified kid
     * @param {*} schoolId 
     * @param {*} kidId 
     */
    dataServerService.getCommunications = function (schoolId, kidId) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/communications',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data.data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });

        return deferred.promise;
    }

    /**
     * Read kid messages from given time up to specified limit
     * @param {*} timestamp 
     * @param {*} limit 
     * @param {*} schoolId 
     * @param {*} kidId 
     */
    dataServerService.getMessages = function (timestamp, limit, schoolId, kidId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + kidId + (timestamp ? ('?timestamp=' + timestamp) : '') + (limit ? ('&limit=' + limit) : ''),
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };

    /**
     * Get unread kid messages
     * @param {*} schoolId 
     * @param {*} kidId 
     */
    dataServerService.getUnreadMessages = function (schoolId, kidId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + kidId + '/unread/fromteacher',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };

    /**
     * Send chat message
     * @param {*} schoolId 
     * @param {*} kidId 
     * @param {*} msg 
     */
    dataServerService.sendMessage = function (schoolId, kidId, msg) {
        var deferred = $q.defer();
        if (!kidId || !schoolId) {
            deferred.reject(data);
        }
        msg['appId']=Config.appId();
        msg['schoolId']=schoolId;
        $http({
            method: 'POST',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/fromparent',
            headers: {
                'Accept': 'application/json'
            },
            data: msg,
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };
    /**
     * Mark specific message as received
     * @param {*} schoolId 
     * @param {*} kidId 
     * @param {*} msgId 
     */
    dataServerService.receivedMessage = function (schoolId, kidId, msgId) {
        var deferred = $q.defer();
        $http({
            method: 'PUT',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + msgId + '/received',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    };
    /**
     * Mark specific message as seen
     * @param {*} schoolId 
     * @param {*} kidId 
     * @param {*} msgId 
     */
    dataServerService.seenMessage = function (schoolId, kidId, msgId) {
        var deferred = $q.defer();
        $http({
            method: 'PUT',
            url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/' + msgId + '/seen',
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()

        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }

    /**
     * Register push notification ID for parent device
     * @param {*} registrationId 
     * @param {*} platform 
     */
    dataServerService.pushNotificationRegister = function (registrationId,platform) {
        var deferred = $q.defer();
        $http({
            method: 'PUT',
            url: Config.URL() + '/' + Config.app() + '/parent/' + Config.appId() + '/register?registrationId=' + registrationId+'&platform='+platform,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(data);
        });
        return deferred.promise;
    }
    return dataServerService;
})
