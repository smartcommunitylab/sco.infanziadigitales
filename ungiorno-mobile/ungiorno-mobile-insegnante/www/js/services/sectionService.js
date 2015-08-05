angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.sectionService', [])

.factory('sectionService', function ($http, $q) {
    var selectedSection = null;
    var sectionService = {};


    sectionService.setSection = function (section) {
        selectedSection = section;
    }

    sectionService.getBabyProfile = function () {
        return selectedSection;
    }


    return sectionService;
})
