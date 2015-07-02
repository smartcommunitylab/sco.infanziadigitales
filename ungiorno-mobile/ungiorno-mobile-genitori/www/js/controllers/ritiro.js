angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro', [])

.controller('RitiroCtrl', function ($scope, configurationService, profileService) {
        $scope.BabyConfiguration = configurationService.getBabyConfiguration();
        $scope.BabyProfile = profileService.getBabyProfile();
        $scope.Temporary = {
            "date":new Date(0),
            "time":new Date(0)
        };
        $scope.datapack = {
            "appId": "",
            "schoolId": "",
            "kidId": "",
            "datetime": 123456789,
            "personId": "",
            "note": "a",
        }

        $scope.NavigateToDelegate = function () {
            window.location.href = "#/app/delegate";
        }

        $scope.AddTimeToPack = function () {
            var h=$scope.Temporary.time.getTime();
            var tmp=new Date($scope.Temporary.date.getFullYear(),$scope.Temporary.date.getMonth(),$scope.Temporary.date.getDate(),$scope.Temporary.date.getHours(),$scope.Temporary.date.getMinutes(),$scope.Temporary.date.getSeconds(),$scope.Temporary.date.getMilliseconds())
            var d=tmp.getTime();
            return d+h;
        }


        $scope.sendToServer = function () {
            $scope.setDataPack();
            dataServerService.sendRitiro(p$scope.datapack).then(function (data) {
                window.location.href = "#/app/home"
                Toast.show("Invio Riuscito!!", 'short', 'bottom');
                console.log("SUCCESSFULL SENDING -> " + data);
            }, function (error) {
                Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
                console.log("ERROR IN SENDING -> " + error);
            });

        }
        $scope.GetSelectedValue = function (){
            var radio = document.getElementsByName('Radio');
            var radio_value;
            for(var i = 0; i < radio.length; i++){
                if(radio[i].checked){
                    radio_value = radio[i].value;
                }
            }
            $scope.datapack.personId=radio_value;
        }
        $scope.setDataPack=function(){
          $scope.datapack.appId=$scope.BabyProfile.appId;
            $scope.datapack.schoolId= $scope.BabyProfile.schoolId;
            $scope.datapack.kidId = $scope.BabyProfile.kidId;
            $scope.datapack.time=$scope.AddTimeToPack();
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
    .controller('DelegateCtrl', function ($scope,configurationService) {
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
        $scope.delegaperson =
            {
            lastname:"",
        firstname:""
        }
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
                    "lastName": null,
                    "firstName": null,
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

        $scope.SetFullName=function(){
            $scope.Delega[0].extraPersons.firstName=$scope.delegaperson.firstname;
            $scope.Delega[0].extraPersons.lastName=$scope.delegaperson.lastname;
         $scope.Delega[0].extraPersons.fullName=$scope.Delega[0].extraPersons.firstName + " " + $scope.Delega[0].extraPersons.lastName;
        }


        $scope.NavigateToRitiro = function () {
            $scope.SetFullName();
            configurationService.setBabyConfiguration($scope.Delega);
            window.location.href = "#/app/ritiro";
        }
    });
