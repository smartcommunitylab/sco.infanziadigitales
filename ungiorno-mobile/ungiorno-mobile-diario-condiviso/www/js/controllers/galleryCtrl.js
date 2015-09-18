angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.gallery', [])

.controller('GalleryCtrl', function ($scope, dataServerService, profileService) {
    dataServerService.getGalleryByBabyId(profileService.getCurrentBabyID()).then(function(images) {
        $scope.photos = images;
    });

});
