angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.profileService', [])

.factory('profileService', function ($http, $q, $rootScope, Config, dataServerService) {
  var babyProfile = null;
  var schoolProfile = null;
  var currentBabyID = null;
  var profileService = {};
  var teacherProfile = null;


  profileService.setCurrentBaby = function (input) {
    babyProfile = input;
  }

  profileService.getCurrentBaby = function () {
    return babyProfile;
  }

  profileService.getBabyProfileById = function (schoolId, babyId) {
    var deferred = $q.defer();
    dataServerService.getBabyProfileById(schoolId, babyId).then(function (data) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  profileService.getTeacherProfileById = function (schoolId, teacherId) {
    var deferred = $q.defer();
    dataServerService.getTeachers(schoolId).then(function (data) {
      var found = false;
      var i = 0;
      while (!found && i < data.length) {
        if (data[i].teacherId == teacherId) {
          found = true;
          deferred.resolve(data[i]);
        }
        i++;
      }
      if (found == false)
        deferred.reject();
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  profileService.setSchoolProfile = function (input) {
    schoolProfile = input;
  }

  profileService.getSchoolProfile = function () {
    return schoolProfile;
  }

  profileService.searchChildrenBySection = function (childrenName, section) {

    var deferred = $q.defer();

    var matches = section.children.filter(function (children) {
      return children.childrenName.toLowerCase().indexOf(childrenName.toLowerCase()) !== -1;
    })


    deferred.resolve(matches);

    return deferred.promise;

  };
  profileService.lock = function () {
    $rootScope.userAuth = false;
  }
  profileService.unlock = function () {
    $rootScope.userAuth = true;
  }
  var startAuthTimer = function () {
    //get time for auth from config
    var authTimerTime = Config.getAuthenticationTimer();
    setTimeout(function () {
      //reset authentication
      profileService.setTeacher(null);
      profileService.lock();
      $rootScope.$apply();
    }, authTimerTime);
  }

  profileService.authenticatheWithPIN = function (schoolId, PIN) {
    var deferred = $q.defer();
    //chiamata per autenticare con pin e ottengo profile e setto auth per x minuti
    $http({
      method: 'GET',
      url: Config.URL() + '/' + Config.app() + '/school/' + Config.appId() + '/' + schoolId + '/teacher/' + PIN,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: Config.httpTimout()
    }).
    success(function (data, status, headers, config) {
      if (data && data.data) {
        profileService.unlock()
        startAuthTimer();
        profileService.setTeacher(data.data);
        deferred.resolve(data.data);
      } else {
        deferred.reject(data);
      }
    }).
    error(function (data, status, headers, config) {
      console.log(data + status + headers + config);
      deferred.reject(data);
    });

    return deferred.promise;
  };
  profileService.setTeacher = function (teacher) {
    teacherProfile = teacher;
  }
  profileService.getTeacher = function () {
    return teacherProfile;
  }
  return profileService;
})
