angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.messages', [])

.controller('MessagesCtrl', function ($scope, $rootScope, $filter, messagesService, Toast, profileService, $interval, $ionicScrollDelegate, $ionicLoading, $ionicScrollDelegate, Config) {

    $scope.babyProfile = profileService.getBabyProfile();
    var IS_PARENT = 'parent';
    var IS_TEACHER = 'teacher';
    $scope.all = 10;
    var typing = undefined;
    $scope.status = {
        loading: false,
        loaded: false
    };
    $scope.isTyping = false;
    var isBackground = function () {
        return $rootScope.background;
    }


    $scope.startTyping = function () {
        // Don't send notification if we are still typing or we are typing a private message
        // if (angular.isDefined(typing) || $scope.sendTo != "everyone") return;
        if (angular.isDefined(typing)) return;
        typing = $interval(function () {
            $scope.stopTyping();
        }, 3000);

        messagesService.send("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", {}, JSON.stringify({
            //username: $scope.username,
            typing: true
        }));
    };

    $scope.stopTyping = function () {
        if (angular.isDefined(typing)) {
            $interval.cancel(typing);
            typing = undefined;

            messagesService.send("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", {}, JSON.stringify({
                //username: $scope.username,
                typing: false
            }));
        }
    };
    $scope.init = function () {
        if (!$rootScope.messages) {
            $rootScope.messages = {};
        }
        $scope.end_reached = false;
        messagesService.getMessages(null, null, $scope.babyProfile.schoolId, $scope.babyProfile.kidId).then(function (data) {
            if (data) {
                $rootScope.messages[$scope.babyProfile.kidId] = (data.slice() ? data.slice().reverse() : []); //turn the order from top to bottom
                $ionicScrollDelegate.scrollBottom();
            } else {
                $ionicLoading.hide();
                Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            }
        }, function (error) {
            $ionicLoading.hide();
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        });
        messagesService.init(Config.getServerURL() + '/chat');
        messagesService.connect(function (frame) {

            //          messages seen
            messagesService.subscribe("/topic/toparent." + Config.appId() + "." + $scope.babyProfile.kidId + ".seen", function (message) {
                console.log(message);
                if (message.body && messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body)) {
                    messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body).seen = true;

                }
                //set message to seen
            });
            //message received
            messagesService.subscribe("/topic/toparent." + Config.appId() + "." + $scope.babyProfile.kidId + ".received", function (message) {
                console.log(message);
                if (message.body && messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body)) {
                    messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body).received = true;

                }
            });
            //            user is typing
            messagesService.subscribe("/topic/toparent." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", function (message) {
                $scope.userAction = JSON.parse(message.body);
                $ionicScrollDelegate.resize();
                if ($scope.isBottom()) {
                    $ionicScrollDelegate.scrollBottom();
                }
                //                if (parsed.username == $scope.username) return;
                //
                //                for (var index in $scope.participants) {
                //                    var participant = $scope.participants[index];
                //
                //                    if (participant.username == parsed.username) {
                //                        $scope.participants[index].typing = parsed.typing;
                //                    }
                //                }
            });


            //get new message
            messagesService.subscribe("/topic/toparent." + Config.appId() + "." + $scope.babyProfile.kidId, function (message) {
                console.log(message);
                if (message.body) {
                    var chatMessage = JSON.parse(message.body);
                    var newMessage = {
                        "appId": Config.appId(),
                        "schoolId": chatMessage.content.schoolId,
                        "messageId": chatMessage.content.messageId,
                        "kidId": chatMessage.content.kidId,
                        "teacherId": chatMessage.content.teacherId,
                        "sender": "teacher",
                        "creationDate": chatMessage.timestamp,
                        "received": true,
                        "seen": true,
                        "text": chatMessage.description
                    }
                    if ($rootScope.messages[chatMessage.content.kidId]) {
                        $rootScope.messages[chatMessage.content.kidId].push(newMessage);

                        messagesService.receivedMessage(chatMessage.content.schoolId, chatMessage.content.kidId, chatMessage.content.messageId);
                        if (!isBackground()) {
                            messagesService.seenMessage(chatMessage.content.schoolId, chatMessage.content.kidId, chatMessage.content.messageId);
                        }

                    }

                    $ionicScrollDelegate.scrollBottom();
                }
            });


        }, function (error) {
            console.log('Connection error ' + error);

        });
    }
    $scope.isBottom = function () {

        var currentTop = $ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top;
        var maxScrollableDistanceFromTop = $ionicScrollDelegate.$getByHandle('handler').getScrollView().__maxScrollTop;

        if (currentTop >= maxScrollableDistanceFromTop) {
            return true;
        }
        return false;
    };
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

            messagesService.getMessages($rootScope.messages[$scope.babyProfile.kidId][0].creationDate - 1, $scope.all, $scope.babyProfile.schoolId, $scope.babyProfile.kidId).then(function (data) {
                    if (data) {
                        var newmessages = data.slice();
                        //var newmessages = data;

                        if (!!$rootScope.messages[$scope.babyProfile.kidId]) {
                            for (var i = 0; i < newmessages.length; i++)
                                $rootScope.messages[$scope.babyProfile.kidId].unshift(newmessages[i]);
                        } else {
                            $rootScope.messages[$scope.babyProfile.kidId] = newmessages;
                        }
                        // $rootScope.messages = !!$rootScope.messages ? $rootScope.messages.concat(newmessages) : newmessages;
                        if ($rootScope.messages[$scope.babyProfile.kidId].length == 0) {
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

                },
                function (err) {

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

            $scope.stopTyping();
            $ionicLoading.show();
            messagesService.sendMessage($scope.babyProfile.schoolId, $scope.babyProfile.kidId, text).then(
                function (msg) {
                    // init(); temporary commented. why reinitialize the list?
                    $rootScope.messages[$scope.babyProfile.kidId] = $rootScope.messages[$scope.babyProfile.kidId].concat(msg);
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
        var date = $filter('date')($rootScope.messages[$scope.babyProfile.kidId][indexOfMessage].creationDate, 'dd,MM,yyyy');
        var previousdate = $filter('date')($rootScope.messages[$scope.babyProfile.kidId][indexOfMessage - 1].creationDate, 'dd,MM,yyyy');

        if (date != previousdate) {
            return true;

        }
        return false;
    }
    $scope.$on("$destroy", function () {

        messagesService.finish();
    });


    $scope.init();
});
