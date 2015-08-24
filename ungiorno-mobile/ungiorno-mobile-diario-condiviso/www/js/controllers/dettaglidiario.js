angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService,$filter,$location,$ionicScrollDelegate,diaryService,$state,Toast) {
    var mode = "view";
    $scope.createMode = diaryService.getCreateDiaryMode();
    $scope.modify = function(){
        $scope.babyCopy = clone($scope.baby);
        mode = "edit";
    }
    $scope.save = function(){
        var error = false;
        error = checkDataError($scope.babyCopy);
        if (!error) {
            $scope.baby = $scope.babyCopy;
            mode = "view";
        }else{
        if ($scope.createMode){
            $state.go('app.home')
        }
        }
    }
    var checkDataError = function(objectToCheck){
        var error = false;
        for (var key in objectToCheck) {
            if (objectToCheck.hasOwnProperty(key)) {

                if (typeof objectToCheck[key] === 'string' && objectToCheck[key].length === 0) {
                    Toast.show('string must be inserted', 'short', 'bottom');
                    error = true;
                } else if (objectToCheck[key] instanceof Date && objectToCheck[key] > new Date()) {
                    Toast.show("date must be before today", 'short', 'bottom');
                    error = true;
                } else if (objectToCheck[key] instanceof Array){
                    for (var i = 0; i < objectToCheck[key].length; i++){
                        error = checkDataError(objectToCheck[key][i]);
                        if (error) return true;
                    }
                }
                if (error) return true;
            }
        }
        return false;
    }
    $scope.isViewMode = function(){
        return mode === "view";
    }
    $scope.isMale = function (gender){
        return gender === "Maschio";
    }
    $scope.isTeacher = function (relation){
        return relation === "maestra";
    }
    $scope.isFamily = function (relation){
        return relation === "mamma" || relation === "papà" || relation === "sorella" || relation === "fratello";
    }
    $scope.getBaby = function(gender){
        var baby;
        if (gender === "Femmina"){
            baby = "bambina";
        }
        else{

            baby = "bambino";
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
            case 'Maschio':
                toRtn = "del";
                break;
            case 'Femmina':
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
    $scope.babyCopy = {}
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
            $scope.babyCopy = clone($scope.baby);

        });
    }
    function clone(obj) {
        var copy;
        if (null == obj || "object" != typeof obj) return obj;
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
});
