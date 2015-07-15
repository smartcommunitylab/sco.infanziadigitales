angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.authorization', [])

.controller('AuthorizationCtrl', function ($scope, $ionicHistory, configurationService, $q, $filter, $cordovaCamera) {
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

        currentBaby.extraPersons.firstName = $scope.person.firstName;
        currentBaby.extraPersons.lastName = $scope.person.lastName;
        currentBaby.extraPersons.fullName = $scope.person.firstName + " " + $scope.person.lastName;
        currentBaby.extraPersons.authorizationDeadline = (new Date()).getTime();
        currentBaby.extraPersons.authorizationUrl = authorizationUrl;
        return true;
    }


    $scope.send = function () {
        if (setDelegation()) {
            configurationService.setBabyConfiguration(currentBaby);
            $ionicHistory.goBack();
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
