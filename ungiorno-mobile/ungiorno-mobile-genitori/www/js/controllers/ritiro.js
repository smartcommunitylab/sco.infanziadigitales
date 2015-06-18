angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.ritiro', [])

.controller('RitiroCtrl', function ($scope) {
    $scope.retirelist =[
        {Name:"Mara Rossi", DelegationDate:"30 Giugno 2015", ifRetire:true},
        {Name:"Paolo Rossi",DelegationDate:"14 Settembre 2015",ifRetire:false},
        {Name:"Mariarosa Bianchi",DelegationDate:"22 Maggio 2015",ifRetire:false},
        {Name:"Cinzia Rossi",DelegationDate:"13 Aprile 2016",ifRetire:false}
        ];
    $scope.date="";
    $scope.time="";
    $scope.note="";

});
