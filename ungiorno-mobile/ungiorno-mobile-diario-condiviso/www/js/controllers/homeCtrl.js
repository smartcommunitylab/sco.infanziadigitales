angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])

.controller('HomeCtrl', function ($scope, dataServerService, $ionicModal) {

    var newPostModal;
    $scope.today = new Date();

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
		newPostModal = modal
	})

	$scope.createPost = function() {
		newPostModal.show()
	}

	$scope.newPost = function(post) {
        newPostModal.hide();
	}

});
