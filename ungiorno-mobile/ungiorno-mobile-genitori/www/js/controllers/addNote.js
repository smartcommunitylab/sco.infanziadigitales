angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.addNote', [])

.controller('NoteCtrl', function($scope, $ionicHistory) {
	$scope.note = {
		date: new Date(),
		description: null
	}

	$scope.send = function() {
		if(!$scope.note.description)
		{
			alert("Attenzione: nota non inserita");
		}

		else{
			alert("Nota inviata");
		$ionicHistory.goBack();
		}
	}
})
