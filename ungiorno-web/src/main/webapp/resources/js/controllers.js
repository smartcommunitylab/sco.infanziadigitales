var consoleControllers = angular.module('consoleControllers', [])

.controller('MainCtrl', ['$scope', '$rootScope', '$location', 'DataService', 
  function ($scope, $rootScope, $location, DataService) {
    DataService.getProfile().then(function(p){
    	$scope.profile = p;
    });

    $scope.uploadComplete = function (content) {
    	if (content.appInfo) {
        	$scope.errorTexts = [];
        	$scope.successText = 'Data successfully uploaded!';
    		$scope.profile = content;
    	} else {
        	var txt = [];
        	if (content.message) {
        		txt.push(content.message);
        	}
        	if (content.validationResults) {
        		for (var i = 0; i < content.validationResults.length;i++) {
        			txt.push(content.validationResults[i]);
        		}
        	}
        	$scope.successText = '';
    		$scope.errorTexts = txt;
    	}
    };
    
    $scope.publishApp = function() {
    	$scope.errorTexts = [];
    	$scope.successText = '';
    	DataService.publishApp().then(function(res){
        	$scope.errorTexts = [];
        	$scope.successText = 'Data published!';
        	$scope.profile = res;
    	},
    	function(e) {
        	$scope.errorTexts = ['Failed publishing data'];
        	$scope.successText = '';
    	});
    };
  
  }]);
  