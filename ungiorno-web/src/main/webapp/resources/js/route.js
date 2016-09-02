var routerApp = angular.module('routerApp', [ 'ui.router' ]);

function ctrl($scope, $http, $rootScope, $q) {
	$scope.times = [];
	$scope.absences = [];
	$scope.illnessess = [];
	$scope.saveMessage = false;
	$scope.isSaved=false;
	
	$scope.resetId = function()
	{
	    $rootScope.selgroup=
	    		{
	    		name:null,
	    		section:false
	    		};
	    $rootScope.selkid=
	    {
	    		firstName:null,
	    		ageGroups:new Array(),
	    		lastName:null,
	    		fullName:null,
	    		gender:null,
	    		birthday:null,
	    		active:false,
	    		allergies:[],
	    		parents:[],
	    		services:
	    		{
	    			anticipo:
	    			{
	    				enabled:false
	    			},
	    			posticipo:
	    			{
	    				enabled:false
	    			},
	    			mensa:
	    			{
	    				enabled:false
	    			},
	    			bus:
	    			{
	    				enabled:false
	    			}
	    		}
	    		
	    };
	    $rootScope.selkid_person=
	    {
	    		firstName:null,
	    		lastName:null,
	    		fullName:null,
	    		email:null,
	    		phone:null,
	    		parent:null,
	    		adult:null,
	    		relation:null,
	    		authorizationDeadline:null
	    };
	    $rootScope.selkid_parent1={
	    		firstName:null,
	    		lastName:null,
	    		fullName:null,
	    		email:null,
	    		phone:null
	    };
	    $rootScope.selkid_parent2={
	    		firstName:null,
	    		lastName:null,
	    		fullName:null,
	    		email:null,
	    		phone:null
	    };
	    $rootScope.selteacher={
	    		firstName:null,
	    		lastName:null
	    };
	    $rootScope.selgroupid=null;
	    $rootScope.selkidid=null;
	    $rootScope.selteacherid=null;
	}
	
	$scope.searchTeachers = function(teacher)
	{
		if($scope.search==null)
			return true;
		var q = $scope.search.toLowerCase();
		var text;
		if(teacher.firstName) {
			text = teacher.firstName.toLowerCase();
			if(text.indexOf(q) != -1) {
				return true;
			}
		}
		if(teacher.lastName) {
			text = teacher.lastName.toLowerCase();
			if(text.indexOf(q) != -1) {
				return true;
			}
		}
		return false;
	}
	$scope.searchGroups = function(group)
	{
		if($scope.search==null)
			return true;
		var q = $scope.search.toLowerCase();
		var text;
		if(group.name) {
			text = group.name.toLowerCase();
			if(text.indexOf(q) != -1) {
				return true;
			}
		}
		return false;
	}
	
	$scope.filterGroups = function(group)
	{
		if($scope.filtro==null)
			return true;
		if($scope.filtro == group.section) {
			return true;
		}
		return false;
	}

	  $scope.ordina = function(x) {
		  $scope.ordine = x;
	  }
	  $scope.filtra = function(x) {
		  $scope.filtro = x;
	  }
	
	$scope.messageshow = function(){
		if($scope.isSaved){
		$scope.saveMessage=true;
		}
	}
	
	$scope.messagehide = function(){
		$scope.saveMessage=false;
	}
	
	$scope.selectkid = function(i){
		$scope.resetId();
		$rootScope.selkidid = $scope.kidlist[i].kidId;
		$rootScope.selkid = $scope.kidlist[i];
		if(index1!=null){
			var index1 = $scope.trovaIndice($scope.kidlist[i].parents[0]);
			$rootScope.selkid_parent1 = $scope.personlist[$scope.personlist[index1]];
		}
		if(index2!=null){
			var index2 = $scope.trovaIndice($scope.kidlist[i].parents[1]);
			$rootScope.selkid_parent2 = $scope.personlist[$scope.personlist[index2]];
		}
	}
	$scope.trovaIndice = function(id)
	{
		for(i=0; i<$scope.kidlist.lenght; i++){
			if(id==$scope.kidlist[i]){
				return $scope.kidlist[i];
			}
		}
	}
	$scope.selectgroup = function(i){
		$scope.resetId();
		$rootScope.selgroupid = $scope.grouplist[i].groupId;
		$rootScope.selgroup = $scope.grouplist[i];
	}
	$scope.selectteacher = function(i){
		$scope.resetId();
		$rootScope.selteacherid = $scope.teacherlist[i].teacherId;
		$rootScope.selteacher = $scope.teacherlist[i];
	}
	$scope.saveSchool = function() {
		if($scope.email!=null&&$scope.phone!=null&&$scope.anticipoTiming.start!=null&&$scope.anticipoTiming.end!=null&&$scope.posticipoTiming.start!=null&&$scope.posticipoTiming.end!=null)
		{
		$scope.isSaved=true;
		var contacts = {};
		var timingant = {};
		var timingnorm = {};
		var timingpost = {};
		var jsonVar = {};
        contacts["email"] = new Array ($scope.email);
        contacts["telephone"] = new Array ($scope.phone);
		timingant["fromTime"] = $scope.anticipoTiming.start;
		timingant["toTime"] = $scope.anticipoTiming.end;
		jsonVar["anticipoTiming"] = timingant;
		timingnorm["fromTime"] = $scope.anticipoTiming.end;
		timingnorm["toTime"] = $scope.posticipoTiming.start;
		jsonVar["regularTiming"] = timingnorm;
		timingpost["fromTime"] = $scope.posticipoTiming.start;
		timingpost["toTime"] = $scope.posticipoTiming.end;
		jsonVar["posticipoTiming"] = timingpost;
		jsonVar["frequentIllnesses"] = $scope.illnessess;
		jsonVar["absenceTypes"] = $scope.absences;
		jsonVar["contacts"] = contacts;
		$http.post("http://localhost:8080/ungiorno2/api/test/school", jsonVar)
		}
		else{
				alert("Compila tutti i campi obbligatori!");
				$scope.isSaved=false;
		}
	};
	
	$scope.saveChild = function(x) {
		switch(x) {
	    case 1:
			if($rootScope.selkid.firstName!=null&&$rootScope.selkid.lastName!=null&&$rootScope.selkid.gender!=null&&$rootScope.selkid.birthday!=null)
			{
				$rootScope.selkid["fullName"]=$rootScope.selkid.firstName + " " + $rootScope.selkid.lastName;
				if($rootScope.selkidid!=null){			
					 $rootScope.selkid["kidId"]= $rootScope.selkidid;
				}
			$http.post("http://localhost:8080/ungiorno2/api/test/test/kid", $rootScope.selkid).then(
	    			function(response) {
	    				alert("ok");
	    			},
	    			function(e) {
	    				alert(e.data.errorType + " - " + e.data.errorMsg);
	    			});
	    	$rootScope.selkid=null;
	    	$rootScope.selkidid=null;
			}
			else{
					alert("Compila tutti i campi obbligatori!");
			}
	        break;
	    case 2:
			if(
				$rootScope.selkid_parent1.firstName!=null&&$rootScope.selkid_parent1.lastName!=null&&$rootScope.selkid_parent1.email!=null&&$rootScope.selkid_parent1.phone!=null&&
				$rootScope.selkid_parent2.firstName!=null&&$rootScope.selkid_parent2.lastName!=null&&$rootScope.selkid_parent2.email!=null&&$rootScope.selkid_parent2.phone!=null
				)
			{
				var idlist = [];
		        if($rootScope.selkid.parents[0]==null){
		        	var promise=$scope.savePerson($rootScope.selkid_parent1, null,2);
		        	promise.then(function(greeting) {idlist.push($scope.idforlist)});
		        }
		        else{
		        	var promise=$scope.savePerson($rootScope.selkid_parent1, $rootScope.selkid.parents[0],2);
		        	promise.then(idlist.push($scope.idforlist));
		        }
		        if($rootScope.selkid.parents[1]==null){
		        	var promise=$scope.savePerson($rootScope.selkid_parent2,null,2);
		        	promise.then(idlist.push($scope.idforlist));
		        }
		        else{
		        	var promise=$scope.savePerson($rootScope.selkid_parent2,$rootScope.selkid.parents[0],2);
		        	promise.then(idlist.push($scope.idforlist));
		        }
				$rootScope.selkid.parents=idlist;
				$http.post("http://localhost:8080/ungiorno2/api/test/test/kid", $rootScope.selkid)
			}
			else{
					alert("Compila tutti i campi obbligatori!");
			}
	        break;
	    case 3:
		}
	};
	
	$scope.savePerson = function(selperson, selpersonid, x) {
		var person = {};
		person["firstName"]=selperson.firstName;
		person["lastName"]=selperson.lastName;
		person["fullName"]=selperson.firstName+" "+selperson.lastName;
		person["phone"]=selperson.phone;
		person["email"]=selperson.email;
		switch(x){
		case 2:
			person["adult"]=true;
			person["parent"]=true;
		break;
		case 3:
			person["adult"]=selperson.adult;
			person["relation"]=selperson.relation;
			person["authorizationDeadline"]=+selperson.authorization;
			break;
		}
		if(selpersonid!=null)
			person["personId"]=selpersonid;
		$http.post("http://localhost:8080/ungiorno2/api/test/test/person", person).then(function(response) {
			return $q(function(resolve, reject) {assegna(function(){$scope.idforlist=response.data.personId})});
		},
    			function(e) {
    				alert(e.data.errorType + " ---- " + e.data.errorMsg);
    			});
	}

	$scope.saveTeacher = function() {
		if($rootScope.selteacher.firstName!=null&&$rootScope.selteacher.lastName!=null)
		{
			$rootScope.selteacher["fullName"] = $rootScope.selteacher.firstName + " " + $rootScope.selteacher.lastName;
			if($rootScope.selteacherid!=null){			
				 $rootScope.selteacher["teacherId"]= $rootScope.selteacherid;
			}
			$http.post("http://localhost:8080/ungiorno2/api/test/test/teacher",
			$rootScope.selteacher)
	    	$rootScope.selteacher=null;
	    	$rootScope.selteacherid=null;
		}
		else{
			alert("Compila tutti i campi obbligatori!");
		}
	};

	$scope.getTeacher = function() {
		$http.get("http://localhost:8080/ungiorno2/api/test/test/teacher")
				.then(function(response) {
					$scope.teacherlist = response.data;
				});
	};
	
	$scope.deleteTeacher = function(id) {
		$http.delete("http://localhost:8080/ungiorno2/api/test/test/teacher/"+ id)
	};
	
	$scope.saveGroup = function() {
		if($rootScope.selgroup.name!=null)
		{
			if($rootScope.selgroupid!=null){
				 $rootScope.selgroup["groupId"]= $rootScope.selgroupid;
			}
			$http.post("http://localhost:8080/ungiorno2/api/test/test/group",
					$rootScope.selgroup)
	    				$rootScope.selgroup=null;
	    				$rootScope.selgroupid=null;
		}
		else{
			alert("Compila tutti i campi obbligatori!");
		}
	};
	
	$scope.getGroup = function() {
		$http.get("http://localhost:8080/ungiorno2/api/test/test/group").then(
				function(response) {
					$scope.grouplist = response.data;
				});
	};
	
	$scope.deleteGroup = function(id) {
		$http.delete("http://localhost:8080/ungiorno2/api/test/test/group/"+ id)
	};

	$scope.getKid = function() {
		$http.get("http://localhost:8080/ungiorno2/api/test/test/kid").then(
				function(response) {
					$scope.kidlist = response.data;
				});
	};
	$scope.getPerson = function() {
		$http.get("http://localhost:8080/ungiorno2/api/test/test/person").then(
				function(response) {
					$scope.personlist = response.data;
				});
	};
	$scope.deleteKid = function(id) {
		$http.delete("http://localhost:8080/ungiorno2/api/test/test/kid/"+ id)
	};

	$scope.addTime = function() {
		var time = {};
		time["typeId"] = "testId";
		time["type"] = $scope.timeinput;
		$scope.times.push(time);
		$scope.timeinput=null;
	};

	$scope.removeTime = function(x) {
		$scope.times.splice(x, 1);
	}

	$scope.addAbsence = function() {
		var absence = {};
		absence["typeId"] = "testId";
		absence["type"] = $scope.absenceinput;
		$scope.absences.push(absence);
		$scope.absenceinput=null;
	};

	$scope.removeAbsence = function(x) {
		$scope.absences.splice(x, 1);
	}

	$scope.addIllness = function() {
		var illness = {};
		illness["typeId"] = "testId";
		illness["type"] = $scope.illnessinput;
		$scope.illnessess.push(illness);
		$scope.illnessinput=null;
	};

	$scope.removeIllness = function(x) {
		$scope.illnessess.splice(x, 1);
	}
	$scope.addAllergy = function() {
		var allergy = {};
		allergy["typeId"] = "testId";
		allergy["type"] = $scope.allergyinput;
		$rootScope.selkid.allergies.push(allergy);
		$scope.allergyinput=null;
	};

	$scope.removeAllergy = function(x) {
		$rootScope.selkid.allergies.splice(x, 1);
	}
	$scope.getKid();
	$scope.getTeacher();
	$scope.getGroup();
	$scope.getPerson();
};

routerApp.config(function($urlRouterProvider) {
	$urlRouterProvider.when('', '/home');
	$urlRouterProvider.when('/child/menu', '/child/menu/child_create/info');
})
routerApp.config(function($stateProvider) {

	$stateProvider

	.state('home', {
		url : '/home',
		templateUrl : 'home.html'
	})

	.state('school', {
		url : '/school',
		templateUrl : 'school.html'
	})

	.state('teacher_list', {
		url : '/teachers',
		templateUrl : 'teacher_list.html'
	})

	.state('child_list', {
		url : '/child',
		templateUrl : 'child_list.html'
	})

	.state('group_list', {
		url : '/groups',
		templateUrl : 'group_list.html'
	})

	.state('bus', {
		url : '/bus',
		templateUrl : 'bus.html'
	}).state('child_menu', {
		url : '/child/menu',
		templateUrl : 'child_menu.html'
	}).state('group_create', {
		url : '/groups/group_create',
		templateUrl : 'group_create.html'
	})

	.state('teacher_create', {
		url : '/teachers/teacher_create',
		templateUrl : 'teacher_create.html'
	}).state('teacher_edit', {
		url : '/teachers/teacher_edit',
		templateUrl : 'teacher_edit.html'
	}).state('child_view', {
		url : '/child_view',
		templateUrl : 'child_view.html'
	}).state('child_menu.child_create_1', {
		url : '/child_create/info',
		templateUrl : 'child_create_1.html'

	}).state('child_menu.child_create_2', {
		url : '/child_create/parents',
		templateUrl : 'child_create_2.html'
	}).state('child_menu.child_create_3', {
		url : '/child_create/persons',
		templateUrl : 'child_create_3.html'
	})
});