angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.assenza',  [])

.controller('AssenzaCtrl', function ($scope, profileService) {
    $scope.isMalattia = false;
    $scope.profile = profileService.getSchoolProfile();

    $scope.showSelect = function(intInput)
    {
        if(intInput === 1)
        {
            $scope.isMalattia = true;
        }
        else
        {
            $scope.isMalattia = false;
        }
    }

    $scope.radiobuttonArray = ['Vaccino', 'Pidocchi'];
});
