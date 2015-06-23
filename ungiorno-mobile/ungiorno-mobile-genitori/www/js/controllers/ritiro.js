angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro', [])

.controller('RitiroCtrl', function ($scope,addingDelegateService,configurationService) {
    $scope.data=configurationService.getBabyConfiguration();
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

})
.controller('DelegateCtrl', function ($scope,addingDelegateService) {
    var today=new Date();
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
    today=dd+'/'+mm+'/'+yyyy
   $scope.Delega = {Name: "", DelegationDate:today, ifRetire:"true", ifTemp:true};
      $scope.NavigateToRitiro=function()
    {
        addingDelegateService.insert($scope .Delega);
        window.location.href="#/app/ritiro.html";
    }
})
;

