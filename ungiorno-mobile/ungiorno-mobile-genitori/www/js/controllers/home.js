angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, configurationService, $filter) {

    $scope.date = "";
    $scope.kidProfile = {};
    $scope.kidConfiguration = {};
    $scope.school = {};
    $scope.notes = {};
    $scope.fromTime = "";
    $scope.toTime = "";
    $scope.elements = [
        {
            state: "app.retire",
            string: $filter('translate')('home_retire'),
        },
        {
            state: "app.retire",
            string: $filter('translate')('home_retire'),
        },
        {
            state: "app.retire",
            string: $filter('translate')('home_retire'),
        },
        {
            state: "app.retire",
            string: $filter('translate')('home_retire'),
        },
        {
            state: "app.retire",
            string: $filter('translate')('home_retire'),
        },
        {
            state: "app.retire",
            string: $filter('translate')('home_retire'),
        }

    ];
    $scope.goTo = function (location) {
        window.location.assign(location);
    }

    $scope.getDateString = function () {
        var today = new Date();
        $scope.date = today.getTime();;
    }

    //corretto tutte e tre annidate? cosa succede se una salta? ma come faccio a settare il profilo temporaneo senza avere conf, prof????
    $scope.getConfiguration = function () {
        dataServerService.getBabyConfiguration().then(function (data) {
                configurationService.setBabyConfiguration(data[0]);
                $scope.kidConfiguration = data[0];
                dataServerService.getBabyProfile().then(function (data) {
                        profileService.setBabyProfile(data[0]);
                        $scope.kidProfile = data[0];
                        dataServerService.getSchoolProfile().then(function (data) {
                                profileService.setSchoolProfile(data.data[0]);
                                $scope.school = data.data[0];
                                if ($scope.kidProfile.services.anticipo.enabled && $scope.kidConfiguration.services.anticipo.active) {
                                    $scope.fromTime = $scope.school.anticipoTiming.fromTime;
                                } else {
                                    $scope.fromTime = $scope.school.regularTiming.fromTime;
                                }
                                if ($scope.kidProfile.services.posticipo.enabled && $scope.kidConfiguration.services.posticipo.active) {
                                    $scope.toTime = $scope.school.posticipoTiming.toTime;
                                } else {
                                    $scope.toTime = $scope.school.regularTiming.fromTime;

                                }

                            },
                            function (error) {
                                console.log("ERROR -> " + error);
                            });
                    },
                    function (error) {
                        console.log("ERROR -> " + error);
                    });
                dataServerService.getNotes().then(function (data) {
                    $scope.notes = data.data[0];
                }, function (error) {
                    console.log("ERROR -> " + error);
                });
            },
            function (error) {
                console.log("ERROR -> " + error);
            });




    }
    $scope.getConfiguration();

});
