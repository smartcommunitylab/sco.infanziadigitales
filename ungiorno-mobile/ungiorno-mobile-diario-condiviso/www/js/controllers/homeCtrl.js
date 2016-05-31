angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])


.controller('HomeCtrl', function ($scope, $filter, $rootScope, $ionicModal, $cordovaCamera, $ionicPopover, $ionicLoading, $state, galleryService, profileService, Toast, dataServerService, $ionicPopup, ionicDatePicker, $ionicHistory) {

    /* START IONIC DATEPICKER */
    $scope.date = new Date();
    /*console.log($scope.date);*/
    $scope.dateFormat = $filter('date')('yyyy-MM-dd');
    $rootScope.babyNum = 0;
    var isloaded = false;
    var dataloading = false;
    $scope.baby = {};
    $scope.posts = [];
    $scope.noMoreEntriesAvailable = false;
    var ipObj1 = {
        callback: function (val) { //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            datePickerCallback(val);
        },
        disabledDates: [],
        from: new Date(2012, 1, 1), //Optional
        to: new Date(2016, 10, 30), //Optional
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        disableWeekdays: [0], //Optional
        closeOnSelect: false, //Optional
        templateType: 'popup' //Optional
    };

    $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(ipObj1);
    };

    var datePickerCallback = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            console.log('Selected date is : ', val)
            $scope.date = val;
        }
    };



    /* END IONIC DATEPICKER */

    /*if (!dataServerService.userIsLogged()) {
        $state.go('app.login');
        return;
    }*/

    $scope.loadMore = function () {
        $ionicLoading.show();
        var length = 0;
        if ($scope.posts) {
            length = $scope.posts.length;
        }
        if ($scope.baby.schoolId && $scope.baby.kidId && !dataloading) {
            dataloading = true;
            dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd), length).then(function (posts) {
                if ($scope.posts) {
                    $scope.posts.push.apply($scope.posts, posts);
                    if (posts.length < 10) {
                        $scope.noMoreEntriesAvailable = true;
                    }
                } else {
                    $scope.posts = posts;

                }
                if ($scope.posts.length == 0) {
                    $scope.posts = null;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $ionicLoading.hide();
                dataloading = false;

            }, function (reason) {
                Toast.show($filter('translate')("network_problem"), "short", "bottom");
                $scope.noMoreEntriesAvailable = true;
                $scope.post = null;
                dataloading = false;
            })
        };

    }

    var init = function () {
        profileService.init().then(function () {
            $ionicLoading.show();
            $rootScope.kidProfiles = profileService.getAllBabyProfiles();
            $rootScope.babyNum = Object.keys($rootScope.kidProfiles).length;
            /*console.log($scope.babyNum);*/
            /*console.log("kidprofiles");console.log($rootScope.kidProfiles);*/
            profileService.getCurrentBaby().then(function (data) {
                if ($rootScope.selectedKid) {
                    $scope.baby = data;
                    //                    dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd), length).then(function (posts) {
                    //                        $scope.posts = posts;
                    //                        $ionicLoading.hide();
                    //                    }, function (err) {
                    //                        $scope.posts = null;
                    //                    });
                    $scope.loadMore();
                }
            }, function (err) {
                $scope.baby = null;
            });
            isloaded = true;
        });
    }
    init();

    $rootScope.$watch('selectedKid', function (a, b) {
        if (b == null || a.kidId != b.kidId) {
            init();
        }
    });

    $scope.newPostModal;
    var photoSrcSelect;
    var editPostMode;
    var todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    $scope.today = new Date();
    $scope.calendarOpen = false;
    $scope.showCalButton = true;
    $scope.toggleCalendar = function () {
        $scope.calendarOpen = !$scope.calendarOpen;
        if ($scope.calendarOpen) $scope.showCalButton = false;
        else setTimeout(function () {
            $scope.showCalButton = true;
            $scope.$apply();
        }, 300);
    }

    $scope.changeToday = function (today) {
        /*console.log(today);*/
        $scope.posts = [];
        $scope.noMoreEntriesAvailable = false;
        if (isloaded == true) {
            var from = today.split("-");
            // var todayEnd = new Date();
            //todayEnd.setHours(23, 59, 59, 999);
            todayEnd = new Date(from[0], from[1] - 1, from[2]);
            todayEnd.setHours(23, 59, 59, 999);
            console.log(todayEnd);
            $scope.loadMore();
            //            $ionicLoading.show();
            //            dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(endDate), length).then(function (posts) {
            //
            //                $scope.posts = posts;
            //                $ionicLoading.hide();
            //            });
        }
    }

    $scope.attachedTags = [];

    $ionicModal.fromTemplateUrl('templates/newPostModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.newPostModal = modal;
    })


    dataServerService.getTags().then(function (data) {
        $scope.tagsFromServer = data.data;
    });

    $scope.openCreatePost = function () {
        editPostMode = false;

        $scope.currentPost = {};
        $scope.currentPost.schoolId = $scope.baby.schoolId;
        $scope.currentPost.kidId = $scope.baby.kidId;

        $scope.currentPost.date = new Date();
        $scope.currentPost.text = "";
        $scope.currentPost.pictures = [];
        $scope.currentPost.tags = [];
        $scope.currentPost.authorId = profileService.getMyProfileID();

        //$scope.setMood(0);
        $scope.newPostModal.show();
    }
    $scope.cancel = function () {
        $scope.newPostModal.hide();
    }

    $scope.save = function () { //function called when a new post is submitted and also when a post is edited
        $ionicLoading.show();
        //add check params and return true or false if all data are correct
        //        var timeInMilisecond = $scope.currentPost.date.getTime();
        //        $scope.currentPost.date = timeInMilisecond;
        dataServerService.addPost($scope.baby.schoolId, $scope.baby.kidId, $scope.currentPost).then(
            function (posts) {
                //$scope.posts = posts;
                //update post
                $ionicLoading.show();
                dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd)).then(function (posts) {
                    $scope.posts = posts;
                    $ionicLoading.hide();
                });
                $scope.newPostModal.hide();
                $ionicLoading.hide();
                Toast.show($filter('translate')('add_post_done'), 'short', 'bottom');


            },
            function (err) {
                console.log(err);
                $ionicLoading.hide();
                Toast.show($filter('translate')('add_post_error'), 'short', 'bottom');


            }
        );
    }

    $scope.setMood = function (moodCode) {
        if ($scope.currentPost.mood == moodCode) $scope.currentPost.mood = 0;
        else $scope.currentPost.mood = moodCode;
    }

    $scope.addPhoto = function ($event, photoSrc) {

        if (photoSrc === undefined) {
            //Maybe is better a ActionSheet? http://codepen.io/mhartington/pen/KwBpRq
            photoSrcSelect = $ionicPopup.show({
                title: 'Aggiungi foto',
                scope: $scope,
                buttons: [
                    {
                        text: 'Gallery',
                        type: 'button-add-picture',
                        onTap: function (e) {
                            return $scope.addPhoto($event, 'Gallery')
                        }

                      },
                    {
                        text: 'Camera',
                        type: 'button-add-picture',
                        onTap: function (e) {
                            return $scope.addPhoto($event, 'Camera')
                        }
                    }
                                    ]
            });


        } else {
            if (photoSrcSelect !== undefined) {
                photoSrcSelect.close();
            }
            var options = {};

            if (photoSrc === 'Camera') {
                options = {
                    quality: 50,
                    //destinationType: Camera.DestinationType.DATA_URL,
                    destinationType: Camera.DestinationType.FILE_URI,
                    // In this app, dynamically set the picture source, Camera or photo gallery
                    sourceType: Camera.PictureSourceType.CAMERA,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.PICTURE,
                    allowEdit: false,
                    correctOrientation: true //Corrects Android orientation quirks
                }
            } else {
                options = {
                    quality: 50,
                    //destinationType: Camera.DestinationType.DATA_URL,
                    destinationType: Camera.DestinationType.FILE_URI,

                    // In this app, dynamically set the picture source, Camera or photo gallery
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.PICTURE,
                    allowEdit: false,
                    correctOrientation: true //Corrects Android orientation quirks
                }
            }


            $cordovaCamera.getPicture(options).then(function (imageData) {
                var image;
                // image = "data:image/jpeg;base64," + imageData;
                image = imageData;
                if ($scope.currentPost) {
                    if (!$scope.currentPost.pictures) {
                        $scope.currentPost.pictures = [];
                    }
                    $scope.currentPost.pictures.push(image);
                }
                if (!$scope.imageBase64) {
                    $scope.imageBase64 = [];
                }
                $scope.imageBase64.push(imageData);

            }, function (err) {
                console.log(err);
            });
        }
    }

    $scope.removePhoto = function (index) {
        $scope.currentPost.pictures.splice(index, 1);
    }

    $scope.openEditPost = function (post) {
        editPostMode = true;

        $scope.currentPost = {};
        $scope.currentPost.schoolId = $scope.baby.schoolId;
        $scope.currentPost.entryId = post.entryId;
        $scope.currentPost.kidId = $scope.baby.kidId;
        $scope.currentPost.date = new Date(post.date);
        $scope.date = $scope.currentPost.date;
        $scope.currentPost.text = post.text;
        $scope.currentPost.pictures = post.pictures;
        $scope.currentPost.tags = post.tags;
        $scope.currentPost.authorId = profileService.getMyProfileID();
        // $scope.setMood(post.mood);
        $scope.newPostModal.show();
    }

    $scope.removePost = function (post) {
        photoSrcSelect = $ionicPopup.show({
            title: 'Rimuovi post',
            scope: $scope,
            buttons: [
                {

                    text: $filter('translate')('delete_cancel'),
                    type: 'button-add-picture',


                      },
                {
                    text: $filter('translate')('delete_confirm'),
                    type: 'button-add-picture',
                    onTap: function (e) {
                        $ionicLoading.show();
                        dataServerService.removePost($scope.baby.schoolId, $scope.baby.kidId, post.entryId).then(function (posts) {
                            dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd), length).then(function (posts) {

                                //dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0,Date.parse(endDate), length).then(function (posts) {
                                $scope.posts = posts;
                                $ionicLoading.hide();
                                Toast.show($filter('translate')('delete_done'), 'short', 'bottom');

                            }, function (err) {
                                $ionicLoading.hide();
                                Toast.show($filter('translate')('delete_error'), 'short', 'bottom');
                            });
                        }, function (err) {
                            $ionicLoading.hide();
                            Toast.show($filter('translate')('error_popup_title'), 'short', 'bottom');
                        });
                    }
                    }
                                    ]
        });

    }

    $scope.sharePost = function (post) {
        //TODO: have to define what to share
    }

});
