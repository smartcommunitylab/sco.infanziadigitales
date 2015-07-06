angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.retire', [])

.controller('RetireCtrl', function ($scope, configurationService, profileService, dataServerService, Toast) {
        $scope.BabyConfiguration = configurationService.getBabyConfiguration();
        $scope.BabyProfile = profileService.getBabyProfile();

        $scope.Temporary = {
            date:new Date(),
            time:new Date()
        };

        $scope.datapack = {
            "appId": "",
            "schoolId": "",
            "kidId": "",
            "datetime": 123456789,
            "personId": "",
            "note": "a",
        }

        $scope.convertInput = function(sender) {
            alert(TODO);
        };

        $scope.sendToServer = function () {
            $scope.setDataPack();
            dataServerService.sendRitiro($scope.datapack).then(function (data) {
                window.location.href = "#/app/home"
                Toast.show("Invio Riuscito!!", 'short', 'bottom');
                console.log("SUCCESSFULL SENDING -> " + data);
            }, function (error) {
                Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
                console.log("ERROR IN SENDING -> " + error);
            });

        }

        $scope.setDataPack=function(){
            $scope.datapack.appId=$scope.BabyProfile.appId;
            $scope.datapack.schoolId= $scope.BabyProfile.schoolId;
            $scope.datapack.kidId = $scope.BabyProfile.kidId;
            $scope.datapack.datetime= addTimeToPack();
            $scope.getSelectedValue();
        }

        function addtimeTopack() {
            var dateinsert = new Date($scope.Temporary.date);
            var timeinsert = new Date($scope.Temporary.time);
            dateinsert.setHours(timeinsert.getHours(), timeinsert.getMinutes(), 0, 0);
            return dateinsert.getTime();
        }

        getSelectedPerson = function (){
            var radio = document.getElementsByName('radio');
            var radio_value;
            for(var i = 0; i < radio.length; i++) {
                if(radio[i].checked){
                    radio_value = radio[i].value;
                }
            }
            $scope.datapack.personId=radio_value;
        }
})

.directive('dateParser', function ($window) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {
            var moment = $window.moment;
            var dateFormat = attrs.moMediumDate;
            attrs.$observe('dateParser', function (newValue) {
                if (!newValue) {
                    newValue = new Date();
                }

                alert(dateFormat);
                if (dateFormat == newValue || !ctrl.$modelValue) return;
                dateFormat = newValue;
                ctrl.$modelValue = new Date(ctrl.$setViewValue);
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (!dateFormat || !modelValue) return "";
                var retVal = moment(modelValue).format(dateFormat);
                return retVal;
            });

            ctrl.$parsers.unshift(function (viewValue) {
                var date = moment(viewValue, dateFormat);
                return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
            });
        }
    };
});

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
