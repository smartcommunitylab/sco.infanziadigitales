angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro', [])

.controller('RitiroCtrl', function ($scope, configurationService, profileService) {
        $scope.BabyConfiguration = configurationService.getBabyConfiguration();
        $scope.BabyProfile = profileService.getBabyProfile();
        $scope.time = "";
        $scope.TemporaryDate = new Date();
        $scope.datapack = {
            "appId": "",
            "schoolId": "",
            "kidId": "",
            "date": "yyyy/mm/dd",
            "time": 123456789,
            "personId": "",
            "note": "a",
        }
        $scope.NavigateToDelegate = function () {
            window.location.href = "#/app/delegate";
        }
        $scope.AddTimeToPack = function () {
            var Datetime = new Date($scope.datapack.date + "," + $scope.time);
            return Datetime.getTime()
        }
        $scope.InvertDateFont = function () {
            var my_date = new Date($scope.TemporaryDate);
            var dd = $scope.TemporaryDate.getDate();
            var mm = $scope.TemporaryDate.getMonth() + 1;
            var yyyy = $scope.TemporaryDate.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            $scope.datapack.date = dd + '/' + mm + '/' + yyyy
        }
        $scope.sendToServer = function () {
            $scope.AddTimeToPack();
            dataServerService.sendRitiro(p$scope.datapack).then(function (data) {
                window.location.href = "#/app/home.html"
                Toast.show("Invio Riuscito!!", 'short', 'bottom');
                console.log("SUCCESSFULL SENDING -> " + data);
            }, function (error) {
                Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
                console.log("ERROR IN SENDING -> " + error);
            });

        }
        $scope.GetSelectedValue = function () {
            var radio = document.getElementsByName('Radio');
            var radio_value;
            for (var i = 0; i < radio.length; i++) {
                if (radio[i].checked) {
                    radio_value = radio[i].value;
                }
            }
            $scope.datapack.personId = radio_value;
        }
        $scope.seDataPack = function () {
            $scope.datapack.appId = $scope.BabyProfile.appId;
            $scope.datapack.schoolId = $scope.BabyProfile.schoolId;
            $scope.datapack.kidId = $scope.BabyProfile.kidId;
            $scope.datapack.time = $scope.AddTimeToPack();
            $scope.GetSelectedValue();
        }


    })
    /*
    .controller('DelegateCtrl', function ($scope,) {
        $scope.today=new Date();
        var dd=$scope.today.getDate();
        var mm=$scope.today.getMonth()+1;
        var yyyy=$scope.today.getFullYear();
        if(dd<10)
        {
            dd='0'+dd
        }
        if(mm<10)
        {
            mm='0'+mm;
        }
        $scope.today=dd+'/'+mm+'/'+yyyy
       $scope.Delega = [
            {
                "appId": "a",
                "schoolId": "a",
                "kidId": "a",
                "services": {
                    "anticipo": {
                        "active": true
                    },
                    "posticipo": {
                        "active": true
                    },
                    "bus": {
                        "active": true,
                        "defaultId": "idstop1"
                    }
                }
            }
           ]
        })*/
    .controller('DelegateCtrl', function ($scope) {
        $scope.today = new Date();
        var dd = $scope.today.getDate();
        var mm = $scope.today.getMonth() + 1;
        var yyyy = $scope.today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        $scope.today = yyyy + '/' + mm + '/' + dd
        $scope.Delega = [
            {
                "appId": "a",
                "schoolId": "a",
                "kidId": "a",
                "services": {
                    "anticipo": {
                        "active": true
                    },
                    "posticipo": {
                        "active": true
                    },
                    "bus": {
                        "active": true,
                        "defaultId": "idstop1"
                    },
                    "mensa": {
                        "active": true
                    }
                },
                "exitTime": 1534964475576,
                "defaultPerson": "personId1",
                "receiveNotification": true,
                "extraPersons": {
                    "personId": "personId1",
                    "fullName": "fullName1",
                    "lastName": "lastName1",
                    "firstName": "firstName1",
                    "phone": ["12345", "67890"],
                    "email": ["email1", "email2"],
                    "relation": "mamma",
                    "isParent": true,
                    "default": true,
                    "authorizationDeadline": new Date($scope.today).getTime(),
                    "authorizationUrl": "url1",
                    "adult": true
                }
            }
        ]
        $scope.SetFullName = function () {
            $scope.Delega[0].extraPersons.fullName = $scope.Delega[0].extraPersons.firstName + " " + $scope.Delega[0].extraPersons.lastName;
        }
        $scope.Delega[0].extraPersons = $scope.Delega[0].extraPersons.firstName + " " + $scope.Delega[0].extraPersons.lastName;
        $scope.NavigateToRitiro = function () {
            window.location.href = "#/app/ritiro.html";
        }
    });
