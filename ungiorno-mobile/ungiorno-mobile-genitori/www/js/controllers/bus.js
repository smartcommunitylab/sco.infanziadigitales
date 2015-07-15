angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.buses', [])

.controller('BusCtrl', function($scope, $ionicHistory, configurationService, profileService, dataServerService, Toast) {
    var babyProfile = profileService.getBabyProfile();
	$scope.babyConfiguration = configurationService.getBabyConfiguration();

	$scope.initialize = function() {
		$scope.busStops = [];
		$scope.persons = [];

		if (babyProfile.services.bus.enabled) {
			$scope.busStops = babyProfile.services.bus.stops;
		}

		if (babyProfile.persons) {
			$scope.persons = babyProfile.persons;
		}

		if($scope.babyConfiguration.services.bus.active) {
			$scope.stopId = $scope.babyConfiguration.services.bus.defaultIdBack;
		}

		if($scope.babyConfiguration.defaultPerson) {
			$scope.personId = $scope.babyConfiguration.defaultPerson;
		}
	}

	$scope.busStop = {
		date: new Date()
	}


	$scope.changeStops = function(element) {
        angular.forEach($scope.busStops, function(item) {
            item.checked = false;
        });
        element.checked = true;

        if(element.checked) {
        	$scope.stopId = element.value;
        }
    };

    $scope.changePersons = function(element) {
        var tmp = $scope.persons;
        tmp.push($scope.babyConfiguration.extraPersons);
        angular.forEach(tmp, function(item) {
            item.checked = false;
        });
        element.checked = true;

        if(element.checked) {
        	$scope.personId = element.value;
        }
    };


    $scope.send = function() {
		var dataConfiguration = {
			appId: $scope.babyConfiguration.appId,
            schoolId: $scope.babyConfiguration.schoolId,
            kidId: $scope.babyConfiguration.kidId,
            date: new Date().getTime(),
            stopId: $scope.stopId,
            personId: $scope.personId
    	}

    	if (dataConfiguration.date < new Date().getTime()) {
    		alert("Selezionare una data successiva o uguale al giorno corrente");
    		return;
    		console.log(dataConfiguration.date);
    	}

    	if(dataConfiguration.stopId) {
    		alert("Indica la fermata a cui scende il bambino");
    		return;
    	}

    	if(dataConfiguration.personId) {
    		alert("Indica la persona che aspetta il bambino");
    		return;
    	}

    	dataServerService.sendFermata(dataConfiguration).then(function (data) {
            Toast.show("Invio Riuscito!!", 'short', 'bottom');
            console.log("SENDING OK -> " + data);
            $ionicHistory.goBack();
        }, function (error) {
            Toast.show("Invio Non Riuscito!!", 'short', 'bottom');
            console.log("SENDING ERROR -> " + error);
        });
	};


})
