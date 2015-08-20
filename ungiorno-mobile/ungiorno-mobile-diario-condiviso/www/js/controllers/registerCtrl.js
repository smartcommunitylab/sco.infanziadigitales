angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.register', [])

.controller('RegisterCtrl', function ($scope, dataServerService) {

        $scope.steps = [
        {
            done: true
        },
        {
            done: false
        },
        {
            done: false
        },
        {
            done: false
        },
        ];

});
