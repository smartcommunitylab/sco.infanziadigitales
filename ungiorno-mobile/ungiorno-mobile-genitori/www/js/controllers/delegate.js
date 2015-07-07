angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.delegate', [])

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
    $scope.today = yyyy + '/' + mm + '/' + dd;

    $scope.person = {
        lastName:"",
        firstName:""
    };

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
        window.location.href = "#/app/retire";
    }
});
