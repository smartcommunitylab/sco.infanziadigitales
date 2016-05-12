angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])

.controller('HomeCtrl', function ($scope, $filter, $rootScope, $ionicModal, $cordovaCamera, $ionicPopover, $state, galleryService, profileService, dataServerService, ionicDatePicker) {

    /* START IONIC DATEPICKER */

    $scope.date = new Date();
    console.log($scope.date);

    $scope.dateFormat = $filter('date')('yyyy-MM-dd');
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

    if (!dataServerService.userIsLogged()) {
        $state.go('app.login');
        return;
    }

    var init = function () {
        profileService.init().then(function (data) {
            $rootScope.kidProfiles = data;
            profileService.getCurrentBaby().then(function (data) {
                if ($rootScope.selectedKid) {
                    $scope.baby = data;
                    dataServerService.getPostsByBabyId($scope.baby.kidId).then(function (posts) {
                        $scope.posts = posts;
                    });
                }
            });
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
        $scope.currentPost.date = new Date();
        $scope.currentPost.description = "";
        $scope.currentPost.photos = [];
        $scope.currentPost.attachedTags = [];
        $scope.setMood(0);
        $scope.newPostModal.show();
    }
    $scope.cancel = function () {
        $scope.newPostModal.hide();
    }

    $scope.save = function (post) { //function called when a new post is submitted and also when a post is edited
        dataServerService.save(post).then(
            function (posts) {
                $scope.posts = posts;
                $scope.newPostModal.hide();
            },
            function (err) {
                console.log(err);
            }
        );
        //        if (editPostMode) {
        //            //TODO: update server
        //        } else {
        //            $scope.currentPost.attachedTags.forEach(function (obj) { //hashkey generated for some random reason, remove it!
        //                delete obj["$$hashKey"];
        //            });
        //            console.log(JSON.stringify($scope.currentPost));
        //            //TODO: update server
        //        }

    }

    $scope.setMood = function (moodCode) {
        if ($scope.currentPost.mood == moodCode) $scope.currentPost.mood = 0;
        else $scope.currentPost.mood = moodCode;
    }

    $scope.addPhoto = function ($event, photoSrc) {

        if (photoSrc === undefined) {
            //Maybe is better a ActionSheet? http://codepen.io/mhartington/pen/KwBpRq
            var template = '<ion-popover-view><ion-content><ion-list><ion-item ng-click="addPhoto($event, \'Camera\')">Camera</ion-item><ion-item ng-click="addPhoto($event, \'Gallery\')">Gallery</ion-item></ion-list></ion-content></ion-popover-view>';

            if (photoSrcSelect === undefined) {
                photoSrcSelect = $ionicPopover.fromTemplate(template, {
                    scope: $scope
                });
            }

            photoSrcSelect.show($event);
        } else {
            if (photoSrcSelect !== undefined) {
                photoSrcSelect.hide();
            }
            var options = {};

            if (photoSrc === 'Camera') {
                options = {
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false
                };
            } else {
                options = {
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY, // Camera.PictureSourceType.PHOTOLIBRARY
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false
                };
            }

            $cordovaCamera.getPicture(options).then(function (imageData) {
                var image;
                image = "data:image/jpeg;base64," + imageData;
                $scope.postToCreate.photos.push(image);
                $scope.imageBase64.push(imageData);
            }, function (err) {
                console.log(err);
            });
        }
    }

    $scope.removePhoto = function (index) {
        $scope.postToCreate.photos.splice(index, 1);
    }

    $scope.openEditPost = function (post) {
        editPostMode = true;

        $scope.currentPost = {};
        $scope.currentPost.date = new Date(post.date * 1000);
        $scope.currentPost.description = post.text;
        $scope.currentPost.photos = post.pictures;
        $scope.currentPost.attachedTags = post.tags;
        $scope.setMood(post.mood);
        $scope.newPostModal.show();
    }

    $scope.sharePost = function (post) {
        //TODO: have to define what to share
    }

});