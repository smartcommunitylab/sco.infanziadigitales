angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService,$filter,$location,$ionicScrollDelegate,diaryService,$state) {
    var mode = "view";
    $scope.createMode = diaryService.getCreateDiaryMode();
    $scope.modify = function(){
        mode = "edit";

    $scope.save = function(){
        mode = "view";
        if ($scope.createMode){
            $state.go('app.home')
        }
        }
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
    if ($scope.createMode){
        $scope.modify();
    }
    else{

        profileService.getBabyProfileById().then( function(data){
            $scope.baby = data;
            $scope.baby.birthday = new Date($scope.baby.birthday * 1000);
            for (var i = 0; i < $scope.baby.persons.length; i++){
                $scope.baby.persons[i].birthday = new Date($scope.baby.persons[i].birthday * 1000);
            }
        });
    }
});
