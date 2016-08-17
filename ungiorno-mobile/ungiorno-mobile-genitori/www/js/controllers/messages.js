angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.messages', [])

.controller('MessagesCtrl', function ($scope, $rootScope, $filter, messagesService, Toast, profileService, $interval, $ionicScrollDelegate, $ionicLoading, $ionicScrollDelegate) {

    var babyProfile = profileService.getBabyProfile();
    var IS_PARENT = 'parent';
    var IS_TEACHER = 'teacher';
    $scope.status = {
        loading: false,
        loaded: false
    };
    $scope.init = function () {
        $scope.messages = [];
        $scope.all = 10;
        $scope.end_reached = false;
        messagesService.getMessages(null, null, babyProfile.schoolId, babyProfile.kidId).then(function (data) {
            $scope.messages = data.slice().reverse(); //turn the order from top to bottom
            $ionicScrollDelegate.scrollBottom();
        }, function (error) {
            $ionicLoading.hide();
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        });
    }
    $scope.isMe = function (id) {
        if (id == IS_PARENT) {
            return true;
        }
        return false;
    }
    var counter = 0;

    $scope.loadMore = function () {
        if (!$scope.loading) {
            $scope.loading = true;

            messagesService.getMessages($scope.messages[0].creationDate - 1, $scope.all, babyProfile.schoolId, babyProfile.kidId).then(function (data) {
                if (data) {
                    var newmessages = data.slice();
                    //var newmessages = data;

                    if (!!$scope.messages) {
                        for (var i = 0; i < newmessages.length; i++)
                            $scope.messages.unshift(newmessages[i]);
                    } else {
                        $scope.messages = newmessages;
                    }
                    // $scope.messages = !!$scope.messages ? $scope.messages.concat(newmessages) : newmessages;
                    if ($scope.messages.length == 0) {
                        $scope.emptylist = true;
                    }
                    if (data.length >= $scope.all) {
                        $scope.end_reached = false;
                    } else {
                        $scope.end_reached = true;
                    }
                } else {
                    $scope.emptylist = true;
                    $scope.end_reached = true;
                    Toast.show($filter('translate')("pop_up_error_server_template"), "short", "bottom");

                }
                $scope.loading = false;

            }, function (err) {

                $scope.end_reached = true;
                $scope.loading = false;

            });
        }
    };
    $scope.refresh = function () {
        if ($ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top == 0 && !$scope.end_reached) {
            //refresh
            $scope.loadMore();
        }
    }
    $scope.sendMessage = function (text) {
        if (text != null && text != '') {
            //create message


            $ionicLoading.show();
            messagesService.sendMessage(babyProfile.schoolId, babyProfile.kidId, text).then(
                function (msg) {
                    // init(); temporary commented. why reinitialize the list?
                    $scope.messages = $scope.messages.concat(msg);
                    $ionicLoading.hide();
                    $ionicScrollDelegate.scrollBottom();
                },
                function (err) {
                    $ionicLoading.hide();
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                }
            );
        }

        $ionicScrollDelegate.scrollBottom();
        $scope.new_message = '';
    };
    $scope.isANewDate = function (indexOfMessage) {
            if (indexOfMessage == 0) {
                return true;
            }
            var date = $filter('date')($scope.messages[indexOfMessage].creationDate, 'dd,MM,yyyy');
            var previousdate = $filter('date')($scope.messages[indexOfMessage - 1].creationDate, 'dd,MM,yyyy');

            if (date != previousdate) {
                return true;

            }
            return false;
        }
        //    var updateChat = function () {
        //        messagesService.getDiscussion(null, null, babyProfile.schoolId, babyProfile.kidId).then(function (discussion) {
        //            $scope.messages = discussion.messages ? discussion.messages : [];
        //            if ($scope.messages.length > 10) {
        //                $scope.oldMsgPresent = true;
        //            }
        //        });
        //
        //    }

    //    $scope.$on('$ionicView.enter', function () {
    //        // $scope.init();
    //        if (!window.ParsePushPlugin) {
    //            $scope.interval = $interval(updateChat, 10000);
    //        }
    //    });

    $scope.init();
});
