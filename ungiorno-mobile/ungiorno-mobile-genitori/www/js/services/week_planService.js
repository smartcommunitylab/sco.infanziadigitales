angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.week_planService', [])

.factory('week_planService', function ($http, $q, Config) {
  var week_planService = {};
  var weekData = {};
  var actualDayNr = 0;
  var mode = '';
  var weekDefaultDataDefault = {};
  var actualDayNrDefault = 0;
  var modeDefault = '';
  var dateFormat='';
  var currWeek='';
  var globalUrl=Config.URL() + '/' + Config.app();
  
  week_planService.setDayData = function (day,dayData,modeActual) {
       weekData[day]=dayData;
       actualDayNr=day;
       mode=modeActual;
  };

  week_planService.setDayDataDefault = function (day,dayData,modeActual) {
    weekDefaultDataDefault[day]=dayData;
    actualDayNrDefault=day;
    modeDefault=modeActual;
};

  week_planService.getDayData = function (day) {
       return weekData[day];
  };
  week_planService.getDayDataDefault = function (day) {
    return weekDefaultDataDefault[day];
};

  week_planService.getActualDay = function () {
    return actualDayNr;
  };
  week_planService.getActualDayDefault = function () {
    return actualDayNrDefault;
  };

  week_planService.setMode = function (modeActual) {
    mode=modeActual;
};
week_planService.setModeDefault = function (modeActual) {
    modeDefault=modeActual;
};
  week_planService.getMode = function () {
    return mode;
  };
  week_planService.getModeDefault = function () {
  return modeDefault;
};
week_planService.setSelectedDateInfo= function (dateFormatActual) {
    dateFormat=dateFormatActual;
};
week_planService.getSelectedDateInfo= function () {
    return dateFormat;
  };

  week_planService.setCurrentWeek= function (currWeekActual) {
    currWeek=currWeekActual;
};
week_planService.getCurrentWeek= function () {
    return currWeek;
  };
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
  };

  week_planService.getDefaultWeekPlan = function (kidid) {
    var deferred = $q.defer();
    
            $http({
                method: 'GET',
                url: globalUrl + '/week_plan/' + kidid + '/retrieve_default_plan',
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

  week_planService.setDefaultWeekPlan = function (weekData,kidid) {
    var deferred = $q.defer();
    
            $http({
                method: 'POST',
                url: globalUrl + '/week_plan/' + kidid + '/set_default_plan',
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

  week_planService.getFermataOptions = function () {
    var deferred = $q.defer();
    
            $http({
                method: 'GET',
                url: globalUrl + '/week_plan/getFermataOptions',
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
