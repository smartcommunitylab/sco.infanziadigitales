angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.week_planService', [])

.factory('week_planService', function ($http, $q, Config) {
  var week_planService = {};
  var globalUrl=Config.URL() + '/' + Config.app();
  
  week_planService.getWeekPlan = function (weekNr,kidid) {
    var deferred = $q.defer();
    
            $http({
                method: 'GET',
                url: globalUrl + '/week_plan/' +weekNr + '/' + kidid + '/retrieve_plan',
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

  week_planService.setWeekPlan = function (weekData,kidid,weekNr) {
    var deferred = $q.defer();
    
            $http({
                method: 'POST',
                url: globalUrl + '/week_plan/' +weekNr + '/' + kidid + '/set_plan',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                data:weekData,
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

  week_planService.copyPreviousWeekPlan = function (weekNr) {
    var deferred = $q.defer();
    
            $http({
                method: 'GET',
                url: globalUrl + '/week_plan/' +weekNr + '/' + kidid + '/copy_previous_plan',
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

  week_planService.setDayConfig = function (dayData) {
    var deferred = $q.defer();
    
            $http({
                method: 'POST',
                url: globalUrl + '/week_plan/' +weekNr + '/' + kidid + '/updateDayData',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
                data:dayData,
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

  week_planService.getDayConfig = function (day,kidid) {
    var deferred = $q.defer();
    
            $http({
                method: 'GET',
                url: globalUrl + '/week_plan/' +day + '/' + kidid + '/retrieveDayData',
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
  
  return week_planService;
})
