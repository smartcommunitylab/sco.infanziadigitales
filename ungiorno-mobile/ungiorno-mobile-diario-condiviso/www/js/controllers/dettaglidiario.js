angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService,$filter,$location,$ionicScrollDelegate) {
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
    $scope.isFamily = function (relation){
        return relation === "mamma" || relation === "papà" || relation === "sorella" || relation === "fratello";
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
    $scope.addedComponents = [];
    $scope.addComponent = function(){
        $scope.scrollTo("selezion-button");
        $scope.addedComponents.push({});
    }
    $scope.addedPeople = [];

    $scope.addPeople = function(){
        $scope.scrollTo("selezion-button");
        $scope.addedPeople.push({})
    }
    $scope.deleteComponent = function(index){
        $scope.addedComponents.splice(index, 1);
    }
    $scope.deletePeople = function(index){
        $scope.addedPeople.splice(index, 1);
        $ionicScrollDelegate.scrollBottom("bottom-button");
    }
    $scope.scrollTo = function (id) {
        $location.hash(id)
        $ionicScrollDelegate.anchorScroll(true);
    };
    $scope.isEmptyNote = function(note){
        if (note === ""){
            return true
        }
        else{
            return false
        }
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
