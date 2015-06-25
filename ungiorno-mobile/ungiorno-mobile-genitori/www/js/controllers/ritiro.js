angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro', [])

.controller('RitiroCtrl', function ($scope,addingDelegateService,configurationService,profileService) {
    $scope.BabyConfiguration=configurationService.getBabyConfiguration();
    $scope.BabyProfile=profileService.getBabyProfile();
    $scope.time="";
    $scope.datapack={
            "appId": $scope.BabyProfile.appId,
            "schoolId":$scope.BabyProfile.schoolId,
            "kidId": $scope.BabyProfile.kidId,
            "date": "dd/mm/yyyy",
            "time": 123456789,
            "personId": ""
            "note": "a",

    }
    $scope.addTemporaryDelegate= function(){
        if(addingDelegateService.estract()!=null)
        {
        retirelist.push(addingDelegateService.estract());
            addingDelegateService.insert(null);
        }
    }
    $scope.addTemporaryDelegate();
    $scope.NavigateToDelegate=function()
    {
         window.location.href="#/app/delegate";
    }
    $scope.AddTimeToPack= function(){
        var Datetime=new Date($scope.datapack.date+","+$scope.time);
        return Datetime.getTime()
    }
    $scope.sendToServer=function(){
        $scope.AddTimeToPack();
     dataServerService.sendRitiro(p$scope.datapack).then(function (data) {
         window.location.href="#/app/home.html"
            Toast.show("Invio Riuscito!!", 'short', 'bottom');
            console.log("SUCCESSFULL SENDING -> " + data);
        }, function (error) {
         Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
            console.log("ERROR IN SENDING -> " + error);
        });

    }

})
.controller('DelegateCtrl', function ($scope,addingDelegateService) {
    $scope.today=new Date();
    var dd=today.getDate();
    var mm=today.getMonth()+1;
    var yyyy=today.getFullYear();
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
                "fullName": $scope.Delega[0].extraPersons.firstName + " " + $scope.Delega[0].extraPersons.lastName,
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
        }]
      $scope.NavigateToRitiro=function()
    {
        addingDelegateService.insert($scope .Delega);
        window.location.href="#/app/ritiro.html";
    }
})
;

