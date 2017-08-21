angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.postgallery', [])

.controller('PostGalleryCtrl', function ($scope, galleryService) {
    $scope.photos = galleryService.getSelectedGallery();
    $scope.galleryDefaultPhotoIndex = galleryService.getDefaultPhotoIndex();
    if ($scope.photos === null) { //tmp, for development purpose...
        $scope.photos = [
            {
                "url": "http://piattaformainfanzia.org/wp-content/uploads/2014/09/campus2.jpg"
            },
            {
                "url": "http://unparcodiemozioni.com/siti/workinprogress/wp-content/uploads/2012/10/BAMBINI-NEL-PARCO-X-WORK.jpg"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Happy_child.jpg"
            },
            {
                "url": "http://theartmad.com/wp-content/uploads/2015/02/Baby-34.jpg"
            }
        ];
    } else {
        console.log(JSON.stringify($scope.photos));
    }
});
