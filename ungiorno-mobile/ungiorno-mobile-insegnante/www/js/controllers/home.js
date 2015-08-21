angular.module('it.smartcommunitylab.infanziadigitales.diario.teachers.controllers.home', [])

.controller('HomeCtrl', function ($scope, $location, dataServerService, profileService, babyConfigurationService, $filter, $state, Toast, $ionicModal, moment, teachersService, sectionService, communicationService, $ionicSideMenuDelegate) {
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
    $scope.newNote = false;
    $scope.communicationExpanded = false;
    $scope.schoolProfile = null;
    $scope.numberOfChildren = 0;
    $scope.communications = null;
    $scope.childrenCommunicationDelivery = null;
    $scope.selectedNote = false;


    $scope.viewClose = function () {
        return $scope.noteExpanded || $scope.communicationExpanded;
    }

    $scope.closeNotesAndComm = function () {
        $scope.noteExpanded = false;
        $scope.communicationExpanded = false;
        $scope.teachersNote = true;
        $scope.parentsNote = false;
        $scope.newNote = false;
    }


    $scope.data = {
        communication: null
    };
    $scope.data = {
        "children": [],
        "search": ''
    };

    $scope.selectChildrenForNote = function (children) {
        $scope.data.search = children.childrenName;
        $scope.data.children = [];
    }
    $scope.search = function () {
            if ($scope.data.search != "") {
                profileService.searchChildrenBySection($scope.data.search, $scope.section.sectionId).then(
                    function (children) {
                        $scope.data.children = children;
                    }
                )
            } else {
                $scope.data.children = [];
            }
        }
        //dovrebbe essere in base all'ora
    $scope.selectedPeriod = 'anticipo';

    $scope.title = moment().locale('it').format("dddd, D MMMM gggg");
    $scope.initialize = function () {
        dataServerService.getSchoolProfileForTeacher().then(function (schoolProfile) {
            $scope.schoolProfile = schoolProfile;
            profileService.setSchoolProfile($scope.schoolProfile);
            dataServerService.getSections().then(function (data) {
                $scope.sections = data;
                $scope.section = $scope.sections[0];
                sectionService.setSection(0);
                $scope.getChildrenByCurrentSection();
            })
            dataServerService.getTeachers($scope.schoolProfile.schoolId).then(function (data) {
                teachersService.setTeachers(data);
                // temp
                $scope.selectedTeacher = data[0];
                teachersService.setSelectedTeacher($scope.selectedTeacher);
                console.log($scope.selectedTeacher);
            });
            communicationService.getCommunicationsFromServer($scope.schoolProfile.schoolId).then(function (data) {
                $scope.communications = data;
                //check if parameter is sent otherwise take the first
                $scope.data.communication = $scope.communications[0].communicationId;
                $scope.changeCommunication($scope.data.communication);
            });
        });



    };

    $scope.openParentsNotes = function () {
        $scope.parentsNote = true;
        $scope.teachersNote = false;
        $scope.newNote = false;
    }

    $scope.openTeacherNotes = function () {
        $scope.parentsNote = false;
        $scope.teachersNote = true;
        $scope.newNote = false;
    }

    $scope.createNotes = function () {
        $scope.parentsNote = false;
        $scope.teachersNote = false;
        $scope.newNote = true;
    }

    $scope.cancelNewNote = function () {
        $scope.newNote = false;
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
        index = $scope.childrenCommunicationDelivery.indexOf(childId);
        if (index > -1) {
            $scope.childrenCommunicationDelivery.splice(index, 1);
        } else {
            $scope.childrenCommunicationDelivery.push(childId);
        }
        //$scope.childrenCommunicationDelivery[id] = !$scope.childrenCommunicationDelivery[id]
        //}

    }

    $scope.detailOrCommunication = function (childId) {
        //se modalita' communication, modifico lista consegne e poi confermo
        //altrimenti openDetail(index)
        if ($scope.communicationExpanded) {
            $scope.switchChildrenDeliveryByID(childId)
        } else {
            $scope.openDetail(childId);
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
            profileService.getBabyProfileById($scope.schoolProfile.schoolId, $scope.section.children[i].childrenId).then(function (profile) {
                $scope.childrenProfiles.push(profile);
            });
            babyConfigurationService.getBabyConfigurationById($scope.schoolProfile.schoolId, $scope.section.children[i].childrenId).then(function (configuration) {
                $scope.childrenConfigurations.push(configuration);
            });
            babyConfigurationService.getBabyNotesById($scope.schoolProfile.schoolId, $scope.section.children[i].childrenId).then(function (notes) {
                $scope.childrenNotes.push(notes);
            });
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
            if (sectionService.getSection() == sectionId)
                return true;
            return false;
        } else {
            if (sectionService.getSection() == -1)
                return true;
            return false;
        }

    }
    $scope.changeSection = function (sectionId) {
        sectionService.setSection(sectionId);
        if (sectionId != 'all') {
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
    }
    $scope.openDetail = function (childId) {
        profileService.setCurrentBabyID(childId);
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
                if ($scope.section.children[i][periodOfTheDay].enabled) {
                    //totalNumber++;
                    $scope.childrenProfiles[periodOfTheDay].push($scope.section.children[i]);
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
                if ($scope.section.children[i][periodOfTheDay].enabled) {
                    //totalNumber++;
                    $scope.totalChildrenNumber[periodOfTheDay] ++;
                }
                if ($scope.section.children[i].exitTime != null && $scope.section.children[i].exitTime > Date.now() && $scope.section.children[i][periodOfTheDay].active) {
                    //totalNumber++;
                    $scope.availableChildren[periodOfTheDay] ++;
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
});
