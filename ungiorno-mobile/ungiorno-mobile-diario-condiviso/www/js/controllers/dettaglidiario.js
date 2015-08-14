angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService,$filter) {
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

    $scope.isMale = function (gender){
        return gender === "M";
    }
    $scope.isTeacher = function (relation){
        return relation === "maestra";
    }
    $scope.isParent = function (relation){
        return relation === "mamma" || relation === "papà";
    }

    $scope.getBaby = function(gender){
        var baby;
        if (gender === "M"){
            baby = "bambino";
        }
        else{
            baby = "bambina";
        }
        return baby;
    }

    $scope.getPreposition = function (gender, relation) {
        var toRtn;

        switch (gender) {
            case 'M':
                toRtn = "del";
                break;
            case 'F':
                toRtn = "della";
                break;
            default:
                toRtn = "del";
        }
        if (relation === "zio") {
            toRtn = "dello";
        }
        return toRtn;
    }
    $scope.getString = function (firstString, gender, relation){
        var string;
        string = $filter('translate')(firstString) + $scope.getPreposition(gender, relation);
        return string;
    }
});
