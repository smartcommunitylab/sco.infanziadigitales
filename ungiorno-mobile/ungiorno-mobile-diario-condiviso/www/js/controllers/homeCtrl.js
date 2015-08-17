angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])

.controller('HomeCtrl', function ($scope, dataServerService, $ionicModal) {

    var newPostModal;
    $scope.today = new Date();
    var postToCreate;

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
        postToCreate = new Object();
        $scope.setMood(0);
		newPostModal.show()
	}

	$scope.newPost = function(post) {
        postToCreate.description = $scope.newPost.description;
        $scope.attachedTags.forEach(function (obj) { //hashkey generated for some random reason, remove it!
            delete obj["$$hashKey"];
        });
        postToCreate.tags = $scope.attachedTags;
        //postToCreate.photos = newPostModal.newPost.photos;
        //postToCreate.date = newPostModal.newPost.date;
        console.log(JSON.stringify(postToCreate));
        newPostModal.hide();
	}

    $scope.setMood = function (moodCode) {
       postToCreate.mood = moodCode;
    }

});
