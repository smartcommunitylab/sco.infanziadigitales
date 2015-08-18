angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.galleryService', [])

.factory('galleryService', function ($http, $q) {
    var selectedGallery = null;
    var galleryService = {};

    galleryService.getSelectedGallery = function () {
        return selectedGallery;
    }

    galleryService.setSelectedGallery = function (item) {
        selectedGallery = item;
    }

    return galleryService;
})
