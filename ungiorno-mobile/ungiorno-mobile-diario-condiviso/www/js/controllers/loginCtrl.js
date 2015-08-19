angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.login', [])

.controller('LoginCtrl', function ($scope, dataServerService) {

    $scope.steps = [
        {
            done: true
        },
        {
            done: false
        }
        ];

});
