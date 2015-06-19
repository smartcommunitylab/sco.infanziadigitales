angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.assenza', [])

.controller('AssenzaCtrl', function ($scope) {
    $scope.isMalattia = false;
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
    $scope.malattieArray = ['Influenza', 'Varicella', 'Pertosse'];
});
