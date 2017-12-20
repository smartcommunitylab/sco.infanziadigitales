angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.week_planService', [])

    .factory('week_planService', function ($http, $q, $filter, profileService, Config) {
        var week_planService = {};
        var weekData = []
        var actualDayNr = 0;
        var mode = '';
        var weekDefaultDataDefault = [];
        var actualDayNrDefault = 0;
        var modeDefault = '';
        var dateFormat = '';
        var currWeek = '';
        var currYear = '';
        var fromHome = false;

        var appId = '';
        var schoolId = '';
        var globalUrl = Config.URL() + '/' + Config.app();
        week_planService.setGlobalParam = function (app, school) {
            appId = app;
            schoolId = school;
        };


        week_planService.setDayData = function (day, dayData, modeActual) {
            weekData[day] = dayData;
            actualDayNr = day;
            mode = modeActual;
        };

        week_planService.setDayDataDefault = function (day, dayData, modeActual) {
            weekDefaultDataDefault[day] = dayData;
            actualDayNrDefault = day;
            modeDefault = modeActual;
        };

        week_planService.getDayData = function (day) {
            return weekData[day];
        };
        week_planService.getWeekDataDefault = function () {
            return weekDefaultDataDefault;
        };

        week_planService.getWeekData = function () {
            return weekData;
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
            mode = modeActual;
        };
        week_planService.setModeDefault = function (modeActual) {
            modeDefault = modeActual;
        };
        week_planService.getMode = function () {
            return mode;
        };
        week_planService.getModeDefault = function () {
            return modeDefault;
        };
        week_planService.setSelectedDateInfo = function (dateFormatActual) {
            dateFormat = dateFormatActual;
        };
        week_planService.getSelectedDateInfo = function () {
            return dateFormat;
        };

        week_planService.setCurrentWeek = function (currWeekActual) {
            currWeek = currWeekActual;
        };
        week_planService.getCurrentWeek = function () {
            return currWeek;
        };

        week_planService.setCurrentYear = function (currYearActual) {
            currYear = currYearActual;
        };
        week_planService.getCurrentYear = function () {
            return currYear;
        };

        week_planService.fromHome = function (fromHome1) {
            fromHome = fromHome1;
        };
        week_planService.getIsFromHome = function () {
            return fromHome;
        };

        week_planService.getWeekPlan = function (weekNr, kidid) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + kidid + '/' + weekNr + '/retrieve_specific_week',
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
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + kidid + '/retrieve_default_plan',
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

        week_planService.setWeekPlan = function (weekData, kidid, weekNr) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + kidid + '/' + weekNr + '/set_specific_week',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: weekData,
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

        week_planService.setDefaultWeekPlan = function (weekData, kidid) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + kidid + '/set_default_plan',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: weekData,
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
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + weekNr + '/' + kidid + '/copy_previous_plan',
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
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + 'getFermataOptions',
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

        week_planService.getRitiroOptions = function () {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + 'getRitiroOptions',
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

        week_planService.getListServices = function () {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: globalUrl + '/student/' + appId + '/' + schoolId + '/' + 'getListServices',
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
        var formatInfo = function (info) {
            var days = ['monday_reduced', 'tuesday_reduced', 'wednesday_reduced', 'thursday_reduced', 'friday_reduced'];
            for (var i = 0; i <= 4; i++) {
                info[i].name = days[i];
                if (info[i]['uscita'] != null && info[i]['uscita'] != undefined)
                    info[i]['uscita_display'] = moment(info[i]['uscita']).format('H:mm');
                if (info[i]['entrata'] != null && info[i]['entrata'] != undefined)
                    info[i]['entrata_display'] = moment(info[i]['entrata']).format('H:mm');
            }
            return info;
        };
        week_planService.setNotification = function (scope) {
            var selectables = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            var date = new Date();
            var idNotification = 7;
            var notifArray = [];
            var babiesProfiles = profileService.getBabiesProfiles();
            var now = new Date().getTime();
            var day_summ = {
                id: idNotification++,
                title: $filter('translate')('notification_day_summary_title'),
                text: $filter('translate')('notification_day_summary_text'),
                icon: 'res://icon.png',
                autoClear: false,
                every: 1 * 60 * 24 * 7, //1 day
                at: new Date(),
                data: {
                    'type': 'day_summary'
                }
            };
            var week = {
                id: idNotification++,
                title: $filter('translate')('notification_day_summary_title'),
                text: $filter('translate')('notification_week_text'),
                icon: 'res://icon.png',
                //autoCancel: false,
                autoClear: false,
                every: 1 * 60 * 24 * 7,  // 1 week.
                at: new Date(),
                data: {
                    'type': 'week'
                }
            };
            var ritiro = {
                id: idNotification++,
                title: $filter('translate')('notification_day_summary_title'),
                // text: $filter('translate')('notification_ritiro_text') + " " + kid.firstName + " " + kid.lastName,
                icon: 'res://icon.png',
                //autoCancel: false,
                autoClear: false,
                every: 1 * 60 * 24 * 7, //1 day
                at: new Date(),
                data: {
                    'type': 'ritiro'
                }
            };

            var netErr = false;
            if (window.plugin && cordova && cordova.plugins && cordova.plugins.notification) {
                cordova.plugins.notification.local.clearAll(function () {
                    cordova.plugins.notification.local.cancelAll(function () {
                        var promDay = false
                        var promWeek = false
                        var promRitiro = false
                        var promDayTime = "09:00";
                        var promWeekTime = "09:00";
                        var promWeekDay = "monday"
                        var promRitiroTime = 30;
                        if (scope.currData && scope.currData['prom_day_summary'] != "undefined") {
                            promDay = scope.currData['prom_day_summary'];
                            promDayTime = scope.currData['prom_day_time'];
                        } else {
                            promDay = JSON.parse(localStorage.getItem('prom_day_summary'));
                            promDayTime = localStorage.getItem('prom_day_time');
                        }
                        if (scope.currData && scope.currData['prom_week'] != "undefined") {
                            promWeek = scope.currData['prom_week'];
                            promWeekTime = scope.currData['prom_week_time'];
                            promWeekDay = scope.currData['prom_week_day'];
                        }
                        else {
                            promWeek = JSON.parse(localStorage.getItem('prom_week'));
                            promWeekDay = localStorage.getItem('prom_week_day');
                            promWeekTime = localStorage.getItem('prom_week_time');
                        }
                        if (scope.currData && scope.currData['prom_day_ritiro'] != "undefined") {
                            promRitiro = scope.currData['prom_day_ritiro'];
                            promRitiroTime = scope.currData['prom_ritiro_time'];
                        }
                        else {
                            promRitiro = JSON.parse(localStorage.getItem('prom_day_ritiro'));
                            promRitiroTime = localStorage.getItem('prom_ritiro_time');
                        }

                        var notific = [];
                        var id = 7;
                        if (promDay) {
                            localStorage.setItem('prom_day_summary', true);
                            if (!promDayTime)
                                promDayTime = "09:00";
                            localStorage.setItem('prom_day_time', promDayTime);
                            temp = promDayTime.split(':');
                            var date = moment(); // use a clone
                            var now = moment().toDate();
                            var days = 7;
                            while (days > 0) {
                                var selectedTime = new Date(date.valueOf());
                                selectedTime.setHours(temp[0]);
                                selectedTime.setMinutes(temp[1]);
                                selectedTime.setSeconds(0);
                                if (selectedTime <= now) {
                                    selectedTime.setDate(selectedTime.getDate() + 7);
                                }
                                var daily = Object.assign({}, day_summ);
                                daily.id = id;
                                id++;
                                daily.at = new Date(selectedTime.getTime());
                                if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
                                    notific.push(daily);
                                }
                                date = date.add(1, 'days');
                                days -= 1;
                            }
                        } else {
                            localStorage.setItem('prom_day_summary', false);
                        }
                        if (promWeek) {
                            localStorage.setItem('prom_week', true);
                            if (!promWeekTime)
                                promWeekTime = "09:00";
                            localStorage.setItem('prom_week_time', promWeekTime);
                            if (!promWeekDay)
                                promWeekDay = "monday"
                            localStorage.setItem('prom_week_day', promWeekDay);
                            temp = promWeekTime.split(':');
                            var tempDay = promWeekDay;
                            var next = moment();
                            var now = moment().toDate();
                            next.hour(parseInt(temp[0]));
                            next.minute(parseInt(temp[1]));
                            next.day(selectables.indexOf(promWeekDay) + 1);
                            var selectedTime = next.toDate();
                            // start from next week if it is in the past
                            if (selectedTime <= now) {
                                selectedTime.setDate(selectedTime.getDate() + 7);
                            }
                            week.id = id;
                            id++;
                            week.at = selectedTime;
                            notific.push(week);
                        } else {
                            localStorage.setItem('prom_week', false);

                        }
                        if (promRitiro) {
                            //I have to set the entire week based on the planned week
                            var now = moment().toDate();
                            localStorage.setItem('prom_day_ritiro', true);
                            if (!promRitiroTime)
                                promRitiroTime = 30;
                            localStorage.setItem('prom_ritiro_time', promRitiroTime);
                            var weekNr = moment().format('w');
                            var promisefunction = [];
                            for (var k = 0; k < babiesProfiles.length; k++) {
                                const babyProfile = Object.assign({}, babiesProfiles[k]);
                                week_planService.getDefaultWeekPlan(babyProfile.kidId).then(
                                    function (dataDefault) {
                                        promisefunction.push(week_planService.getWeekPlan(weekNr, babyProfile.kidId).then(function (data) {
                                            //here I have the entire week plan
                                            if (!data && !dataDefault) {
                                                var jsonTest = [{ 'name': 'monday_reduced', 'entrata': scope.fromtime, 'uscita': scope.totime, 'bus': false, 'delega_name': '' },
                                                { 'name': 'tuesday_reduced', 'entrata': scope.fromtime, 'uscita': scope.totime, 'bus': false, 'delega_name': '' },
                                                { 'name': 'wednesday_reduced', 'entrata': scope.fromtime, 'uscita': scope.totime, 'bus': false, 'delega_name': '' },
                                                { 'name': 'thursday_reduced', 'entrata': scope.fromtime, 'uscita': scope.totime, 'bus': false, 'delega_name': '' },
                                                { 'name': 'friday_reduced', 'entrata': scope.fromtime, 'uscita': scope.totime, 'bus': false, 'delega_name': '' }];
                                                jsonTest = formatInfo(jsonTest);
                                                data = jsonTest;
                                            }
                                            if (data == null && dataDefault) {
                                                data = dataDefault;
                                            }
                                            for (var i = 0; i < data.length; i++) {
                                                //usa defaults
                                                var orauscita = new Date(scope.totime);
                                                if (dataDefault && dataDefault[i].uscita) {
                                                    orauscita = new Date(dataDefault[i].uscita);
                                                }
                                                if (data[i].uscita) {
                                                    orauscita = new Date(data[i].uscita);
                                                }
                                                var selectedTime = new Date(orauscita.getTime() - promRitiroTime * 60000);
                                                var now = new Date();
                                                var dailyRitiro = Object.assign({}, ritiro);
                                                dailyRitiro.id = id;
                                                id++;

                                                dailyRitiro.at = new Date(selectedTime.getTime());
                                                dailyRitiro.text = $filter('translate')('notification_ritiro_text') + " " + babyProfile.firstName + " " + babyProfile.lastName;
                                                var currentDay = dailyRitiro.at.getDay();
                                                var distance = (i + 1 + 7 - currentDay) % 7;
                                                dailyRitiro.at.setDate(dailyRitiro.at.getDate() + distance);
                                                //calculate the number of week between dailyritiro and now and set the right new notification for that day.
                                                // If the day of the week is passed, set it in the future
                                                var weeks = moment(now).diff(moment(dailyRitiro.at), 'week') + 1;
                                                if (dailyRitiro.at <= now || (data[i].absence && moment(dailyRitiro.at).isoWeek() == moment(now).isoWeek())) {
                                                    dailyRitiro.at.setDate(dailyRitiro.at.getDate() + 7 * weeks);
                                                }
                                                notific.push(dailyRitiro);

                                            }
                                        }))
                                        if (promisefunction.length == babiesProfiles.length) {
                                            $q.all(promisefunction).then(function (values) {
                                                cordova.plugins.notification.local.schedule(notific);
                                                cordova.plugins.notification.local.on("click", function (notification) {
                                                    $state.go("app.home");
                                                });
                                            })
                                        }
                                    })
                            }

                        } else {
                            localStorage.setItem('prom_day_ritiro', false);

                        }
                        console.log(notific);
                        if (!promRitiro || netErr) {
                            cordova.plugins.notification.local.schedule(notific);
                            cordova.plugins.notification.local.on("click", function (notification) {
                                $state.go("app.home");
                            });
                            cordova.plugins.notification.local.getAll(function (notifications) {
                            });
                        }
                    });
                });
            }
        }
        return week_planService;
    })
