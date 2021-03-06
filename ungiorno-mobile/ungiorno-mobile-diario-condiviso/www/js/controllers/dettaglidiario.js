angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.dettaglidiario', [])

.controller('dettaglidiarioCtrl', function ($scope, profileService, $filter, $location, $ionicScrollDelegate, $ionicLoading, diaryService, $state, Toast, ionicDatePicker, profileService) {

    // ELEMENTO PERSONA
    $scope.copiedaccess = {
        lastName: '',
        firstName: '',
        phone: [],
        email: [],
        relation: '',
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

    /*$scope.isParent = function () {
        if ($scope.access.relation == 'parent') {
            return true;
        }
    };*/

    //    $scope.isAccess = function () {
    //        if ($scope.access.relation == 'parent1' || $scope.access.relation == 'parent2' || $scope.access.relation == 'brother' || $scope.access.relation == 'sister' || $scope.access.relation == 'parent') {
    //            return true;
    //        }
    //    };

    // FUNZIONE PER PERMESSI MODIFICA
    /*$scope.isAccess = function () {
        if ($scope.access.relation == 'parent' || $scope.access.relation == 'teacher') {
            return true;
        }
    };*/

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

    /* START DATEPICKER PERSON */

    $scope.date = new Date();
    $scope.CurrentIndex = [];
    //console.log($scope.date);

    $scope.dateFormat = $filter('date')('yyyy-MM-dd');
    var ipObj1 = {
        callback: function (val) { //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            datePickerCallbackPerson(val);
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

    $scope.openDatePicker = function (index) {
        $scope.CurrentIndex = index;
        ionicDatePicker.openDatePicker(ipObj1);
    };

    var datePickerCallbackPerson = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            console.log('Selected date is : ', val)
                /*$scope.baby.birthday = val;*/

        }
        $scope.babyCopy.persons[$scope.CurrentIndex].birthday = val;

    };

    /* END DATEPICKER PERSON */

    /* DATEPICKER BAMBINO */

    $scope.dateFormat = $filter('date')('yyyy-MM-dd');
    var ipObj2 = {
        callback: function (val) { //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            datePickerCallbackBaby(val);
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

    $scope.openDatePickerBaby = function () {
        ionicDatePicker.openDatePicker(ipObj2);
    };

    var datePickerCallbackBaby = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            console.log('Selected date is : ', val)
                /*$scope.baby.birthday = val;*/
            $scope.babyCopy.birthday = val;
        }


    };

    /* END DATEPICKER BAMBINO */


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
                    $ionicLoading.show();
                    profileService.saveChildProfile($scope.babyCopy).then(function (data) {
                        $scope.babyCopy = data.data;
                        $ionicScrollDelegate.scrollTop();
                        $ionicLoading.hide();
                    }, function (err) {
                        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                        $ionicLoading.hide();
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
                if (key === 'firstName' && (objectToCheck[key].length === 0 || objectToCheck[key] == null)) {
                    Toast.show('Inserire nome', 'short', 'bottom');
                    error = true;
                } else if (key === 'lastName' && (objectToCheck[key].length === 0 || objectToCheck[key] == null)) {
                    Toast.show('Inserire cognome', 'short', 'bottom');
                    error = true;
                }
                /*else if ((objectToCheck[key] == null || objectToCheck[key] == []) && key == "phone") {
                                           Toast.show('Inserire numero di telefono', 'short', 'bottom');
                                           error = true;
                                       } else if ((objectToCheck[key] == null || objectToCheck[key] == []) && key == "email") {
                                           Toast.show('Inserire indirizzo email', 'short', 'bottom');
                                           error = true;
                                       }*/
                else if (objectToCheck[key] instanceof Date && objectToCheck[key] > new Date()) {
                    Toast.show("La data deve essere prima di oggi", 'short', 'bottom');
                    error = true;
                } else if (objectToCheck[key] instanceof Array) {
                    for (var i = 0; i < objectToCheck[key].length; i++) {
                        if (key == "phone" && (objectToCheck[key][i] == null || objectToCheck[key][i] == "")) {
                            error = true;
                            Toast.show('Inserire numero di telefono', 'short', 'bottom');
                            return error;
                        } else if (key == "email" && (objectToCheck[key][i] == null || objectToCheck[key][i] == "")) {
                            error = true;
                            Toast.show('Inserire indirizzo email', 'short', 'bottom');
                            return error;
                        } else {
                            error = checkDataError(objectToCheck[key][i]);
                            if (error) return true;
                        }
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
    $scope.isFamily = function (data) {
        if (data.relation == 'fratello' || data.relation == 'sorella' || data.relation == 'nonno' || data.relation == 'nonna' || data.relation == 'zio' || data.relation == 'zia' || data.relation == 'cugino' || data.relation == 'cugina' || data.parent == true) {
            return true;
        }
    }

    // AGGIUNTA NUMERO DI TELEFONO
    $scope.addPhone = function (person) {
            var phones = person.phone;
            /*console.log(phones);*/
            if (phones == null || phones == [] || phones.length == 0) {
                person.phone = [];
                person.phone[0] = null;
            } else {
                if (phones.length === 1) {
                    person.phone.push(null);
                }
            }
        }
        // END AGGIUNTA NUMERO DI TELEFONO

    // REMOVE NUMERO DI TELEFONO
    $scope.deletePhone = function (index, person) {
            person.phone.splice(index, 1);
        }
        // END REMOVE NUMERO DI TELEFONO

    // AGGIUNTA EMAIL
    $scope.addEmail = function (person) {
            var emails = person.email;
            /*console.log(emails);*/
            if (emails == null || emails == [] || emails.length == 0) {
                person.email = [];
                person.email[0] = null;
            } else {
                if (emails.length === 1) {
                    person.email.push(null);
                }
            }
        }
        // END AGGIUNTA EMAIL

    // REMOVE EMAIL
    $scope.deleteEmail = function (index, person) {
            person.email.splice(index, 1);
        }
        // END REMOVE EMAIL

    $scope.relationType = function (data) {
        var toRtn;
        if (data.teacher == true) {
            toRtn = "Insegnante"
        } else if (data.parent == true) {
            toRtn = "Genitore"
        } else {
            switch (data.relation) {
            case 'sorella':
                toRtn = "Sorella";
                break;
            case 'fratello':
                toRtn = "Fratello";
                break;
            case 'nonno':
                toRtn = "Nonno";
                break;
            case 'nonna':
                toRtn = "Nonna";
                break;
            case 'zio':
                toRtn = "Zio";
                break;
            case 'zia':
                toRtn = "Zia";
                break;
            case 'cugino':
                toRtn = "Cugino";
                break;
            case 'cugina':
                toRtn = "Cugina";
                break;
            }
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
        $scope.babyCopy.persons.splice(index, 1);
    }

    // CAN I DELETE A PERSON

    $scope.canDelete = function (data) {
        var myUserID = profileService.getMyProfileID();

        if (myUserID === data.personId) {
            return false;
        } else {

            if (localStorage.currentProfile === "parent" && data.teacher === false) {
                return true;
            } else {
                return false;
            }
        }
    }

    // CAN MODIFY PERMISSION FUNCTION

    $scope.modifyComponent = function (data) {
        var myUserID = profileService.getMyProfileID();

        if (myUserID === data.personId) {
            return true;
        } else {

            if (localStorage.currentProfile === "parent" && data.teacher === false) {
                return true;
            } else {
                return false;
            }
        }
    }

    // CAN MODIFY KID PERMISSION FUNCTION

    $scope.modifyComponentKid = function () {
        if (localStorage.currentProfile === "teacher") {
            return false;
        } else if (localStorage.currentProfile === "parent") {

            return true;
        }

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

    $scope.getPreposition = function (data) {
        var toRtn;
        if (data.teacher == true) {
            toRtn = "dell'insegnante"
        } else if (data.parent == true) {
            toRtn = "del genitore"
        } else {
            switch (data.relation) {
            case 'fratello':
                toRtn = "del fratello";
                break;
            case 'sorella':
                toRtn = "della sorella";
                break;
            case 'nonno':
                toRtn = "del nonno";
                break;
            case 'nonna':
                toRtn = "della nonna";
                break;
            case 'zio':
                toRtn = "dello zio";
                break;
            case 'zia':
                toRtn = "della zia";
                break;
            case 'cugino':
                toRtn = "del cugino";
                break;
            case 'cugina':
                toRtn = "della cugina";
                break;
            default:
                toRtn = "";
            }
        }
        return toRtn;
    }


    $scope.getString = function (firstString, gender, relation) {
        var string;
        string = $filter('translate')(firstString) + $scope.getPreposition(gender, relation);
        return string;
    }
    $scope.babyCopy = {}

    if ($scope.createMode) {
        $scope.modify();
    } else {

        $ionicLoading.show();
        profileService.getCurrentBaby().then(function (data) {
            $scope.baby = data;
            $scope.babyCopy = clone($scope.baby);
            /*console.log($scope.babyCopy);*/
            $ionicLoading.hide();
        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
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
