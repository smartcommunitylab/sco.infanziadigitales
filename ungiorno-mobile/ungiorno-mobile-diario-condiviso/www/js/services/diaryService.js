angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.diaryservice', [])

.factory('diaryService', function () {
    var diaryService = {};
    var createDiaryMode = false;

    diaryService.getCreateDiaryMode = function () {
        return createDiaryMode;
    }

    diaryService.setCreateDiaryMode = function (createMode) {
        createDiaryMode = createMode;
    }

    return diaryService;
})
