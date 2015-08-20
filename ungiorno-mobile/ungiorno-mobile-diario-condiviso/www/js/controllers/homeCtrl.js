angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])

.controller('HomeCtrl', function ($scope, dataServerService, $ionicModal, $cordovaCamera, $ionicPopover, galleryService, $state) {

    var newPostModal;
    var photoSrcSelect;

    var editPostMode;

    $scope.today = new Date();

    $scope.attachedTags = [];

    dataServerService.getBabyProfile("a").then(function (baby) {
        $scope.baby = baby;
    });

    dataServerService.getPostsByBabyId("a").then(function (posts) {
        $scope.posts = posts;
    });

    $ionicModal.fromTemplateUrl('templates/newPostModal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		newPostModal = modal;
	})


    dataServerService.getTags().then(function (data) {
        $scope.tagsFromServer = data.data;
    });

	$scope.openCreatePost = function() {
        editPostMode = false;

        $scope.currentPost = {};
        $scope.currentPost.date = new Date();
        $scope.currentPost.description = "";
        $scope.currentPost.photos = [];
        $scope.currentPost.attachedTags = [];
        $scope.setMood(0);
		newPostModal.show();
	}

	$scope.newPost = function(post) { //function called when a new post is submitted and also when a post is edited

        if (editPostMode) {
            //TODO: update server
        } else {
            $scope.currentPost.attachedTags.forEach(function (obj) { //hashkey generated for some random reason, remove it!
                delete obj["$$hashKey"];
            });
            console.log(JSON.stringify($scope.currentPost));
            //TODO: update server

            newPostModal.hide();
        }

	}

    $scope.setMood = function (moodCode) {
       $scope.currentPost.mood = moodCode;
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
		newPostModal.show();
    }

    $scope.sharePost = function (post) {
        //TODO: have to define what to share
    }

});
