angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.retire', [])

.controller('RetireCtrl', function ($scope, configurationService, profileService, dataServerService, Toast, $ionicHistory, retireService, $filter) {
    var retireConfiguration;

    function getTime() {
        var dateInsert = new Date($scope.temporary.date);
        var timeInsert = new Date($scope.temporary.time);
        dateInsert.setHours(timeInsert.getHours(), timeInsert.getMinutes(), 0, 0);
        return dateInsert.getTime();
    }

    function setTime(value) {
        if (value) {
            var date = new Date(value);
            $scope.temporary.date = date;
            $scope.temporary.time = date;
        }
    }

    function getSelectedPersonId() {
        var radio = document.getElementsByName('radio');
        for (var i = 0; i < radio.length; i++) {
            if (radio[i].checked) {
                return radio[i].value;
            }
        }
        return null;
    }

    $scope.babyProfile = profileService.getBabyProfile();
    $scope.babyConfiguration = configurationService.getBabyConfiguration();
    $scope.temporary = {
        date: new Date(),
        time: new Date(),
        note: null
    };
    $scope.temporary.time.setHours($scope.temporary.time.getHours(), $scope.temporary.time.getMinutes(), 0, 0)

    $scope.setRetire = function () {
        retireConfiguration = {
            appId: $scope.babyConfiguration.appId,
            schoolId: $scope.babyConfiguration.schoolId,
            kidId: $scope.babyConfiguration.kidId,
            date: getTime(),
            personId: getSelectedPersonId(),
            note: $scope.temporary.note
        };

        retireService.setRetire(retireConfiguration);
    };




    $scope.getRetire = function () {
        retireConfiguration = retireService.getRetire();

        if (retireConfiguration) {
            setTime(retireConfiguration.date);
            $scope.temporary.note = retireConfiguration.note;
        };
    };

    $scope.send = function () {
        $scope.setRetire();
        if (!retireConfiguration.personId) {
            alert("Indica chi ritira il bambino");
            return;
        }

        dataServerService.sendRitiro(retireConfiguration).then(function (data) {
            Toast.show($filter('translate')('retire_sendok'), 'short', 'bottom');
            retireService.setDailyRetire(true);
            console.log("SENDING OK -> " + data);
            $ionicHistory.goBack();
        }, function (error) {
            Toast.show($filter('translate')('retire_sendno'), 'short', 'bottom');
            console.log("SENDING ERROR -> " + error);
        });
    }
})
