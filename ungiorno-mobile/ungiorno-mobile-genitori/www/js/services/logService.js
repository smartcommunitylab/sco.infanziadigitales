angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.logService', [])

    .factory('logService', function ($http, $q, Config) {

        var logService = {};


        var action = {
            start: 'APP_START',
            call: 'CALL',
            daily_plan: 'DAILY_PLAN',
            weekly_plan: 'WEEKLY_PLAN',
            default_plan: 'DEFAULT_PLAN',
            default_usage: 'DEFAULT_USAGE',
            previous_week_usage: 'PREVIOUS_WEEK_USAGE',
            notification_setup: 'NOTIFICATION_SETUP'
        }



        /**
         * log generic action to the server
         */
        logService.logAction = function (schoolId, kidId, action) {
            var deferred = $q.defer();
            $http({
                method: 'PUT',
                url: Config.URL() + '/' + Config.app() + '/school/log/' + Config.appId() + '/'+ schoolId+ '/' + kidId + '/' + action,
                headers: {
                    'Accept': 'application/json'
                },
                timeout: Config.httpTimout()
            }).
                success(function (data, status, headers, config) {
                    deferred.resolve(data.data);
                }).
                error(function (data, status, headers, config) {
                    deferred.reject(status);
                });
            return deferred.promise;
        }

        //log functionalities, no managed error cases
        logService.logStart = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['start']);
        }
        logService.logCall = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['call']);
        }
        logService.logDailyPlan = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['daily_plan']);
        }
        logService.logWeeklyPlan = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['weekly_plan']);
        }
        logService.logDefaultPlan = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['default_plan']);
        }
        logService.logDefaultUsage = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['default_usage']);
        }
        logService.logPreviousWeek = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['previous_week_usage']);
        }
        logService.logNotification = function (schoolId, kidId) {
            logService.logAction(schoolId, kidId, action['notification_setup']);
        }
        return logService;

    })
