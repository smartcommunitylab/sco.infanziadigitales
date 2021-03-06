angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.common', [])

.factory('Toast', function ($rootScope, $timeout, $ionicPopup, $cordovaToast) {
  return {
    show: function (message, duration, position) {
      message = message || "There was a problem...";
      duration = duration || 'short';
      position = position || 'top';

      if (!!window.cordova) {
        // Use the Cordova Toast plugin
        $cordovaToast.show(message, duration, position);
      } else {
        if (duration == 'short') {
          duration = 2000;
        } else {
          duration = 5000;
        }

        var myPopup = $ionicPopup.show({
          template: "<div class='toast'>" + message + "</div>",
          scope: $rootScope,
          buttons: []
        });

        $timeout(function () {
          myPopup.close();
        }, duration);
      }
    }
  };
})

.factory('FilterVariable', function ($rootScope) {
  filterSocialTab = true
  filterSocialSlide = true;
  filterAddImageButton = true;
  filterMaxNumberSlide = 6;
  return {
    getFilterSocialTab: function () {
      return filterSocialTab;
    },
    getFilterSocialSlide: function () {
      return filterSocialSlide;
    },
    getFilterAddImageButton: function () {
      return filterAddImageButton;
    },
    getFilterMaxNumberSlide: function () {
      return filterMaxNumberSlide;
    },
  };
})

.controller('AppCtrl', function ($scope, $rootScope, $cordovaDevice, $ionicModal, $ionicHistory, $q, $timeout, $filter, $ionicPopover, $state, Toast, Config, $ionicSideMenuDelegate, loginService, teachersService, $ionicPopup) {
  $scope.rightView = null;
  $scope.openRightMenu = function (item) {
    $scope.rightView = item;
    $ionicSideMenuDelegate.toggleRight();
  };

  $scope.openLeftMenu = function () {
    $scope.teacherName = teachersService.getSelectedTeacher().teacherName;
    $ionicSideMenuDelegate.toggleLeft();
  };
  //  $scope.showNoConnection = function () {
  //    var alertPopup = $ionicPopup.alert({
  //      title: $filter('translate')("signal_send_no_connection_title"),
  //      template: $filter('translate')("signal_send_no_connection_template"),
  //      buttons: [
  //        {
  //          text: $filter('translate')("signal_send_toast_alarm"),
  //          type: 'button-custom'
  //            }
  //        ]
  //    });
  //
  //    alertPopup.then(function (res) {
  //      console.log('no place');
  //    });
  //  };
  $ionicModal.fromTemplateUrl('templates/credits.html', {
    id: '3',
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.creditsModal = modal;
  });
  $scope.closeCredits = function () {
    $scope.creditsModal.hide();
  };
  $scope.openCredits = function () {
    $scope.creditsModal.show();
  }

  $scope.getExpirationDateFormatted = function () {
    var expirationDateString = Config.getExpirationDate();
    var pattern = /(\d{2})-(\d{2})-(\d{4})/;
    var expirationDate = new Date(expirationDateString.replace(pattern, '$3-$2-$1'));
    return expirationDate;
  }
  $scope.showExpiredPopup = function (date) {
    var expDate = $scope.getExpirationDateFormatted();
    var today = new Date();
    $scope.days = Math.round(Math.abs((today.getTime() - expDate.getTime()) / (24 * 60 * 60 * 1000)))
    $scope.date = date;
    var alertPopup = $ionicPopup.alert({
      title: $filter('translate')("pop_up_expired_title"),
      //      template: $filter('translate')("pop_up__expired_template"),
      templateUrl: 'templates/expiredPopup.html',
      scope: $scope,
      buttons: [
        {
          text: $filter('translate')("ok"),
          type: 'button-popup',
          onTap: function (e) {
            ionic.Platform.exitApp();
          }
                            }
            ]
    });
  }
  $scope.showNotExpiredPopup = function (date) {
    var expDate = $scope.getExpirationDateFormatted();
    var today = new Date();
    $scope.days = Math.round(Math.abs((today.getTime() - expDate.getTime()) / (24 * 60 * 60 * 1000)))
    $scope.date = date;
    var alertPopup = $ionicPopup.alert({
      title: $filter('translate')("pop_up_not_expired_title"),
      //      template: $filter('translate')("pop_up_not_expired_template_1") + $filter('translate')("pop_up_not_expired_template_2") + date + ' (' + days + ')' +
      //        $filter('translate')("pop_up_not_expired_template_3"),
      templateUrl: 'templates/noExpiredPopup.html',
      scope: $scope,
      buttons: [
        {
          text: $filter('translate')("ok"),
          type: 'button-popup'
                            }
            ]
    });
  }
  $scope.isExpired = function () {
    //check in config if expirationDate is > of today
    //        var expirationDateString = Config.getExpirationDate();
    //        var expirationDate

    var expirationDate = $scope.getExpirationDateFormatted();
    expirationDate = expirationDate.getTime();
    var today = new Date().getTime();
    if (expirationDate < today) {
      return true;
    } else if (expirationDate > today) {
      return false;
    }

  }
  $scope.initialize = function () {
    $scope.menuItems = [
      {
        "name": "menu_home",
        "img": "img/home.png",
        "ref": "app.home"
            },
      {
        "name": "parents_alerts",
        "img": "img/notes.png",
        "ref": "app.alerts"
            },
      {
        "name": "home_bus",
        "img": "img/bus.png",
        "ref": "app.bus"
            },
      {
        "name": "calendar",
        "img": "img/calendar.png",
        "ref": "app.calendar"
            },
      {
        "name": "logout",
        "img": "img/exit.png",
        "ref": "app.logout"
            }
        ];
  };

  // Categories submenu
  Config.init().then(function () {
    $scope.categoriesSubmenu = false;
    $scope.version = Config.getVersion();
    try {
      if (!$scope.isExpired()) {
        $scope.showNotExpiredPopup(Config.getExpirationDate());
      } else {
        $scope.showExpiredPopup(Config.getExpirationDate());
      }
    } catch (err) {
      //no expired time set, go on
    }
  });
  $scope.sendMail = function () {
    $scope.checkConnection().then(function () {
        window.open('mailto:ugas-help@smartcommunitylab.it?subject=UGAS Insegnanti: segnalazione problema','_system');
        return false;
      },
      function (err) {
        $scope.showNoConnection();
      });
  }
  $scope.logout = function () {
    $scope.checkConnection().then(function () {
      //first logout the exit from auth
      loginService.logout().then(function (done) {
        window.plugins.googleplus.logout(
          function (msg) {
            $state.go('app.login');
            $ionicHistory.nextViewOptions({
              disableBack: true,
              historyRoot: true
            });
          }
        );
      });
    }, function (err) {
      $scope.showNoConnection();
    });


  };
  $scope.toggleSubmenu = function () {
    $scope.categoriesSubmenu = !$scope.categoriesSubmenu;
  };


  $scope.isToday = function (date) {
      var today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      if (date < today.getTime()) {
        return false;
      }
      return true;
    }
    /* Utils */
  $scope.m2km = function (m) {
    return Math.round((m / 1000) * 10) / 10;
  }

  $scope.min2time = function (min) {
    return Math.floor(min / 60) + ':' + min % 60;
  }

  $scope.voteRound = function (vote) {
    return Math.round(vote * 10) / 10;
  }

  $scope.youtubeEmbed = function (url) {
    if (url) {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match && match[7].length == 11) {
        /*return 'http://img.youtube.com/vi/' + match[7] + '/0.jpg';*/
        return 'http://img.youtube.com/vi/' + match[7] + '/hqdefault.jpg';
        /*return 'http://img.youtube.com/vi/' + match[7] + '/mqdefault.jpg';*/
      } else {
        return null;
      }
    }
  }
  $scope.showNoConnection = function () {
    var alertPopup = $ionicPopup.alert({
      title: $filter('translate')("signal_send_no_connection_title"),
      template: $filter('translate')("signal_send_no_connection_template"),
      cssClass: 'no-connection-popup',
      buttons: [
        {
          text: $filter('translate')("signal_send_toast_alarm"),
          type: 'button-custom'
            }
        ]
    });

    alertPopup.then(function (res) {
      console.log('no place');
    });
  };
  $scope.window = {
      open: function (url, target) {
        window.open(url, target);
      }
    },
    function (err) {
      $scope.showNoConnection();

    }
  $scope.checkConnection = function () {
    var deferred = $q.defer();
    if (navigator.connection) {
      if (navigator.connection.type == Connection.NONE) {
        deferred.reject();
      } else {
        deferred.resolve();

      }
    };
    return deferred.promise;
  }
  $scope.goto = function (state) {
    $state.go(state);
    $scope.checkConnection().then(function () {
      $state.go(state);
    }, function (err) {
      $scope.showNoConnection();

    });
  }
  $scope.bringmethere = function (loc) {
    if (device != undefined && device.platform == "Android") {
      setTimeout(function () {
        window.open("http://maps.google.com/maps?daddr=" + loc[0] + "," + loc[1], "_system");
      }, 10);
    } else if (device != undefined && device.platform == "iOS") {
      var url = "maps:daddr=" + loc[0] + "," + loc[1];
      //successFn();
      setTimeout(function () {
        window.location = url;
      }, 10);
    } else {
      //console.error("Unknown platform");
      setTimeout(function () {
        window.open('http://maps.google.com/maps?daddr=' + loc[0] + ',' + loc[1], '_system');
      }, 10);
    }
    return false;
  };

  //tmp, cosa mi faccio arrivare? array di bambini?
  $scope.babies = [
    {
      id: "a",
      img: "http://ionicframework.com/img/docs/venkman.jpg",
      name: "Venkman",
      checked: true
        },
    {
      id: "b",
      img: "http://ionicframework.com/img/docs/stantz.jpg",
      name: "Ray",
      checked: false

        }
    ];
  $scope.babyselected = {
    id: "a",
    img: "http://ionicframework.com/img/docs/venkman.jpg",
    name: "Venkman",
    checked: true
  }

  $scope.selectBaby = function (item) {
    $scope.babyselected = item;
    for (var index = 0; index < $scope.babies.length; index++) {
      if ($scope.babyselected.id != $scope.babies[index].id) {
        $scope.babies[index].checked = false;
      }
    }
    setTimeout(function () {
      $scope.closePopover();
    }, 500);
  }
  $scope.popover = $ionicPopover.fromTemplateUrl('templates/dropdown.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
  });

  function onPause() {
    // handle background
    $rootScope.background = true;
  }

  function onResume() {
    // handle background
    $rootScope.background = false;
    $state.reload(); //in case of chat this let to sign messages to seen

  }
  document.addEventListener("resume", function () {
    onResume();
  });
  document.addEventListener("pause", function () {
    onPause();
  });
  $scope.isBackGround = function () {
    return $rootScope.background;
  };

  $scope.openPopover = function ($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function () {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function () {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function () {
    // Execute action
  });
  $scope.gotoSetting = function (id) {
    $state.go('app.babysetting', {
      id: id
    });
  }
});

function showNoPlace() {
  var alertPopup = $ionicPopup.alert({
    title: $filter('translate')("signal_send_no_place_title"),
    template: $filter('translate')("signal_send_no_place_template"),
    buttons: [
      {
        text: $filter('translate')("signal_send_toast_alarm"),
        type: 'button-custom'
            }
        ]
  });

  alertPopup.then(function (res) {
    console.log('no place');
  });
};



function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
};
