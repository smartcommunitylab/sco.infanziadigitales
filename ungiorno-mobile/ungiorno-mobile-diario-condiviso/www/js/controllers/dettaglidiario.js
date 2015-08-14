angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService) {
    var mode = "view";


    profileService.getBabyProfileById().then( function(data){
        $scope.baby = data;
    });


    $scope.modify = function(){
        mode = "edit";
    }
    $scope.save = function(){
        mode = "view";
    }

    $scope.isViewMode = function(){
        return mode === "view";
    }

    $scope.isMale = function (gender) {
        return gender === "M";
    }
});
