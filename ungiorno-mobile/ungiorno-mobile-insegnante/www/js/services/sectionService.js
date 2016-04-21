angular.module('it.smartcommunitylab.infanziadigitales.teachers.services.sectionService', [])

.factory('sectionService', function ($http, $q) {
    var selectedSection = null;
    var sectionService = {};


    sectionService.setSection = function (section) {
        selectedSection = section;
    }
    sectionService.getSection = function () {
        return selectedSection;
    }

    return sectionService;
})
