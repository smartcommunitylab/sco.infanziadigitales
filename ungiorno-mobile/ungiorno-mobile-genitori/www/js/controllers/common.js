angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.common', [])

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

.controller('AppCtrl', function ($scope, $rootScope, $cordovaDevice, $ionicModal, $ionicHistory, $timeout, $filter, $ionicPopover, $state, $ionicSideMenuDelegate, Toast, Config, profileService) {
    $scope.profilesOpen = false;
    $scope.expandProfiles = false;

    $scope.toggleProfile = function () {
        $scope.profilesOpen = !$scope.profilesOpen;
    }
    $scope.changeKid = function (kid) {
        $scope.selectBaby(kid);
        $scope.toggleProfile();
        $ionicSideMenuDelegate.toggleLeft();
    }
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

    $scope.babyselected = null;
    $scope.babies = [];
    // Categories submenu
    $scope.categoriesSubmenu = false;
    $scope.version = Config.getVersion();
    $scope.toggleSubmenu = function () {
        $scope.categoriesSubmenu = !$scope.categoriesSubmenu;
    };


    $scope.getProfiles = function () {
        $scope.babyselected = profileService.getBabyProfile();
        $scope.babies = profileService.getBabiesProfiles();
    }
    $scope.isToday = function (date) {
        var inputDate = new Date(date);
        inputDate.setHours(0, 0, 0, 0);

        inputDate.setMilliseconds
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate.getTime() == today.getTime()) {
            return true;
        }
        return false;
    }
    $scope.isYesterday = function (date) {
            var inputDate = new Date(date);
            inputDate.setHours(0, 0, 0, 0);
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            if (inputDate.getTime() == yesterday.getTime()) {
                return true;
            }
            return false;
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

    $scope.window = {
        open: function (url, target) {
            window.open(url, target);
        }
    };

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
    $scope.selectBaby = function (item) {
        //changeNewProfile
        $scope.babyselected = item;
        profileService.setBabyProfile(item);
        $rootScope.loadConfiguration($scope.babyselected.schoolId, $scope.babyselected.kidId);

    }

    $scope.gotoSetting = function (id) {
        $state.go('app.babysetting', {
            id: id
        });
    }

    $scope.getProfileImage = function (kid) {
        var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + kid.schoolId + "/" + kid.kidId + "/false/images";
        return image;
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

function showNoConnection() {
    var alertPopup = $ionicPopup.alert({
        title: $filter('translate')("signal_send_no_connection_title"),
        template: $filter('translate')("signal_send_no_connection_template"),
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
