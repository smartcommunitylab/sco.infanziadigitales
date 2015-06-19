angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro', [])

.controller('RitiroCtrl', function ($scope,addingDelegateService) {
    $scope.retirelist =[
        {Name:"Mara Rossi", DelegationDate:"30/06/2015", ifRetire:true,ifTemp:false},
        {Name:"Paolo Rossi",DelegationDate:"14/09/2015",ifRetire:false,ifTemp:false},
        {Name:"Mariarosa Bianchi",DelegationDate:"22/05/2015",ifRetire:false,ifTemp:false},
        {Name:"Cinzia Rossi",DelegationDate:"13/03/2016",ifRetire:false,ifTemp:true}
        ];
    $scope.date="";
    $scope.time="";
    $scope.note="";
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
      $scope.NavigateToRitiro=function(delega)
    {
        addingDelegateService.insert(delega);
        window.location.href="#/app/ritiro.html";
    }
})
;

