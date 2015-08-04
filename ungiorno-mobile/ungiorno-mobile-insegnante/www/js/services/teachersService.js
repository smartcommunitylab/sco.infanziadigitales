angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.services.teachersService', [])

.factory('teachersService', function ($http, $q) {
    var teachers = null;
    var selectedTeacher = null;
    var teachersService = {};

    teachersService.getTeachers = function () {
        return teachers;
    }

    teachersService.setTeachers = function (item) {
        teachers = item;
    }

    teachersService.getSelectedTeacher = function () {
        return selectedTeacher;
    }

    teachersService.setSelectedTeacher = function (item) {
        selectedTeacher = item;
    }

    return teachersService;
})
