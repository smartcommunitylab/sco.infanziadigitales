angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.galleryService', [])

.factory('galleryService', function ($http, $q) {
    var selectedGallery = null;
    var galleryService = {};
    var defaultPhotoIndex = 0;

    galleryService.getSelectedGallery = function () {
        return selectedGallery;
    }

    galleryService.getDefaultPhotoIndex = function () {
        return defaultPhotoIndex;
    }

    galleryService.setSelectedGallery = function (item, index) {
        selectedGallery = item;
        defaultPhotoIndex = typeof index !== 'undefined' ? index : 0;
    }

    return galleryService;
})
