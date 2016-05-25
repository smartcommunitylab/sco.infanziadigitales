angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService, $filter, $location, $ionicScrollDelegate, diaryService, $state, Toast, ionicDatePicker, profileService) {

    // ELEMENTO PERSONA
    $scope.copiedaccess = {
        lastName: '',
        firstName: '',
        phone: [],
        email: [],
        relation: '',
        parent: '',
        birthday: null,
    };

    // OGGETTI DI APPOGGIO PER L'INSERIMENTO
    $scope.access = {
        lastName: '',
        firstName: '',
        relation: '',
        phone: null,
        email: null,
        birthday: null
    };

    $scope.isParent = function () {
        if ($scope.access.relation == 'parent') {
            return true;
        }
    };
    //    $scope.isAccess = function () {
    //        if ($scope.access.relation == 'parent1' || $scope.access.relation == 'parent2' || $scope.access.relation == 'brother' || $scope.access.relation == 'sister' || $scope.access.relation == 'parent') {
    //            return true;
    //        }
    //    };

    // FUNZIONE PER PERMESSI MODIFICA
    $scope.isAccess = function () {
        if ($scope.access.relation == 'parent' || $scope.access.relation == 'teacher') {
            return true;
        }
    };

    // AGGIUNGE UN ELEMENTO PERSON AL BAMBINO
    var addAccessComponent = function () {
        /*$scope.addedComponents.splice(index, 1);*/
        copyAccess();
        if ($scope.access.firstName != "" && $scope.access.lastName != "") {
            $scope.babyCopy.persons.push($scope.copiedaccess);
        }
        clearAccess();
    }

    // POPOLA UN ELEMENTO PERSON DEL BAMBINO
    var copyAccess = function () {
        $scope.copiedaccess.fullName = $scope.access.firstName + " " + $scope.access.lastName;
        $scope.copiedaccess.lastName = $scope.access.lastName;
        $scope.copiedaccess.firstName = $scope.access.firstName;
        $scope.copiedaccess.phone.push($scope.access.phone);
        $scope.copiedaccess.email.push($scope.access.email);
        $scope.copiedaccess.relation = $scope.access.relation;
        $scope.copiedaccess.parent = $scope.isParent();
        $scope.copiedaccess.birthday = null;
    };

    // PULISCE UN ELEMENTO PERSON DEL BAMBINO
    var clearAccess = function () {
        $scope.copiedaccess = {
            lastName: '',
            firstName: '',
            phone: [],
            email: [],
            relation: '',
            birthday: null,
            parent: '',
        };
        $scope.access = {
            lastName: '',
            firstName: '',
            relation: '',
            phone: '',
            email: '',
            birthday: null
        };
    }

    /* START IONIC DATEPICKER */

    $scope.date = new Date();
    console.log($scope.date);

    $scope.dateFormat = $filter('date')('yyyy-MM-dd');
    var ipObj1 = {
        callback: function (val) { //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            datePickerCallback(val);
        },
        disabledDates: [],
        from: new Date(2012, 1, 1), //Optional
        to: new Date(2016, 10, 30), //Optional
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        disableWeekdays: [0], //Optional
        closeOnSelect: false, //Optional
        templateType: 'popup' //Optional
    };

    $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(ipObj1);
    };

    var datePickerCallback = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            console.log('Selected date is : ', val)
                /*$scope.baby.birthday = val;*/
            $scope.babyCopy.birthday = val;
        }
    };

    /* END IONIC DATEPICKER */

    // MODIFICA E SALVA IN DETTAGLI DIARIO
    var mode = "view";
    $scope.createMode = diaryService.getCreateDiaryMode();
    $scope.modify = function () {
        $scope.babyCopy = clone($scope.baby);
        mode = "edit";
    }
    $scope.save = function () {
            var error = false;
            error = checkDataError($scope.babyCopy);
            if (!error) {
                $scope.baby = $scope.babyCopy;
                if ($scope.createMode) {
                    $state.go('app.home');
                } else {
                    if (!!$scope.access.relation) {
                        addAccessComponent()
                    };
                    $scope.babyCopy.fullName = $scope.babyCopy.firstName + ' ' + $scope.babyCopy.lastName;
                    profileService.saveChildProfile($scope.babyCopy).then(function (data) {
                        $scope.babyCopy = data.data;
                        $ionicScrollDelegate.scrollTop();
                    });
                    mode = "view";
                }
            }
        }
        // END MODIFICA E SALVA DETTAGLIO DIARIO

    var checkDataError = function (objectToCheck) {
        var error = false;
        for (var key in objectToCheck) {
            if (objectToCheck.hasOwnProperty(key)) {

                if (typeof objectToCheck[key] === 'string' && objectToCheck[key].length === 0) {
                    Toast.show('string must be inserted', 'short', 'bottom');
                    error = true;
                } else if (objectToCheck[key] instanceof Date && objectToCheck[key] > new Date()) {
                    Toast.show("date must be before today", 'short', 'bottom');
                    error = true;
                } else if (objectToCheck[key] instanceof Array) {
                    for (var i = 0; i < objectToCheck[key].length; i++) {
                        error = checkDataError(objectToCheck[key][i]);
                        if (error) return true;
                    }
                }
                if (error) return true;
            }
        }
        return false;
    }
    $scope.isViewMode = function () {
        return mode === "view";
    }
    $scope.isMale = function (gender) {
        return gender === "Maschio";
    }

    // DA ERRORE
    //    $scope.isTeacher = function (relation) {
    //        if (relation == 'teacher') {
    //            return true;
    //            //return relation === "teacher";
    //        }
    //    }
    //
    $scope.isFamily = function (relation) {
        if (relation == 'parent1' || relation == 'parent2' || relation == 'brother' || relation == 'sister' || relation == 'parent') {
            return true;
        }
        //              return relation === "parent1" || relation === "parent2" || relation === "sister" || relation === "brother" || relation === "parent";
    }

    $scope.relationType = function (relation) {
        switch (relation) {
            case 'parent':
                toRtn = "Genitore";
                break;
            case 'sister':
                toRtn = "Sorella";
                break;
            case 'brother':
                toRtn = "Fratello";
                break;
            case 'teacher':
                toRtn = "Insegnante";
                break;
        }
        return toRtn;
    }

    $scope.getBaby = function (gender) {
        var baby;
        if (gender === "Femmina") {
            baby = "bambina";
        } else {

            baby = "bambino";
        }
        return baby;
    }
    $scope.addedComponents = [];
    $scope.addComponent = function () {
        $scope.scrollTo("selezion-button");
        $scope.addedComponents.push({});
    }
    $scope.addedPeople = [];

    $scope.addPeople = function () {
        $scope.scrollTo("selezion-button");
        $scope.addedPeople.push({})
    }
    $scope.deleteComponent = function (index) {
        /*$scope.addedComponents.splice(index, 1);*/
        $scope.babyCopy.persons.splice(index, 1);
    }
    $scope.deletePeople = function (index) {
        $scope.addedPeople.splice(index, 1);
        $ionicScrollDelegate.scrollBottom("bottom-button");
    }
    $scope.scrollTo = function (id) {
        $location.hash(id)
        $ionicScrollDelegate.anchorScroll(true);
    };
    $scope.isEmptyNote = function (note) {
        if (note === "") {
            return true
        } else {
            return false
        }
    }

    //    $scope.getPreposition = function (gender, relation) {
    //        var toRtn;
    //        switch (gender) {
    //            case 'Maschio':
    //                toRtn = "del";
    //                break;
    //            case 'Femmina':
    //                toRtn = "della";
    //                break;
    //            default:
    //                toRtn = "del";
    //        }
    //        if (relation === "zio") {
    //            toRtn = "dello";
    //        }
    //        return toRtn;
    //    }

    //    $scope.getPreposition = function (relation) {
    //        var toRtn;
    //        switch (relation) {
    //        case 'parent1':
    //            toRtn = "Nome del genitore";
    //            break;
    //        case 'parent2':
    //            toRtn = "Nome del genitore";
    //            break;
    //        case 'brother':
    //            toRtn = "Nome del fratello";
    //            break;
    //        case 'sister':
    //            toRtn = "Nome della sorella";
    //            break;
    //        case 'parent':
    //            toRtn = "Nome del ";
    //            break;
    //        case 'teacher':
    //            toRtn = "sorella";
    //            break;
    //        default:
    //            toRtn = "del";
    //        }
    //        if (relation === "zio") {
    //            toRtn = "dello";
    //        }
    //        return toRtn;
    //    }


    $scope.getString = function (firstString, gender, relation) {
        var string;
        string = $filter('translate')(firstString) + $scope.getPreposition(gender, relation);
        return string;
    }
    $scope.babyCopy = {}

    if ($scope.createMode) {
        $scope.modify();
    } else {

        profileService.getCurrentBaby().then(function (data) {
            $scope.baby = data;
            /*$scope.baby.birthday = new Date($scope.baby.birthday * 1000);*/
            for (var i = 0; i < $scope.baby.persons.length; i++) {
                if (!!$scope.baby.persons[i].birthday) {
                    $scope.baby.persons[i].birthday = new Date($scope.baby.persons[i].birthday * 1000);
                }
            }
            $scope.babyCopy = clone($scope.baby);
            console.log($scope.babyCopy);
        });
    }

    function clone(obj) {
        var copy;
        if (null == obj || "object" != typeof obj) return obj;
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
});
