angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.gallery', [])

.controller('GalleryCtrl', function ($scope, dataServerService, profileService, $ionicModal, $ionicSlideBoxDelegate, Config) {
    $scope.photos = [];
    dataServerService.getGalleryByBabyId(profileService.getBabyProfileById(localStorage.currentBabyID).schoolId, localStorage.currentBabyID).then(function (images) {
        if (images.data) {
            for (var i = 0; i < images.data.length; i++) {
                $scope.photos.push(Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + profileService.getBabyProfileById(localStorage.currentBabyID).schoolId + '/' + localStorage.currentBabyID + '/' + images.data[i].multimediaId + '/image');
            }
        }
    }, function (err) {
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        $ionicLoading.hide();
    });

    $scope.getImageAction = function (index) {
        $scope.openModal(index);
    };


    $ionicModal.fromTemplateUrl('templates/gallerymodal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function (index) {
        var currentIndex = 0;
        if (index >= 0) {
            currentIndex = index;
        }
        $scope.photo = $scope.photos[currentIndex];
        $scope.modal.show();
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});
