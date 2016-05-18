angular.module('it.smartcommunitylab.infanziadigitales.teachers.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, $ionicLoading, moment, teachersService, sectionService, communicationService, Config, $ionicSideMenuDelegate, $ionicPopup, loginService) {
    $scope.sections = null;
    $scope.section = null;
    $scope.childrenConfigurations = [];
    $scope.childrenProfiles = [];
    $scope.childrenNotes = [];
    $scope.availableChildren = [];
    $scope.totalChildrenNumber = [];
    $scope.colors = [];
    $scope.noteExpanded = false;
    $scope.teachersNote = true;
    $scope.parentsNote = false;
    $scope.newNoteExpandend = false;
    $scope.communicationExpanded = false;
    $scope.schoolProfile = null;
    $scope.numberOfChildren = 0;
    $scope.communications = [];
    $scope.childrenCommunicationDelivery = null;
    $scope.selectedNote = false;
    $scope.data = {
        communication: ""
    };
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        //if I come from login, initialize
        if (fromState.name == 'app.login') {
            $scope.initialize();
            sectionService.setSection(null);

        }
    });
    $scope.$on('$ionicView.beforeEnter', function () {
        if (communicationService.getToCheck()) {
            //expand side menu on communication
            $scope.openCommunications();
            if (communicationService.getCommunication()) {
                $scope.data = {
                    communication: communicationService.getCommunication().communicationId
                }
            };
            $scope.childrenCommunicationDelivery = communicationService.getCommunication().children;
        }

    });

    $scope.getDateString = function () {
        var today = new Date();
        $scope.date = today.getTime();;
    }
    $scope.viewClose = function () {
        return $scope.noteExpanded || $scope.communicationExpanded;
    }

    $scope.closeNotesAndComm = function () {
        $scope.noteExpanded = false;
        $scope.communicationExpanded = false;
        $scope.teachersNote = true;
        $scope.parentsNote = false;
        $scope.newNoteExpandend = false;
        //put the same list of children on the check
    }

    $scope.saveNotesAndComm = function () {
        $scope.noteExpanded = false;
        $scope.communicationExpanded = false;
        $scope.teachersNote = true;
        $scope.parentsNote = false;
        $scope.newNoteExpandend = false;
        //save the new list
        var communication = communicationService.getCommunication();
        communication.children = $scope.childrenCommunicationDelivery;
        dataServerService.modifyCommunication($scope.schoolProfile.schoolId, communicationService.getCommunication().coomunicationId, communication).then(function (data) {
            Toast.show($filter('translate')('communication_modified'), 'short', 'bottom');
            communicationService.setToCheck(false);
        }, function (data) {
            Toast.show($filter('translate')('communication_not_modified'), 'short', 'bottom');
            communicationService.setToCheck(false);

        });
    }
    $scope.data = {
        communication: null
    };
    $scope.newNote = {
        possibleChildrens: [],
        associatedKids: [],
        search: '',
        kidIds: [],
        showHints: false
    };

    $scope.sendNewNote = function () {
        var noteToSend = {
            date: new Date().getTime(),
            note: $scope.newNote.description
        };
        var ids;
        if ($scope.newNote.assignedBaby) {
            ids = $scope.newNote.kidIds;
        } else {
            if ($scope.section.sectionId !== "all") {
                ids = [$scope.section.sectionId];
            }
        }

        var requestFail = function () {
            var myPopup = $ionicPopup.show({
                title: $filter('translate')('new_note_fail'),
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
                            $scope.sendNewNote();
                        }
                    }
                ]
            });
        }

        var requestSuccess = function (data) {
            Toast.show($filter('translate')('new_note_sent'), 'short', 'bottom');
            $scope.newNote = {
                possibleChildrens: [],
                associatedKids: [],
                search: '',
                kidIds: [],
                showHints: false
            };
            var note = data.data;
            injectBabyInformationsInNote(note);
            $scope.teacherNotes.push(note);
        }

        dataServerService.addNewInternalNote($scope.schoolProfile.schoolId, $scope.newNote.assignedBaby, ids, noteToSend).then(function (data) {
            requestSuccess(data);
            $scope.cancelNewNote(); //close panel of new note
        }, function (data) {
            requestFail(data);
        });
    }

    $scope.selectChildrenForNote = function (children) {
        if ($scope.newNote.kidIds.indexOf(children.kidId) === -1) {
            $scope.newNote.kidIds.push(children.kidId);
            $scope.newNote.associatedKids.push(children);
        }
        $scope.newNote.search = "";
        $scope.newNote.possibleChildrens = [];
    }

    $scope.deleteChildrenFromNewNote = function (children) {
        var index = $scope.newNote.kidIds.indexOf(children.kidId);
        $scope.newNote.kidIds.splice(index, 1);
        $scope.newNote.associatedKids.splice($scope.newNote.associatedKids.indexOf(children), 1);
    }

    $scope.hintSearchBoxFocus = false;
    $scope.hintPanelFocus = false;

    $scope.focused = function (searchbox, state) {
        if (searchbox) {
            $scope.hintSearchBoxFocus = state;
        } else {
            $scope.hintPanelFocus = state;
        }
    }

    $scope.displayHint = function () {
        return $scope.hintSearchBoxFocus || $scope.hintPanelFocus;
    }


    $scope.search = function () {
        if ($scope.newNote.search != "") {
            profileService.searchChildrenBySection($scope.newNote.search, $scope.section).then(
                function (children) {
                    $scope.newNote.possibleChildrens = children;
                }
            )
        } else {
            $scope.newNote.possibleChildrens = [];
        }
    }

    var getPeriodToNow = function () {
        var period;
        var now = $filter('date')(new Date(), 'H:mm'); //bad workaround, but current schoolprofile timings aren't timestamps!
        if (now >= $scope.schoolProfile.regularTiming.fromTime && now < $scope.schoolProfile.regularTiming.toTime) {
            period = 'mensa';
        } else if (now >= $scope.schoolProfile.posticipoTiming.fromTime && now < $scope.schoolProfile.posticipoTiming.toTime) {
            period = 'posticipo';
        } else {
            period = 'anticipo';
        }
        return period;
    }

    $scope.title = moment().locale('it').format("dddd, D MMMM gggg");
    $scope.refreshHome = function () {
        $scope.initialize();
    }
    $scope.initialize = function () {
        $ionicLoading.show({
            template: $filter('translate')('loading_data')
        });
        $scope.title = $filter('date')(new Date(), 'EEEE, dd MMMM yyyy'); // cat - profile teacher


        dataServerService.getSchoolProfileForTeacher().then(function (schoolProfile) {
            if (schoolProfile) {
                $scope.schoolProfile = schoolProfile;
                $scope.datePosticipo = new Date();
                var timeArr = $scope.schoolProfile.posticipoTiming.fromTime.split(':')
                $scope.datePosticipo.setHours(timeArr[0]);
                $scope.datePosticipo.setMinutes(timeArr[1]);
                profileService.setSchoolProfile($scope.schoolProfile);
                if ($scope.selectedPeriod == null) {
                    $scope.selectedPeriod = getPeriodToNow();
                }
                loginService.getTeacherName($scope.schoolProfile.schoolId);

                dataServerService.getSections($scope.schoolProfile.schoolId).then(function (data) {
                    if (data != null) {
                        $scope.sections = data;
                        if (sectionService.getSection() == null) {
                            $scope.section = $scope.sections[0];
                            sectionService.setSection(0);
                        } else {
                            $scope.changeSection(sectionService.getSection());
                        }
                        $scope.getChildrenByCurrentSection();
                        $scope.loadNotes();
                        $ionicLoading.hide();
                        Toast.show($filter('translate')('data_updated'), 'short', 'bottom');
                    }
                }, function (err) {
                    //manage error sections
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                    $ionicLoading.hide();
                })
                dataServerService.getTeachers($scope.schoolProfile.schoolId).then(function (data) {
                    teachersService.setTeachers(data);
                    // select the right teacher
                    for (var k = 0; k < data.length; k++) {
                        if (data[k].username == localStorage.username) {
                            $scope.selectedTeacher = data[k];
                            $scope.title += ' - ' + $scope.selectedTeacher.teacherFullname;
                        }
                    }


                    //                if (localStorage.name || localStorage.surname) {
                    //                    $scope.title += ' - ' + localStorage.name + ' ' + localStorage.surname;
                    //                }
                    teachersService.setSelectedTeacher($scope.selectedTeacher);
                    console.log($scope.selectedTeacher);
                }, function (err) {
                    //manage error teachers
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                    $ionicLoading.hide();
                });
            } else {
                $ionicLoading.hide();

            }
            if ($scope.schoolProfile) {
                communicationService.getCommunicationsFromServer($scope.schoolProfile.schoolId).then(function (data) {
                    $scope.communications = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].doCheck) {
                            $scope.communications.push(data[i]);
                        }
                    }
                    //manage kids' profiles with notifications for messages
                    //check if parameter is sent otherwise take the first
                    /*$scope.data.communication = $scope.communications[0].communicationId;
                    $scope.changeCommunication($scope.data.communication);*/
                }, function (err) {
                    //manage error communications
                    Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                    $ionicLoading.hide();
                });
            }
        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
        });


    };

    $scope.getClassByPeriod = function (child, selectedPeriod) {
        switch (selectedPeriod) {
        case 'anticipo':

            if (child.exitTime != null && child.anticipo.enabled) {
                //presente se iscritto ad anticipo e non assente
                return 'child-presente';
            } else return 'child-assente';
            break;
        case 'mensa':
            //totale di bambini iscritti a scuola
            if (child.exitTime != null) {
                //presente se iscritto e non assente
                return 'child-presente';
            } else return 'child-assente';
            break;
        case 'posticipo':

            if (child.exitTime != null && child.exitTime > $scope.datePosticipo.getTime() && child.posticipo.enabled) {
                //presente se iscritto  a posticipo e non assente e non ritirto prima dell'inizio del posticipo

                return 'child-presente';
            } else return 'child-assente';
            break;
        }
    }
    $scope.openParentsNotes = function () {
        $scope.parentsNote = true;
        $scope.teachersNote = false;
        $scope.newNoteExpandend = false;
    }

    $scope.openTeacherNotes = function () {
        $scope.parentsNote = false;
        $scope.teachersNote = true;
        $scope.newNoteExpandend = false;
    }

    $scope.createNotes = function () {
        $scope.parentsNote = false;
        $scope.teachersNote = false;
        $scope.newNoteExpandend = true;
    }

    $scope.cancelNewNote = function () {
        $scope.newNoteExpandend = false;
        $scope.parentsNote = false;
        $scope.teachersNote = true;
    }


    //when select is clicked
    $scope.changeCommunication = function (communicationId) {
        communicationService.setCommunication(communicationId);
        $scope.childrenCommunicationDelivery = communicationService.getCommunication().children;
    }
    $scope.getChildrenDeliveryByID = function (id) {
        if ($scope.communicationExpanded && $scope.childrenCommunicationDelivery != null) {
            if ($scope.childrenCommunicationDelivery.indexOf(id) >= 0)
                return true
            return false
        }
        return false
    }
    $scope.switchChildrenDeliveryByID = function (childId) {
        // if ($scope.childrenCommunicationDelivery.indexOf(id) >= 0) {
        //se presente rimuovi, se assente aggiungi
        //var childrenID = $scope.childrenProfiles[id].kidId
        var index = -1;
        if ($scope.childrenCommunicationDelivery) {
            index = $scope.childrenCommunicationDelivery.indexOf(childId);
            if (index > -1) {
                $scope.childrenCommunicationDelivery.splice(index, 1);
            } else {
                $scope.childrenCommunicationDelivery.push(childId);
            }
        }
        //$scope.childrenCommunicationDelivery[id] = !$scope.childrenCommunicationDelivery[id]
        //}

    }

    $scope.detailOrCommunication = function (child) {
        //se modalita' communication, modifico lista consegne e poi confermo
        //altrimenti openDetail(index)
        if (child.active) {
            if ($scope.communicationExpanded) {
                $scope.switchChildrenDeliveryByID(child.kidId)
            } else {
                $scope.openDetail(child);
            }
        } else {
            Toast.show($filter('translate')('child_not_partecipate'), 'short', 'bottom');

        }
    }
    $scope.communicationDone = function (childId) {
        //se sono in modalita' communication e id contenuto nella lista attuale return true

        if ($scope.communicationExpanded && communicationService.childSelectedCommunication(childId)) {
            return true;
        }
        return false;
    }
    $scope.getChildrenByCurrentSection = function () {
        //get children info
        $scope.childrenProfiles = [];
        $scope.getChildrenNumber('anticipo');
        $scope.getChildrenNumber('posticipo');
        $scope.getChildrenNumber('mensa');

        $scope.getChildrenProfilesByPeriod($scope.selectedPeriod);

        $scope.numberOfChildren = $scope.section.children.length;
        for (var i = 0; i < $scope.numberOfChildren; i++) {
            profileService.getBabyProfileById($scope.schoolProfile.schoolId, $scope.section.children[i].kidId).then(function (profile) {
                $scope.childrenProfiles.push(profile);
            });
            babyConfigurationService.getBabyConfigurationById($scope.schoolProfile.schoolId, $scope.section.children[i].kidId).then(function (configuration) {
                $scope.childrenConfigurations.push(configuration);
            });
            /*
                        babyConfigurationService.getBabyNotesById($scope.schoolProfile.schoolId, $scope.section.children[i].childrenId).then(function (notes) {
                            $scope.childrenNotes.push(notes);
                        });*/
        };
    }
    var getAllChildren = function () {
        var allchildren = [];
        for (var i = 0; i < $scope.sections.length; i++) {
            allchildren = allchildren.concat($scope.sections[i].children);
        }
        return allchildren;
    }
    $scope.isThisSection = function (sectionId) {
        if (sectionId != 'all') {
            return sectionService.getSection() === sectionId;
        } else {
            return sectionService.getSection() === -1;
        }

    }
    $scope.changeSection = function (sectionId) {
        sectionService.setSection(sectionId);
        //if (sectionId != -1) {
        if (sectionId != 'all' && sectionId != -1) {
            $scope.section = $scope.sections[sectionId];
            $scope.getChildrenByCurrentSection();
        } else {
            //section == allchildren
            sectionService.setSection(-1);

            $scope.section = {
                appId: "a",
                schoolId: "a",
                sectionId: "all",
                sectionName: "All",
                children: getAllChildren()
            }
            $scope.getChildrenByCurrentSection();
        }
        $scope.loadNotes();
    }

    var injectBabyInformationsInNote = function (note) {
        if (note.kidIds !== null) {
            note.kids = [];

            var kidToFind = note.kidIds.length;
            var sectionChildrenIndex = 0;
            while (kidToFind !== 0 && sectionChildrenIndex < $scope.section.children.length) {
                for (var i = 0; i < note.kidIds.length; i++) {
                    if ($scope.section.children[sectionChildrenIndex].kidId === note.kidIds[i]) {
                        var baby = {
                            kidId: $scope.section.children[sectionChildrenIndex].kidId,
                            image: $scope.section.children[sectionChildrenIndex].image,
                            name: $scope.section.children[sectionChildrenIndex].childrenName

                        }
                        note.kids.push(baby);
                        kidToFind--;
                    }
                }
                sectionChildrenIndex++;
            }
        }
    }

    $scope.loadNotes = function () {
        var sectionsIdsArray = [];
        if ($scope.section.sectionId === "all") {
            $scope.sections.forEach(function (section) {
                sectionsIdsArray.push(section.sectionId);
            });
        } else {
            sectionsIdsArray.push($scope.section.sectionId);
        }
        dataServerService.getInternalNotesBySections($scope.schoolProfile.schoolId, sectionsIdsArray).then(function (data) {
            $scope.teacherNotes = data;

            //insert babys photos and name into notes
            //O(n^3)... for some images and names
            $scope.teacherNotes.forEach(function (note) {
                injectBabyInformationsInNote(note);
            });



        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
        });
        dataServerService.getKidsNotesBySectionIds($scope.schoolProfile.schoolId, sectionsIdsArray).then(function (data) {
            $scope.parentNotes = data;
            $scope.parentNotes.forEach(function (note) {
                var found = false;
                var sectionChildrenIndex = 0;
                while (!found && sectionChildrenIndex < $scope.section.children.length) {
                    if ($scope.section.children[sectionChildrenIndex].kidId === note.kidId) {
                        var baby = {
                            image: $scope.section.children[sectionChildrenIndex].image,
                            kidId: $scope.section.children[sectionChildrenIndex].kidId,
                            name: $scope.section.children[sectionChildrenIndex].childrenName
                        }
                        note.kid = baby;
                    }
                    sectionChildrenIndex++;
                }
            });
        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();
        });
    }

    $scope.isBabyAssignedToNote = function (note) {
        var asd = note.kidIds !== null;
        return note.kidIds !== null;
    }

    $scope.openDetailById = function (childId) {
        var found = false;
        var i = 0;
        var child;
        while (!found && i < $scope.section.children.length) {
            if ($scope.section.children[i].kidId === childId) {
                child = $scope.section.children[i];
                found = true;
            }
            i++;
        }
        $scope.openDetail(child);
    }

    $scope.openDetail = function (child) {
        profileService.setCurrentBaby(child);
        window.location.assign('#/app/babyprofile');
    }

    $scope.openNotes = function () {
        if (!$scope.noteExpanded) {
            $scope.noteExpanded = true;
            $scope.communicationExpanded = false;

        } else {
            $scope.noteExpanded = false;
        }
    }
    $scope.openCommunications = function () {
        if (!$scope.communicationExpanded) {
            $scope.communicationExpanded = true;
            $scope.noteExpanded = false;

        } else {
            $scope.communicationExpanded = false;

        }
    }

    $scope.getChildrenProfilesByPeriod = function (periodOfTheDay) {
        $scope.childrenProfiles[periodOfTheDay] = [];
        $scope.colors['anticipo'] = '#ddd';
        $scope.colors['posticipo'] = '#ddd';
        $scope.colors['mensa'] = '#ddd';

        $scope.colors[periodOfTheDay] = '#abc';

        if ($scope.section != null) {
            for (var i = 0; i < $scope.section.children.length; i++) {
                //create string child[selectedPeriod].presenza
                if ($scope.section.children[i].exitTime == null) {
                    $scope.section.children[i].presenza = $filter('translate')('absent');
                } else {
                    var oraUscita = new Date($scope.section.children[i].exitTime);
                    $scope.section.children[i].presenza = $filter('translate')('exit_to') + $filter('date')(oraUscita, 'HH:mm');
                }
                //putNotification($scope.section.children[i]):
                switch (periodOfTheDay) {
                case 'anticipo':
                    if ($scope.section.children[i][periodOfTheDay].enabled) {
                        //aggiungi se iscritto al servizio
                        $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
                    }
                    break;
                case 'mensa':
                    //totale di bambini iscritti a scuola
                    $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
                    break;
                case 'posticipo':
                    if ($scope.section.children[i][periodOfTheDay].enabled) {
                        //totalNumber++;
                        $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
                    }
                    break;
                }



            }
        }
    }
    $scope.getNowDate = function () {
        return Date.now()
    }
    $scope.getChildrenNumber = function (periodOfTheDay) {
        $scope.totalChildrenNumber[periodOfTheDay] = 0;
        $scope.availableChildren[periodOfTheDay] = 0;

        if ($scope.section != null) {
            for (var i = 0; i < $scope.section.children.length; i++) {
                switch (periodOfTheDay) {
                case 'anticipo':
                    if ($scope.section.children[i][periodOfTheDay].enabled) {
                        //aggiungi se iscritto al servizio
                        $scope.totalChildrenNumber[periodOfTheDay]++;
                    }
                    if ($scope.section.children[i].exitTime != null && $scope.section.children[i][periodOfTheDay].enabled) {
                        //aggiungi se iscritto ad anticipo e non assente
                        $scope.availableChildren[periodOfTheDay]++;
                    }
                    break;
                case 'mensa':
                    //totale di bambini iscritti a scuola
                    $scope.totalChildrenNumber[periodOfTheDay]++;
                    if ($scope.section.children[i].exitTime != null) {
                        //aggiungi se iscritto e non assente
                        $scope.availableChildren[periodOfTheDay]++;
                    }
                    break;
                case 'posticipo':
                    if ($scope.section.children[i][periodOfTheDay].enabled) {
                        //totalNumber++;
                        $scope.totalChildrenNumber[periodOfTheDay]++;
                    }
                    if ($scope.section.children[i].exitTime != null && $scope.section.children[i].exitTime > $scope.datePosticipo.getTime() && $scope.section.children[i][periodOfTheDay].enabled) {
                        //totalNumber++;
                        $scope.availableChildren[periodOfTheDay]++;
                    }
                    break;
                }


            }
        }
    }

    //    .directive('section', function () {
    //        return {
    //            template: '<svg id="svg" viewbox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ddd" /><path fill="none" stroke-linecap="round" stroke-width="5" stroke="#fff" stroke-dasharray="100,250" d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80" /><text x="50" y="50" text-anchor="middle" dy="7" font-size="20">{{sections.length}}</text></svg>'
    //        };
    //    });
    $scope.getLineStroke = function (getNumberChildren, totalNumberOfChildren) {
        var lineStroke = null;
        lineStroke = (250 / totalNumberOfChildren) * getNumberChildren;
        return lineStroke + ",250";
    }

    $scope.sectionColor = function (period) {
            if (period == $scope.selectedPeriod)
                return '#abc';
            return '#ddd';
        }
        //    $scope.changeSection = function (sectionId) {
        //        sectionService.setSection(sectionId)
        //    }
    $scope.changeSectionPeriod = function (period) {
        $scope.selectedPeriod = period;
        $scope.getChildrenProfilesByPeriod(period);
    }

    $scope.getChildImage = function (child) {
        var image = Config.URL() + "/" + Config.app() + "/student/" + Config.appId() + "/" + $scope.schoolProfile.schoolId + "/" + child.kidId + "/true/images";
        return image;
    }

});
