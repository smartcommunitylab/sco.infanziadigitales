angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.authorization', [])

.controller('AuthorizationCtrl', function ($scope, $ionicHistory, configurationService, $q, $filter, $cordovaCamera, dataServerService) {
    var currentBaby = configurationService.getBabyConfiguration();
    var authorizationUrl;
    $scope.image = [];
    $scope.imageBase64 = [];
    $scope.person = {};
    $scope.hasAuthorization = false;

    function setDelegation() {
        if (!$scope.person.firstName ||
            !$scope.person.lastName ||
            !authorizationUrl) {
            alert("Alcuni campi non sono stati completati");
            return false;
        }
        extraPerson = {};

        extraPerson.personId = currentBaby.kidId + "_" + new Date().getTime();
        extraPerson.firstName = $scope.person.firstName;
        extraPerson.lastName = $scope.person.lastName;
        extraPerson.fullName = $scope.person.firstName + " " + $scope.person.lastName;
        extraPerson.authorizationDeadline = (new Date()).getTime();
        extraPerson.authorizationUrl = authorizationUrl;
        if (!currentBaby.extraPersons) {
            currentBaby.extraPersons = [];
        }
        currentBaby.extraPersons.push(extraPerson);
        return true;
    }


    $scope.send = function () {
        if (setDelegation()) {
            //update configuration
            dataServerService.getBabyConfigurationById(currentBaby.schoolId, currentBaby.kidId).then(function (data) {
                //se nuova configurazione aggiornala
                currentBaby = data;
                //currentBaby.exitTime = new Date(currentBaby.exitTime).getTime();
                //se diversi parametri=>sovrascrivo
                setDelegation();
                dataServerService.sendBabySetting(currentBaby.schoolId, currentBaby.kidId, currentBaby).then(function (data) {
                    configurationService.setBabyConfiguration(currentBaby);
                    $ionicHistory.goBack();
                });


            });
        }
    }
    $scope.removeImage = function (index) {

        $scope.image.splice(index, 1);
        $scope.imageBase64.splice(index, 1);
        $scope.hasAuthorization = false;
    };

    //actually it gets only camera
    $scope.addImage = function (wherePic) {
        var options = {};

        // 2
        if (wherePic == 'Camera') {
            options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
        } else {
            options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY, // Camera.PictureSourceType.PHOTOLIBRARY
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
        }

        // 3
        $cordovaCamera.getPicture(options).then(function (imageData) {
            // 4
            image = "data:image/jpeg;base64," + imageData;
            $scope.image.push(image);
            $scope.imageBase64.push(imageData);
            $scope.hasAuthorization = true; // useless, just debug
            authorizationUrl = "tmp";
        }, function (err) {
            console.log(err);
        });
    };

    //    $scope.getPhoto = function () {
    //        var q = $q.defer();
    //        $scope.hasAuthorization = true; // useless, just debug
    //
    //        navigator.camera.getPicture(function (result) {
    //            authorizationUrl = result;
    //            q.resolve(true);
    //        }, function (err) {
    //            q.resolve(false);
    //        });
    //
    //        q.promise;
    //    };
});
