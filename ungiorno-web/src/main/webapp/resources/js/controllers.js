var consoleControllers = angular.module('consoleControllers', [])

.controller('MainCtrl', ['$scope', '$rootScope', '$location', 'DataService',
  function ($scope, $rootScope, $location, DataService) {
    DataService.getProfile().then(function(p){
    	$scope.profile = p.appInfo;
    	$scope.schoolId = "";
    });

    $scope.uploadComplete = function (content) {
    	if (!content.messages && (!content.status || content.status == 200)) {
        	$scope.errorTexts = [];
        	$scope.successText = 'Data successfully uploaded!';
    		$scope.profile = content;
    	} else {
        	var txt = [];
        	if (content.type) {
        		txt.push(content.type);
        	}
        	if (content.messages) {
        		txt = content.messages;
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
