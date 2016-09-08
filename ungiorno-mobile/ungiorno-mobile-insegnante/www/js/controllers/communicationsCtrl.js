angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.communications', [])

.controller('communicationsCtrl', function ($scope, dataServerService, $ionicPopup, communicationService, profileService, Toast, $filter, $ionicLoading, $compile) {

    var selectedCommunicationIndex = -1;

    var MODE_NORMAL_LIST = "normal";
    var MODE_EDIT = "edit";
    var MODE_NEW = "new";
    // $scope.editedCommunication
    var currentMode = MODE_NORMAL_LIST;
    $scope.datepickerObject = {};
    $scope.datepickerObject.inputDate = new Date();
    var monthList = [
        $filter('translate')('popup_datepicker_jan'),
        $filter('translate')('popup_datepicker_feb'),
        $filter('translate')('popup_datepicker_mar'),
        $filter('translate')('popup_datepicker_apr'),
        $filter('translate')('popup_datepicker_may'),
        $filter('translate')('popup_datepicker_jun'),
        $filter('translate')('popup_datepicker_jul'),
        $filter('translate')('popup_datepicker_ago'),
        $filter('translate')('popup_datepicker_sep'),
        $filter('translate')('popup_datepicker_oct'),
        $filter('translate')('popup_datepicker_nov'),
        $filter('translate')('popup_datepicker_dic')
    ];
    var weekDaysList = [
        $filter('translate')('popup_datepicker_sun'),
        $filter('translate')('popup_datepicker_mon'),
        $filter('translate')('popup_datepicker_tue'),
        $filter('translate')('popup_datepicker_wed'),
        $filter('translate')('popup_datepicker_thu'),
        $filter('translate')('popup_datepicker_fri'),
        $filter('translate')('popup_datepicker_sat')
    ];


    function setDateWidget() {

        $scope.datepickerObjectPopup = {
            titleLabel: $filter('translate')('popup_datepicker_title'), //Optional
            todayLabel: $filter('translate')('popup_datepicker_today'), //Optional
            closeLabel: $filter('translate')('close'), //Optional
            setLabel: $filter('translate')('popup_datepicker_set'), //Optional
            errorMsgLabel: $filter('translate')('popup_datepicker_error_label'), //Optional
            setButtonType: 'button-popup', //Optional
            todayButtonType: 'button-popup', //Optional
            closeButtonType: 'button-popup', //Optional
            modalHeaderColor: 'bar-positive', //Optional
            modalFooterColor: 'bar-positive', //Optional
            templateType: 'popup', //Optional
            showTodayButton: 'true',
            inputDate: $scope.datepickerObject.inputDate, //Optional
            mondayFirst: true, //Optional
            monthList: monthList, //Optional
            weekDaysList: weekDaysList,
            from: new Date(), //Optional
            to: new Date(2220, 12, 1), //Optional
            callback: function (val) { //Optional
                datePickerCallbackPopup(val);
            }
        };
    }
    var datePickerCallbackPopup = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            $scope.datepickerObjectPopup.inputDate = val;
            $scope.dateTimestamp = $filter('date')(val.getTime(), 'MM/dd/yyyy');
            if ($scope.isMode(MODE_NEW)) {
                $scope.newCommunication.dateToCheck = $scope.datepickerObjectPopup.inputDate;
            } else {
                $scope.editedCommunication.dateToCheck = $scope.datepickerObjectPopup.inputDate;
            }
        }
    };
    setDateWidget();
    $scope.communicationTypes = [
        {
            typeId: "0",
            name: "Senza richiesta dei genitori",
            checked: false
        }, {
            typeId: "1",
            name: "Con richiesta dei genitori",
            checked: true
        }
//        {
//            typeId: "0",
//            name: "Aggiungi scadenza",
//            checked: false
//        }
    ];
    $scope.delivery = false;
    var sortCommunications = function () {
        $scope.communications = $filter('orderBy')($scope.communications, '-creation');
    }


    dataServerService.getCommunications(profileService.getSchoolProfile().schoolId).then(function (data) {
        $scope.communications = data;
        for (var i = 0; i < $scope.communications.length; i++) {
            $scope.communications[i].dateToCheck = new Date($scope.communications[i].dateToCheck);
            $scope.communications[i].creation = $scope.communications[i].creationDate;
            $scope.communications[i].creationDate = $scope.communications[i].creationDate;
        }
        sortCommunications();
    }, function (err) {
        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
        $ionicLoading.hide();
    });

    $scope.selectCommunication = function (index) {

        if ($scope.isMode(MODE_NORMAL_LIST)) {
            if (selectedCommunicationIndex === index) {
                selectedCommunicationIndex = -1;
            } else {
                selectedCommunicationIndex = index;
            }
        }
    }

    $scope.isMode = function (mode) {
        return currentMode === mode;
    }

    $scope.editCommunicationMode = function (index) {
        var tmp = $scope.communications[index];
        //"57b5b9d0e4b0cfd3937cd298"
        //appId
        //:
        //"trento"
        //children
        //:
        //Array[0]
        //communicationId
        //:
        //"57b5b9d0e4b0cfd3937cd298"
        //creationDate
        //:
        //1471527376410
        //dateToCheck
        //:
        //1471527200292
        //description
        //:
        //"Tr"
        //doCheck
        //:
        //false
        //schoolId
        //:
        //"scuola2"
        $scope.editedCommunication = {
            appId: tmp.appId,
            children: tmp.children,
            communicationId: tmp.communicationId,
            schoolId: tmp.schoolId,
            dateToCheck: new Date(tmp.dateToCheck),
            creationDate: new Date(),
            description: tmp.description,
            doCheck: tmp.doCheck,
            children: []
        };
        currentMode = MODE_EDIT;
        selectedCommunicationIndex = index;

        $scope.delivery = $scope.editedCommunication.doCheck;

        if (document.getElementById("communication-datepicker-" + index)) {
            //document.getElementById("communication-datepicker").innerHTML = "<div ng-include=\'communicationDatepicker.html\'></div>";
            document.getElementById("communication-datepicker-" + index).innerHTML = " <ion-list class=\"padlist\">    <ion-radio type=\"radio\" ng-model=\"editedCommunication.doCheck\" ng-value=\"communicationTypes[0].checked\" on-tap=\"selectType(communicationTypes[0])\"> {{communicationTypes[0].name}}    </ion-radio>    <br/>    <ion-radio type=\"radio\" ng-model=\"editedCommunication.doCheck\" ng-value=\"communicationTypes[1].checked\" on-tap=\"selectType(communicationTypes[1])\"> {{communicationTypes[1].name}}    </ion-radio>    <br/></ion-list><div ng-show = \"delivery\">    <a class=\" input-label newComItems communication-text\">{{ 'deadline_time' | translate}} : </a>    <ionic-datepicker input-obj=\"datepickerObjectPopup\">        <span class=\"input-label date-label\">{{editedCommunication.dateToCheck | date:'dd/MM/yyyy'}}</span>        <button ng-hide=\"true\"></button>    </ionic-datepicker></div>             <div class=\"row\">                <div class=\"col\">                    <input  ng-model=\"editedCommunication.description\" type=\"text\" id=\"modifyDescription\" value=\"{{editedCommunication.description}}\"> </div>            </div>";
            $compile(document.getElementById('communication-datepicker-' + index))($scope);
        }

    }

    $scope.isCommunicationSelected = function (index) {
        return selectedCommunicationIndex === index;
    }

    $scope.someCommunicationSelected = function () {
        return selectedCommunicationIndex !== -1;
    }

    $scope.controlDateToCheck = function (index) {
        return $scope.communications[index].doCheck;
    }

    $scope.createCommunicationMode = function () {
        $scope.newCommunication = {
            dateToCheck: new Date(),
            creationDate: new Date(),
            description: "",
            doCheck: false,
            children: []
        };
        currentMode = MODE_NEW;
    }
    var setNormalMode = function () {
        currentMode = MODE_NORMAL_LIST;
        if (document.getElementById("communication-datepicker-" + selectedCommunicationIndex)) {
            //document.getElementById("communication-datepicker").innerHTML = "<div ng-include=\'communicationDatepicker.html\'></div>";
            document.getElementById("communication-datepicker-" + selectedCommunicationIndex).innerHTML = "";
            $compile(document.getElementById('communication-datepicker-' + selectedCommunicationIndex))($scope);
        }
    }
    $scope.discardCommunication = function () {
            setNormalMode();
            //            currentMode = MODE_NORMAL_LIST;
            //            if (document.getElementById("communication-datepicker-" + selectedCommunicationIndex)) {
            //                //document.getElementById("communication-datepicker").innerHTML = "<div ng-include=\'communicationDatepicker.html\'></div>";
            //                document.getElementById("communication-datepicker-" + selectedCommunicationIndex).innerHTML = "";
            //                $compile(document.getElementById('communication-datepicker-' + selectedCommunicationIndex))($scope);
            //            }


        }
        //    $scope.newCommunicationCheck = {
        //        dochek: false;
        //    }
    $scope.selectType = function (newType) {


        if (newType.typeId === "0") {
            $scope.delivery = false;
            // $scope.newCommunication.doCheck = true;
        } else {
            $scope.delivery = true;
            //            document.getElementById("communication-datepicker-" + selectedCommunicationIndex).innerHTML = " <div ng-show = \"delivery\">    <a class=\" input-label newComItems communication-text\">{{ 'deadline_time' | translate}} : </a>    <ionic-datepicker input-obj=\"datepickerObjectPopup\">        <span class=\"input-label date-label\">{{editedCommunication.dateToCheck | date:'dd/MM/yyyy'}}</span>        <button ng-hide=\"true\"></button>    </ionic-datepicker></div> ";
            //            $compile(document.getElementById('communication-datepicker-' + selectedCommunicationIndex))($scope);
            if (document.getElementById("communication-datepicker-" + selectedCommunicationIndex)) {
                //document.getElementById("communication-datepicker").innerHTML = "<div ng-include=\'communicationDatepicker.html\'></div>";
                document.getElementById("communication-datepicker-" + selectedCommunicationIndex).innerHTML = " <ion-list class=\"padlist\">    <ion-radio type=\"radio\" ng-model=\"editedCommunication.doCheck\" ng-value=\"communicationTypes[0].checked\" on-tap=\"selectType(communicationTypes[0])\"> {{communicationTypes[0].name}}    </ion-radio>    <br/>    <ion-radio type=\"radio\" ng-model=\"editedCommunication.doCheck\" ng-value=\"communicationTypes[1].checked\" on-tap=\"selectType(communicationTypes[1])\"> {{communicationTypes[1].name}}    </ion-radio>    <br/></ion-list><div ng-show = \"delivery\">    <a class=\" input-label newComItems communication-text\">{{ 'deadline_time' | translate}} : </a>    <ionic-datepicker input-obj=\"datepickerObjectPopup\">        <span class=\"input-label date-label\">{{editedCommunication.dateToCheck | date:'dd/MM/yyyy'}}</span>        <button ng-hide=\"true\"></button>    </ionic-datepicker></div>             <div class=\"row\">                <div class=\"col\">                    <input  ng-model=\"editedCommunication.description\" type=\"text\" id=\"modifyDescription\" value=\"{{editedCommunication.description}}\"> </div>            </div>";
                $compile(document.getElementById('communication-datepicker-' + selectedCommunicationIndex))($scope);
            }
        }


    }

    $scope.deleteCommunication = function (index) {

        var communicationFail = function () {
            var communicationFailPopup = $ionicPopup.show({
                title: $filter('translate')('communication_delete_fail'),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('cancel'),
                        type: 'cancel-button'


                    },
                    {
                        text: '<b>' + $filter('translate')('retry') + '</b>',
                        type: 'create-button',
                        onTap: function (e) {
                            deleteFromServer();
                        }
                    }
                ]
            });
        }
        var deleteFromServer = function () {
            dataServerService.deleteCommunication(profileService.getSchoolProfile().schoolId, $scope.communications[index].communicationId).then(function (data) {
                //            dataServerService.deleteCommunication(profileService.getSchoolProfile().schoolId, $scope.communications[selectedCommunicationIndex].communicationId).then(function (data) {
                $scope.communications.splice(index, 1);
                selectedCommunicationIndex = -1;
            }, function (data) {
                communicationFail();
            });
        }


        var deleteConfirm = function () {
            var deleteConfirmPopup = $ionicPopup.show({
                title: $filter('translate')('communication_delete_confirm'),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('communication_discard'),
                        type: 'cancel-button'
                    },
                    {
                        text: '<b>' + $filter('translate')('communication_confirm') + '</b>',
                        type: 'create-button',
                        onTap: function (e) {
                            deleteFromServer();
                        }
                    }
                ]
            });
        }

        deleteConfirm();

    }

    var updateCurrentCommunicationList = function (response) {
        var found = false;
        var i = 0;

        while (i < $scope.communications.length && !found) {
            if (response.data.communicationId === $scope.communications[i].communicationId) {
                $scope.communications[i] = response.data;
                found = true;
            }
            i++;
        }
        if (!found) { //new communication
            $scope.communications.push(response.data);
        }
        sortCommunications();
    }



    $scope.submitCommunication = function () { //edit or new

        var requestFail = function () {
            var myPopup = $ionicPopup.show({
                title: $filter('translate')('communication_fail'),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('cancel'),
                        type: 'cancel-button'
                    },
                    {
                        text: '<b>' + $filter('translate')('retry') + '</b>',
                        type: 'create-button',
                        onTap: function (e) {
                            $scope.submitCommunication();
                        }
                    }
                ]
            });
        }

        var requestSuccess = function (data) {
            if ($scope.isMode(MODE_EDIT)) {
                $scope.communications[selectedCommunicationIndex].description = data.data.description;
                Toast.show($filter('translate')('communication_updated'), 'short', 'bottom');
            } else {
                Toast.show($filter('translate')('communication_sent'), 'short', 'bottom');
            }
            updateCurrentCommunicationList(data);

            //currentMode = MODE_NORMAL_LIST;
            setNormalMode();
            if (selectedCommunicationIndex >= 0) {
                selectedCommunicationIndex = -1;
            }
        }


        if ($scope.isMode(MODE_EDIT) || $scope.isMode(MODE_NEW)) {
            if ($scope.isMode(MODE_NEW) && $scope.newCommunication.description == "") {
                Toast.show($filter('translate')('communication_empty'), 'short', 'bottom');
                return;
            }
            if ($scope.isMode(MODE_EDIT) && $scope.editedCommunication.description == "") {
                Toast.show($filter('translate')('communication_empty'), 'short', 'bottom');
                return;
            }
            if ($scope.isMode(MODE_EDIT)) {
                var tmp = JSON.parse(JSON.stringify($scope.editedCommunication));
            } else {
                var tmp = JSON.parse(JSON.stringify($scope.newCommunication));
            }
            tmp.creationDate = new Date(tmp.creationDate).getTime();
            if (tmp.creation) {
                delete tmp['creation'];
            }
            tmp.dateToCheck = new Date(tmp.dateToCheck).getTime();
            communicationService.addCommunication(profileService.getSchoolProfile().schoolId, tmp).then(function (data) {
                requestSuccess(data);
            }, function (data) {
                requestFail();
            });
        }

    }

    $scope.rende = function (index) {

    }
    $scope.$watch("editedCommunication.doCheck", function (newvalue, oldvalue) {
        console.log(JSON.stringify(newvalue));
        console.log(JSON.stringify(oldvalue));
    });
    $scope.homeRedirect = function (index) {
        selectedCommunicationIndex = -1;
        communicationService.setCommunication($scope.communications[index].communicationId);
        communicationService.setToCheck(true);
        window.location.assign('#/app/home');
    }
});
