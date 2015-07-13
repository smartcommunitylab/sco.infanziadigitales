angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.controllers.contact', [])

.controller('ContactCtrl', function($scope, $ionicModal) {

	$scope.call = {
		text: 'Chiama',
		cellPhone: 3342022900,
		action: function(){
		alert("Chiama");
	}
	};

	$scope.addNote = {
		text: 'Aggiungi una nota',
	};

	$ionicModal.fromTemplateUrl('templates/contacts.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })

	$scope.openModal = function() {
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
})
