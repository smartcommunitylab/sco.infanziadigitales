angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
  var dataServerService = {};


  dataServerService.getBabyConfiguration = function (schoolId, kidId) {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/config',
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
    //
    //getBabyProfiles(appId)
    //  GET /student/{appId}/profiles
  dataServerService.getBabyProfile = function () {
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
      deferred.reject(data);
    });
    return deferred.promise;
  }

  dataServerService.getBabyProfileById = function (schoolId, kidId) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/profile',
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


  dataServerService.getSchoolProfileForTeacher = function () {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/profile',
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
    /*student/{appId}/{schoolId}/notes?sectionIds=<comma-separated list of sectionIds, may be null>

    /school/{appId}/{schoolId}/notes?sectionIds=<comma-separated list of sectionIds, may be null>*/

  dataServerService.getKidsNotesByKidId = function (schoolId, kidId) {
    var deferred = $q.defer();
    var date = new Date().setHours(0, 0, 0, 0);

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/notes',
      params: {
        date: date
      },
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

  dataServerService.getKidsNotesBySectionIds = function (schoolId, sectionIds) {
    var deferred = $q.defer();

    var commaSeparatedIds = '';

    if (sectionIds !== undefined) {
      for (var i = 0; i < sectionIds.length - 1; i++) {
        commaSeparatedIds += sectionIds[i] + ',';
      }
      commaSeparatedIds += sectionIds[sectionIds.length - 1];
    }
    var date = new Date().setHours(0, 0, 0, 0);
    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/notes',
      params: {
        date: date,
        sectionIds: commaSeparatedIds
      },
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


  dataServerService.getInternalNotesBySections = function (schoolId, sectionIds) {
    var deferred = $q.defer();

    var commaSeparatedIds = '';

    if (sectionIds !== undefined) {
      for (var i = 0; i < sectionIds.length - 1; i++) {
        commaSeparatedIds += sectionIds[i] + ',';
      }
      commaSeparatedIds += sectionIds[sectionIds.length - 1];
    }

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/notes',
      params: {
        date: new Date().getTime(),
        sectionIds: commaSeparatedIds
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: Config.httpTimout(),
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

  dataServerService.addNewNoteForParents = function (schoolId, kidId, note) {

    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/fromteacher',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: note,
      timeout: Config.httpTimout(),
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

  dataServerService.addNewInternalNote = function (schoolId, isAssignedToChilds, ids, note) { //ids could be kidIds or sectionIds
    var deferred = $q.defer();

    var commaSeparatedIds = '';

    if (ids !== undefined) {
      for (var i = 0; i < ids.length - 1; i++) {
        commaSeparatedIds += ids[i] + ',';
      }
      commaSeparatedIds += ids[ids.length - 1];
    }

    var params = {};
    if (isAssignedToChilds) {
      params.kidIds = ids;
    } else {
      params.sectionIds = ids;
    }

    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/notes',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params: params,
      data: note,
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


  //add and update an existing communication,
  //to update make communication have an existing communicationId
  dataServerService.addCommunication = function (schoolId, communication) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: communication,
      timeout: Config.httpTimout()
    }).
    success(function (data, status, headers, config) {
      if (data.data) {
        deferred.resolve(data.data);
      } else {
        deferred.reject();
      }
    }).
    error(function (data, status, headers, config) {
      console.log(data + status + headers + config);
      deferred.reject(data);
    });
    return deferred.promise;
  }

  dataServerService.getCommunications = function (schoolId) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications',
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
  dataServerService.modifyCommunication = function (schoolId, communicationId, communication) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: communication,
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
  dataServerService.deleteCommunication = function (schoolId, communicationId) {
    var deferred = $q.defer();
    $http({
      method: 'DELETE',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/communications/' + communicationId,
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

  dataServerService.sendAssenza = function (schoolId, kidId, assenza) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/absence',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: assenza,
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

  dataServerService.sendRitiro = function (schoolId, kidId, ritiro) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/return',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: ritiro,
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

  dataServerService.sendBabySetting = function (schoolId, kidId, babysetting) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/config',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: babysetting,
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

  dataServerService.sendFermata = function (schoolId, kidId, fermata) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + '/stop',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: fermata,
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

  dataServerService.getCalendars = function (from, to, schoolId, kidId) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/student/' + Config.appId() + '/' + schoolId + '/' + kidId + 'calendar',
      params: {
        from: from,
        to: to
      },
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

  dataServerService.getMeals = function (schoolId, from, to) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/menu',
      params: {
        from: from,
        to: to
      },
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

  dataServerService.getSections = function (schoolId, onlySections) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/sections',
      params: {
        date: new Date().getTime()
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: Config.httpTimout()
    }).
    success(function (data, status, headers, config) {
      if (onlySections) {
        dataServerService.getSchoolProfile(schoolId).then(function(profile) {
          var map = {};
          data.data.forEach(function(s) {
            s.children.forEach(function(kid) {
              kid.slotPresent = [];
              if (kid.exitTime != null) {
                var presStart = moment(kid.entryTime).format('HH:mm');
                var presEnd = moment(kid.exitTime).format('HH:mm');
                kid.fascieList.forEach(function(slot) {
                  var slotStart = moment(slot.fromTime).format('HH:mm');
                  var slotEnd = moment(slot.toTime).format('HH:mm');
                  if (presStart < slotEnd && presEnd > slotStart) {
                    kid.slotPresent.push(slot.name);              
                  }
                });
              }
            });
          });
          profile.sections.forEach(function(s) {
            map[s.sectionId] = s.group;
          });
          deferred.resolve(data.data.filter(function(s) {
            return !map[s.sectionId];
          }));        
        },function(err) {
          deferred.reject(err);
        });
      } else {
        deferred.resolve(data.data);        
      }
    }).
    error(function (data, status, headers, config) {
      console.log(data + status + headers + config);
      deferred.reject(data);
    });
    return deferred.promise;
  };


  dataServerService.getTeachers = function (schoolId) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/teachers',
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

  dataServerService.getTeachersCalendar = function (schoolId, from, to) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/' + 'teachercalendar',
      params: {
        from: from,
        to: to
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: Config.httpTimout()
    }).
    success(function (data, status, headers, config) {
      deferred.resolve(data.data[0]);
    }).
    error(function (data, status, headers, config) {
      console.log(data + status + headers + config);
      deferred.reject(data);
    });
    return deferred.promise;
  };


  dataServerService.getBuses = function (schoolId, date) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/' + 'buses',
      params: {
        date: date
      },
      headers: {
        'Accept': 'application/json'
      },
      //timeout: Config.httpTimout()
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
  //    get all messages for a kid
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

  //    get unread messages for the classes or the school
  // /chat/{appId}/{schoolId}/message/unread/fromparent
  dataServerService.getUnreadMessages = function (schoolId) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/unread/fromparent',
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

  dataServerService.sendMessage = function (schoolId, msg) {
    var deferred = $q.defer();
    if (!schoolId) {
      deferred.reject();
    }
    $http({
      method: 'POST',
      url: Config.URL() + '/' + Config.app() + '/chat/' + Config.appId() + '/' + schoolId + '/message/fromteacher',
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

  //    dataServerService.pushNotificationRegister = function (registrationId) {
  //        var deferred = $q.defer();
  //        $http({
  //            method: 'PUT',
  //            url: Config.URL() + '/' + Config.app() + '/teacher/' + Config.appId() + '/register?registrationId=' + registrationId,
  //            headers: {
  //                'Accept': 'application/json',
  //                'Content-Type': 'application/json'
  //            }
  //        }).
  //        success(function (data, status, headers, config) {
  //            deferred.resolve(data);
  //        }).
  //        error(function (data, status, headers, config) {
  //            console.log(data + status + headers + config);
  //            deferred.reject(data);
  //        });
  //        return deferred.promise;
  //    }
  return dataServerService;
})
