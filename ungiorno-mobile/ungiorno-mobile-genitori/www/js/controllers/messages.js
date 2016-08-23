angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.messages', [])

.controller('MessagesCtrl', function ($scope, $rootScope, $filter, messagesService, Toast, profileService, $interval, $ionicScrollDelegate, $ionicLoading, $ionicScrollDelegate) {

    var babyProfile = profileService.getBabyProfile();
    var IS_PARENT = 'parent';
    var IS_TEACHER = 'teacher';
    $scope.all = 10;

    $scope.status = {
        loading: false,
        loaded: false
    };
    $scope.init = function () {
        $rootScope.messages = [];
        $scope.end_reached = false;
        messagesService.getMessages(null, null, babyProfile.schoolId, babyProfile.kidId).then(function (data) {
            $rootScope.messages = data.slice().reverse(); //turn the order from top to bottom
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
    $scope.checkMessage = function (message) {

        if (!message.received) {
            //set received
            messagesService.receivedMessage(message.schoolId, message.kidId, message.messageId);
        }
        if (!message.seen) {
            //set seen
            messagesService.seenMessage(message.schoolId, message.kidId, message.messageId);
        }
    }
    $scope.loadMore = function () {
        if (!$scope.loading) {
            $scope.loading = true;

            messagesService.getMessages($rootScope.messages[0].creationDate - 1, $scope.all, babyProfile.schoolId, babyProfile.kidId).then(function (data) {
                if (data) {
                    var newmessages = data.slice();
                    //var newmessages = data;

                    if (!!$rootScope.messages) {
                        for (var i = 0; i < newmessages.length; i++)
                            $rootScope.messages.unshift(newmessages[i]);
                    } else {
                        $rootScope.messages = newmessages;
                    }
                    // $rootScope.messages = !!$rootScope.messages ? $rootScope.messages.concat(newmessages) : newmessages;
                    if ($rootScope.messages.length == 0) {
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
                    $rootScope.messages = $rootScope.messages.concat(msg);
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
            var date = $filter('date')($rootScope.messages[indexOfMessage].creationDate, 'dd,MM,yyyy');
            var previousdate = $filter('date')($rootScope.messages[indexOfMessage - 1].creationDate, 'dd,MM,yyyy');

            if (date != previousdate) {
                return true;

            }
            return false;
        }
        //    var updateChat = function () {
        //        messagesService.getDiscussion(null, null, babyProfile.schoolId, babyProfile.kidId).then(function (discussion) {
        //            $rootScope.messages = discussion.messages ? discussion.messages : [];
        //            if ($rootScope.messages.length > 10) {
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
