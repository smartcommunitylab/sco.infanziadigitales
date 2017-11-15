angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
  var dataServerService = {};

  /**
   * Profile of a specific kid
   * @param {*} schoolId 
   * @param {*} kidId 
   */
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

  /**
   * Profile of a specific school
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
   * Profile of a school associated to a currently logged user
   */
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


  /**
   * add and update an existing communication
   * to update make communication have an existing communicationId
   * @param {*} schoolId 
   * @param {*} communication 
   */
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

  /**
   * Read communications.
   * @param {*} schoolId 
   */
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
      if (data.data) data.data.forEach(function(c) {
        if (c.dateToCheck == 0) c.dateToCheck = null;
      });
      deferred.resolve(data.data);
    }).
    error(function (data, status, headers, config) {
      console.log(data + status + headers + config);
      deferred.reject(data);
    });
    return deferred.promise;
  }
  /**
   * Update communications.
   * @param {*} schoolId 
   * @param {*} communicationId 
   * @param {*} communication 
   */
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
  /**
   * Delete communication
   * @param {*} schoolId 
   * @param {*} communicationId 
   */
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


  /**
   * List sections and schools for current date. 
   * @param {*} schoolId 
   * @param {*} onlySections 
   */
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

  /**
   * List teachers of the school
   * @param {*} schoolId 
   */
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
  
  /**
   * List of buses for a date
   * @param {*} schoolId 
   * @param {*} date 
   */
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

  /**
   * get all messages for a kid
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
   * List unread messages 
   * @param {*} schoolId  get unread messages for the classes or the school
   */
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

  /**
   * Send a chat message to parent
   * @param {*} schoolId 
   * @param {*} msg 
   */
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
  /**
   * Mark a message received
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
   * Mark a message seen
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

  return dataServerService;
})
