angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.buses', [])

.controller('BusCtrl', function($scope, $ionicHistory, configurationService, profileService, dataServerService, Toast) {
	var babyProfile = profileService.getBabyProfile();
	var babyConfiguration = configurationService.getBabyConfiguration();

	$scope.initialize = function() {
		$scope.busStops = [];
		$scope.persons = [];
		$scope.stopId = null;
		$scope.personId = null;

		console.log($scope.persons);
		console.log($scope.busStops);

		if(babyProfile.services.bus.enabled)
		{
			$scope.busStops = babyProfile.services.bus.stops;
		}

		if(babyProfile.persons)
		{
			$scope.persons = babyProfile.persons;
		}

		if(babyConfiguration.extraPersons){
			$scope.persons.push(babyConfiguration.extraPersons);
		}

		if(babyConfiguration.services.bus.active)
		{
			$scope.stopId = babyConfiguration.services.bus.defaultIdBack;
		}

		if(babyConfiguration.defaultPerson)
		{
			$scope.personId = babyConfiguration.defaultPerson;
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
        if(element.checked)
        {
        	$scope.stopId = element.value;
        }
    };

    $scope.changePersons = function(element) {
        angular.forEach($scope.persons, function(item) {
            item.checked = false;
        });
        element.checked = true;

        if(element.checked)
        {
        	$scope.personId = element.value;
        }
    };


$scope.send = function() {
		
		var dataConfiguration = {
			appId: babyConfiguration.appId,
            schoolId: babyConfiguration.schoolId,
            kidId: babyConfiguration.kidId,
            date: new Date(),
            stopId: $scope.stopId,
            personId: $scope.personId
    	}

    	if(dataConfiguration.date < new Date())
    	{
    		alert("Selezionare una data successiva o uguale al giorno corrente");
    		return;
    		console.log(dataConfiguration.date);
    	}

    	if(dataConfiguration.stopId)
    	{
    		alert("Indica la fermata a cui scende il bambino");
    		return;
    	}
    	
    	if(dataConfiguration.personId)
    	{
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
