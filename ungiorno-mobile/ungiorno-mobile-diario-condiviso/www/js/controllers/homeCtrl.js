angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])

.controller('HomeCtrl', function ($scope, dataServerService, $ionicModal, $cordovaCamera, $ionicPopover) {

    var newPostModal;
    var photoSrcSelect;
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

	$scope.createPost = function() {
        $scope.postToCreate = new Object();
        $scope.postToCreate.photos = [];
        $scope.setMood(0);
        $scope.newPost.date = new Date();
        $scope.newPost.description = "";
        $scope.newPost.photos = [];
        $scope.attachedTags = [];
		newPostModal.show();
	}

	$scope.newPost = function(post) {
        $scope.postToCreate.description = $scope.newPost.description;
        $scope.attachedTags.forEach(function (obj) { //hashkey generated for some random reason, remove it!
            delete obj["$$hashKey"];
        });
        $scope.postToCreate.tags = $scope.attachedTags;
        $scope.postToCreate.date = $scope.newPost.date;
        console.log(JSON.stringify($scope.postToCreate));
        newPostModal.hide();
	}

    $scope.setMood = function (moodCode) {
       $scope.postToCreate.mood = moodCode;
    }

    $scope.addPhoto = function ($event, photoSrc) {

        if (photoSrc === undefined) {

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

});
