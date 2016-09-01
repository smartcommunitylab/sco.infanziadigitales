angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.babyprofile', [])

.controller('babyprofileCtrl', function ($scope, dataServerService, profileService, babyConfigurationService, Config, $filter, Toast, $ionicLoading, $rootScope, $ionicPopup, $ionicScrollDelegate, teachersService, messagesService) {

    var IS_PARENT = 'parent';
    var IS_TEACHER = 'teacher';
    $scope.all = 10;
    $scope.teacher = {};
    $scope.newMessage = "";
    $scope.showLoader = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0,
        });
        $scope.dataLoaded = false;
    };

    $scope.checkBusServiceActive = function () {
        return $scope.babyInformations.bus.active && $scope.babyInformations.bus.enabled && $scope.babyInformations.stopId != null;
    }
    var getBusStopAddressByID = function (busStopID) {
        for (var i = 0; i < $scope.babyProfile.services.bus.stops.length; i++) {
            if ($scope.babyProfile.services.bus.stops[i].stopId === busStopID) {
                return $scope.babyProfile.services.bus.stops[i].address;
            }
        }

    }
    var getParents = function (babyProfile) {
        parents = [];
        for (var i = 0; i < babyProfile.persons.length; i++) {
            if (babyProfile.persons[i].parent)

                parents.push(babyProfile.persons[i])
        }
        return parents;
    }

    var checkAllDataLoaded = function () {
        if ($scope.babyProfileLoaded && $scope.notesLoaded) {
            $scope.calculateOtherData();
            $scope.dataLoaded = true;
            $ionicLoading.hide();
        }
    }
    var setTeachers = function () {
        $scope.teachers = teachersService.getTeachers();
        if ($scope.teachers) {
            $scope.teacher = $scope.teachers[0];
        }

    }
    $scope.messageInit = function () {
        if (!$rootScope.messages) {
            $rootScope.messages = {};
        }
        $scope.end_reached = false;
        messagesService.getMessages(null, null, $scope.babyProfile.schoolId, $scope.babyProfile.kidId).then(function (data) {
            if (data) {
                $rootScope.messages[$scope.babyProfile.kidId] = data.slice().reverse(); //turn the order from top to bottom
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
            messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".seen", function (message) {
                console.log(message);
                if (message.body && messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body)) {
                    messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body).seen = true;

                }
                //set message to seen
            });
            //message received
            messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".received", function (message) {
                console.log(message);
                console.log(message);
                if (message.body && messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body)) {
                    messagesService.getByValue($rootScope.messages[$scope.babyProfile.kidId], message.body).received = true;

                }
            });
            //            user is typing
            messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId + ".typing", function (message) {
                var parsed = JSON.parse(message.body);
                if (parsed.username == $scope.username) return;

                for (var index in $scope.participants) {
                    var participant = $scope.participants[index];

                    if (participant.username == parsed.username) {
                        $scope.participants[index].typing = parsed.typing;
                    }
                }
            });


            //get new message
            messagesService.subscribe("/topic/toteacher." + Config.appId() + "." + $scope.babyProfile.kidId, function (message) {
                console.log(message);
                if (message.body) {
                    var chatMessage = JSON.parse(message.body);
                    var newMessage = {
                        "appId": Config.appId(),
                        "schoolId": chatMessage.content.schoolId,
                        "messageId": chatMessage.content.messageId,
                        "kidId": chatMessage.content.kidId,
                        "teacherId": chatMessage.content.teacherId,
                        "sender": "parent",
                        "creationDate": chatMessage.timestamp,
                        "received": true,
                        "seen": true,
                        "text": chatMessage.description
                    }
                    if ($rootScope.messages[chatMessage.content.kidId]) {
                        $rootScope.messages[chatMessage.content.kidId].push(newMessage);
                        messagesService.receivedMessage(chatMessage.content.schoolId, chatMessage.content.kidId, chatMessage.content.messageId);
                        messagesService.seenMessage(chatMessage.content.schoolId, chatMessage.content.kidId, chatMessage.content.messageId);
                    }
                    $ionicScrollDelegate.scrollBottom();
                }
            });


        }, function (error) {
            console.log('Connection error ' + error);

        });
    }
    $scope.init = function () {
        $scope.parents = [];
        $scope.newNote = {
            argument: "",
            description: ""
        }

        $scope.babyProfileLoaded = false;
        $scope.notesLoaded = false;
        $scope.dataLoaded = false;
        $scope.showLoader();
        $scope.schoolProfile = profileService.getSchoolProfile();
        $scope.babyInformations = profileService.getCurrentBaby();
        setTeachers();
        $scope.relation = "";
        var babyProfileID = $scope.babyInformations.kidId;

        //Acquiring data from server
        profileService.getBabyProfileById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
            if (data) {
                $scope.babyProfile = data;
                $scope.parents = getParents(data);
                $scope.babyProfileLoaded = true;
                checkAllDataLoaded();
                $scope.messageInit();
            } else {
                $ionicLoading.hide();
                Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            }
        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
        });
        babyConfigurationService.getBabyNotesById($scope.schoolProfile.schoolId, babyProfileID).then(function (data) {
            if (data) {
                if (data[0]) {
                    $scope.notes = data[0];
                } else {
                    $scope.notes = {};
                }
                $scope.notesLoaded = true;
                checkAllDataLoaded();
            } else {
                $ionicLoading.hide();
                Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            }
        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
        });
    }
    $scope.calculateOtherData = function () {

        $scope.babyEnterHour = ($scope.babyInformations.anticipo.active && $scope.babyInformations.anticipo.enabled) ? $scope.schoolProfile.anticipoTiming.fromTime : $scope.schoolProfile.regularTiming.fromTime;

        //used to get if the baby is present
        var now = new Date();
        if ($scope.babyInformations.exitTime == null) {
            $scope.babyStatus = $filter('translate')('absent');
        } else {
            var exitDayWithHour = new Date($scope.babyInformations.exitTime); //TODO: make a decision on server, timestamp in seconds or milliseconds?!?

            $scope.babyStatus = now > exitDayWithHour ? $filter('translate')('exit') : $filter('translate')('present');
        }

        if ($scope.checkBusServiceActive()) {
            //$scope.babyBusStopBackName = getBusStopAddressByID($scope.babyInformations.stopId);
            //tmp because stops have no data for address
            $scope.babyBusStopBackName = $scope.babyInformations.stopId;
        }
        for (var i = 0; i < $scope.babyProfile.persons.length; i++) {
            if ($scope.babyProfile.persons[i].personId == $scope.babyInformations.personId)
                if (!$scope.babyProfile.persons[i].parent) {
                    $scope.relation = $scope.babyProfile.persons[i].relation;
                } else {
                    $scope.relation = $filter('translate')('relation_parent');

                }
        }
    }


    //Custom methods
    $scope.callPhone = function (number) {
        console.log("Calling " + number);
        document.location.href = 'tel:' + number;
    }

    $scope.sendTeacherNote = function () {
        //temporarly disabled
        //if ($scope.newNote.argument === "") {
        //Toast.show($filter('translate')('select_argument'), 'short', 'bottom');
        // } else
        if ($scope.newNote.description === "") {
            Toast.show($filter('translate')('type_description'), 'short', 'bottom');
        } else { //all data are correct
            //            var note = {
            //                date: new Date().getTime(),
            //                schoolNotes: [
            //                    {
            //                        type: $scope.newNote.argument.typeId,
            //                        note: $scope.newNote.description
            //                    }
            //                ]
            //            }
            var note = {
                "kidId": $scope.babyProfile.kidId,
                "teacherId": $scope.teacher.teacherId,
                "text": $scope.newMessage
            }
            var requestFail = function () {
                var myPopup = $ionicPopup.show({
                    title: $filter('translate')('note_sent_fail'),
                    scope: $scope,
                    buttons: [
                        {
                            text: $filter('translate')('cancel'),
                            type: 'cancel-button'
                        },
                        {
                            text: '<b>' + $filter('translate')('retry') + '</b>',
                            type: 'create-button',
                            onTap: function (e) {
                                $scope.sendTeacherNote();
                            }
                        }
                    ]
                });
            }

            var requestSuccess = function (data) {
                Toast.show($filter('translate')('note_sent_success'), 'short', 'bottom');
                $scope.newNote.argument = "";
                $scope.newNote.description = "";
                //update the new notes

                if (data != null && data.data != null && data.data.schoolNotes != null) {
                    if (!$scope.notes) {
                        $scope.notes = {};
                    }
                    $scope.notes.schoolNotes = data.data.schoolNotes;
                }
                if (data != null && data.data != null && data.data.parentNotes != null) {
                    if (!$scope.notes) {
                        $scope.notes = {};
                    }
                    $scope.notes.parentNotes = data.data.parentNotes;
                }
            }


            dataServerService.addNewNoteForParents($scope.schoolProfile.schoolId, $scope.babyProfile.kidId, $scope.teacher.teacherId, note).then(function (data) {
                requestSuccess(data);
            }, function (data) {
                requestFail();
            });
        }

    }
    $scope.changeTeacher = function (teacher) {
        $scope.teacher = teacher;
    }
    $scope.sendMessage = function (text) {
        if (text != null && text != '') {
            //create message


            $ionicLoading.show();
            $scope.newMessage;
            messagesService.sendMessage($scope.babyProfile.schoolId, $scope.babyProfile.kidId, $scope.teacher.teacherId, text).then(
                function (msg) {
                    // init(); temporary commented. why reinitialize the list?
                    $rootScope.messages[$scope.babyProfile.kidId] = $rootScope.messages[$scope.babyProfile.kidId].concat(msg);
                    $ionicLoading.hide();
                    $scope.newMessage = '';
                    $ionicScrollDelegate.scrollBottom();
                },
                function (err) {
                    $ionicLoading.hide();
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                }
            );
        }

        $ionicScrollDelegate.scrollBottom();
        $scope.newMessage = '';
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
    $scope.isMe = function (id) {
        if (id == IS_TEACHER) {
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
    $scope.getProfileImage = function () {
        var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + $scope.schoolProfile.schoolId + "/" + $scope.babyProfile.kidId + "/true/images";
        return image;
    }

    $scope.init();
});
