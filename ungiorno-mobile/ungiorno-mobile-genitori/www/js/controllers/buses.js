angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.buses', [])

.controller('BusCtrl', function($scope, $ionicHistory, configurationService, profileService) {

	$scope.initialize = function() {
		//var babyConfiguration = configurationService.getBabyConfiguration();
		var babyProfile = profileService.getBabyProfile();
		var babyConfiguration = configurationService.getBabyConfiguration();

		$scope.busStops = [];
		$scope.persons = [];

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
			$scope.defaultStop = babyConfiguration.services.bus.defaultIdBack;
		}

		if(babyConfiguration.defaultPerson)
		{
			$scope.defaultPerson = babyConfiguration.defaultPerson;
		}
	}

	

















	$scope.busStop = {
		date: new Date()
		//inserire resto qui
	}

	$scope.send = function() {
		if(!$scope.note.description)
		{
			alert("Ok");
		}

		else{
			alert("");
		$ionicHistory.goBack();
		}	
	}

	$scope.getBuses = function() {
		dataServerService.getBuses(function(data) {

		})


	}
})