angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.common', [])

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

.controller('AppCtrl', function ($scope, $rootScope, $location, $cordovaDevice, $ionicModal, $ionicHistory, $timeout, Config, $filter, $ionicPopover, $state, $ionicSideMenuDelegate, diaryService, dataServerService, profileService, $window) {

    $scope.profilesOpen = false;
    $scope.toggleProfile = function () {
        $scope.profilesOpen = !$scope.profilesOpen;
    }
    $scope.changeKid = function (kidId, schoolId) {
        profileService.setCurrentBabyID(kidId, schoolId);
        //I must delete posts of old children
        $state.reload();
        $scope.toggleProfile();
        $ionicSideMenuDelegate.toggleLeft();
    }

    $scope.isParent = function () {
        return profileService.isParentProfile();
    }

    $scope.changeProfileType = function () {
        profileService.toggleUserProfile();
    };

    $scope.isMultiProfile = function () {
        return profileService.isMultiProfile();
    }

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

    $scope.window = {
        open: function (url, target) {
            window.open(url, target);
        }
    };
    $scope.getChildImage = function (child) {
        if (child && child.schoolId && child.kidId) {
            var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + child.schoolId + "/" + child.kidId + "/true/images";
            return image;
        } else return null;
    }
    $scope.goto = function (state) {
        $state.go(state);
    }
    $scope.gotodiary = function (createMode) {
        diaryService.setCreateDiaryMode(createMode);
        $state.go('app.dettaglidiario');
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
