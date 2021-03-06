angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.controllers.home', [])


.controller('HomeCtrl', function ($scope, $filter, $rootScope, $ionicModal, $cordovaCamera, $ionicPopover, $ionicLoading, $state, galleryService, profileService, Toast, dataServerService, $ionicPopup, ionicDatePicker, $ionicHistory, $ionicScrollDelegate) {

    /* START IONIC DATEPICKER */
    $scope.date = new Date();
    /*console.log($scope.date);*/
    $scope.dateFormat = $filter('date')('yyyy-MM-dd');
    $rootScope.babyNum = 0;
    var isloaded = false;
    var dataloading = false;
    $scope.baby = {};
    $scope.posts = [];
    $scope.scrollViewStyle = {
        "height": "100%"
    };

    $scope.noMoreEntriesAvailable = false;
    var ipObj1 = {
        callback: function (val) { //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            datePickerCallback(val);
        },
        disabledDates: [],
        weeksList: ["L", "M", "M", "G", "V", "S", "D"],
        monthsList: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        setLabel: 'Conferma',
        closeLabel: 'Chiudi',
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
            $scope.date = val;
        }
    };



    /* END IONIC DATEPICKER */

    /*if (!dataServerService.userIsLogged()) {
        $state.go('app.login');
        return;
    }*/

    $scope.loadMore = function () {
        if ($scope.baby && $scope.baby.schoolId && $scope.baby.kidId && !dataloading) {
            $ionicLoading.show();

            dataloading = true;
            var length = 0;
            if ($scope.posts) {
                length = $scope.posts.length;
            }
            dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd), length).then(function (posts) {
                if ($scope.posts) {
                    //if post = [] first load. If no post for todayEnd => toast
                    if ($scope.posts.length == 0) {
                        var noPostForDate = true;
                        for (var i = 0; i < posts.length; i++) {
                            // Iterate over numeric indexes from 0 to 5, as everyone expects.
                            if (new Date(posts[i].date).setHours(23, 59, 59, 99) == new Date(todayEnd).setHours(23, 59, 59, 99)) {
                                noPostForDate = false;
                                break;
                            }
                        }
                        if (noPostForDate && $scope.calendarOpen) {
                            Toast.show($filter('translate')("no_messages"), "short", "bottom");
                        }
                    }
                    $scope.posts.push.apply($scope.posts, posts);
                    if (posts.length < 10) {
                        $scope.noMoreEntriesAvailable = true;
                    }
                } else {
                    $scope.posts = posts;

                }
                if ($scope.posts.length == 0) {
                    $scope.posts = null;
                    //                    if ($scope.calendarOpen) {
                    //                        Toast.show($filter('translate')("no_messages"), "short", "bottom");
                    //                    }
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $ionicLoading.hide();
                dataloading = false;

            }, function (reason) {
                $ionicLoading.hide();
                Toast.show($filter('translate')("communication_error"), "short", "bottom");
                $scope.noMoreEntriesAvailable = true;
                $scope.post = null;
                dataloading = false;
            })
        };

    }
    var getPersonRelation = function (person) {
        var personRelation = person.relation;
        if (!personRelation) {
            if (person.parent) {
                personRelation = $filter('translate')('parent')
            } else if (person.teacher) {
                personRelation = $filter('translate')('teacher')

            }
        }
        return personRelation;
    }
    var savePersonProfiles = function (data) {
        $rootScope.personsProfiles = [];
        if (data.persons) {
            for (var i = 0; i < data.persons.length; i++) {
                var personRelation = getPersonRelation(data.persons[i]);
                //                if (!personRelation) {
                //                    if (data.persons[i].parent) {
                //                        $filter('translate')('parent')
                //                    }
                //                    if (data.persons[i].teacher) {
                //                        $filter('translate')('teacher')
                //
                //                    }
                //                }
                $rootScope.personsProfiles[data.persons[i].personId] = {
                    name: data.persons[i].firstName,
                    relation: personRelation
                }
            }
        }
    }

    var init = function () {
        profileService.init().then(function () {
            $ionicLoading.show();
            $rootScope.kidProfiles = profileService.getAllBabyProfiles();
            $rootScope.babyNum = Object.keys($rootScope.kidProfiles).length;
            /*console.log($scope.babyNum);*/
            /*console.log("kidprofiles");console.log($rootScope.kidProfiles);*/
            profileService.getCurrentBaby().then(function (data) {
                savePersonProfiles(data);
                if ($rootScope.selectedKid) {
                    $scope.baby = data;
                    $scope.loadMore(); //used by infinite scroll
                    dataServerService.getTags($scope.baby.schoolId).then(function (data) {
                        $scope.tagsFromServer = data;
                    }, function (err) {
                        Toast.show($filter('translate')('get_tags_error'), 'short', 'bottom');
                        $ionicLoading.hide();

                    });
                }

            }, function (err) {
                $scope.baby = null;
                Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                $ionicLoading.hide();

            });
            isloaded = true;
        }, function (err) {
            Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
            $ionicLoading.hide();

        });
    }
    init();

    $rootScope.$watch('selectedKid', function (a, b) {
        if (b == null || a.kidId != b.kidId) {
            init();
        }
    });

    $scope.newPostModal;
    var photoSrcSelect;
    var editPostMode;
    var todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    $scope.today = new Date();
    $scope.calendarOpen = false;
    $scope.showCalButton = true;
    $scope.toggleCalendar = function () {
        $scope.calendarOpen = !$scope.calendarOpen;
        if ($scope.calendarOpen) {
            $scope.showCalButton = false; //set height of list in runtime
            setTimeout(function () {
                // $scope.scrollViewStyle.height = "100%";
                var totalHeight = document.getElementById('postsScrollView').clientHeight;
                var calendarHeight = document.getElementById('idCalendar').clientHeight;
                $scope.scrollViewStyle.height = totalHeight - calendarHeight + "px";
                $scope.$apply();
                //                $ionicScrollDelegate.$getByHandle('scroll-post').resize();
                // $ionicScrollDelegate.resize();
                //document.getElementById('idPosts').clientHeight = totalHeight - calendarHeight;
            }, 300);
        } else {
            $scope.changeToday($filter('date')(new Date(), 'yyyy-MM-dd'));
            setTimeout(function () {
                $scope.showCalButton = true;
                var totalHeight = document.getElementById('postsScrollView').clientHeight;
                var calendarHeight = document.getElementById('idCalendar').clientHeight;
                $scope.scrollViewStyle.height = totalHeight - calendarHeight + "px";
                $scope.$apply();
                //$ionicScrollDelegate.$getHandle('scroll-post').resize();

            }, 300);
        }
    }

    $scope.changeToday = function (today) {
        /*console.log(today);*/
        $scope.posts = [];
        $scope.noMoreEntriesAvailable = false;
        if (isloaded == true) {
            var from = today.split("-");
            todayEnd = new Date(from[0], from[1] - 1, from[2]);
            todayEnd.setHours(23, 59, 59, 999);
            console.log(todayEnd);
            $scope.loadMore(); //used by infinit scroll

        }
    }

    $scope.attachedTags = [];

    $ionicModal.fromTemplateUrl('templates/newPostModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.newPostModal = modal;
    })



    $scope.openCreatePost = function () {
        editPostMode = false;

        $scope.currentPost = {};
        $scope.currentPost.schoolId = $scope.baby.schoolId;
        $scope.currentPost.kidId = $scope.baby.kidId;

        $scope.currentPost.date = new Date();
        $scope.currentPost.text = "";
        $scope.currentPost.pictures = [];
        $scope.currentPost.tags = [];
        dataServerService.getTags($scope.baby.schoolId).then(function (data) {
            $scope.tagsFromServer = data;
            $scope.newPostModal.show();
        }, function (err) {
            Toast.show($filter('translate')('get_tags_error'), 'short', 'bottom');

        });
        //        $scope.tagsFromServer = [{
        //                "tagId": 1,
        //                "name": "Gioco"
        //        },
        //            {
        //                "tagId": 2,
        //                "name": "Gruppo"
        //        },
        //            {
        //                "tagId": 3,
        //                "name": "Parco"
        //        },
        //            {
        //                "tagId": 4,
        //                "name": "Amici"
        //        },
        //            {
        //                "tagId": 5,
        //                "name": "Merenda"
        //        },
        //            {
        //                "tagId": 6,
        //                "name": "Giardino"
        //        }];
        $scope.currentPost.authorId = profileService.getMyProfileID();

        //$scope.setMood(0);

    }
    $scope.cancel = function () {
        $scope.newPostModal.hide();
    }

    function checkPostEntries() {
        if ($scope.currentPost.text.length == 0) {
            Toast.show($filter('translate')('add_post_empty_text'), 'short', 'bottom');
            return false;
        }

        return true;

    }

    $scope.save = function () { //function called when a new post is submitted and also when a post is edited
        //add check params and return true or false if all data are correct
        //        var timeInMilisecond = $scope.currentPost.date.getTime();
        //        $scope.currentPost.date = timeInMilisecond;
        if (checkPostEntries()) {
            $ionicLoading.show();
            dataServerService.addPost($scope.baby.schoolId, $scope.baby.kidId, $scope.currentPost).then(
                function (posts) {
                    //$scope.posts = posts;
                    //update post
                    $ionicLoading.show();
                    dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd)).then(function (posts) {
                        $scope.posts = posts;
                        $ionicLoading.hide();
                    }, function (err) {
                        Toast.show($filter('translate')('communication_error'), 'short', 'bottom');
                        $ionicLoading.hide();

                    });
                    $scope.newPostModal.hide();
                    $ionicLoading.hide();
                    Toast.show($filter('translate')('add_post_done'), 'short', 'bottom');


                },
                function (err) {
                    console.log(err);
                    $ionicLoading.hide();
                    Toast.show($filter('translate')('add_post_error'), 'short', 'bottom');

                }
            );
        }
    }

    $scope.setMood = function (moodCode) {
        if ($scope.currentPost.mood == moodCode) $scope.currentPost.mood = 0;
        else $scope.currentPost.mood = moodCode;
    }

    $scope.addPhoto = function ($event, photoSrc) {

        if (photoSrc === undefined) {
            //Maybe is better a ActionSheet? http://codepen.io/mhartington/pen/KwBpRq
            photoSrcSelect = $ionicPopup.show({
                title: 'Aggiungi foto',
                scope: $scope,
                buttons: [
                    {
                        text: $filter('translate')('add_pic_gallery'),
                        type: 'button-add-picture',
                        onTap: function (e) {
                            return $scope.addPhoto($event, 'Gallery')
                        }

                      },
                    {
                        text: $filter('translate')('add_pic_camera'),
                        type: 'button-add-picture',
                        onTap: function (e) {
                            return $scope.addPhoto($event, 'Camera')
                        }
                    }
                                    ]
            });


        } else {
            if (photoSrcSelect !== undefined) {
                photoSrcSelect.close();
            }
            var options = {};

            if (photoSrc === 'Camera') {
                options = {
                    quality: 25,
                    //destinationType: Camera.DestinationType.DATA_URL,
                    destinationType: Camera.DestinationType.FILE_URI,
                    // In this app, dynamically set the picture source, Camera or photo gallery
                    sourceType: Camera.PictureSourceType.CAMERA,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.PICTURE,
                    allowEdit: false,
                    correctOrientation: true //Corrects Android orientation quirks
                }
            } else {
                options = {
                    quality: 25,
                    //destinationType: Camera.DestinationType.DATA_URL,
                    destinationType: Camera.DestinationType.FILE_URI,

                    // In this app, dynamically set the picture source, Camera or photo gallery
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.PICTURE,
                    allowEdit: false,
                    correctOrientation: true //Corrects Android orientation quirks
                }
            }


            $cordovaCamera.getPicture(options).then(function (imageData) {
                var image;
                // image = "data:image/jpeg;base64," + imageData;
                image = imageData;
                if ($scope.currentPost) {
                    if (!$scope.currentPost.pictures) {
                        $scope.currentPost.pictures = [];
                    }
                    $scope.currentPost.pictures.push(image);
                }
                if (!$scope.imageBase64) {
                    $scope.imageBase64 = [];
                }
                $scope.imageBase64.push(imageData);

            }, function (err) {
                console.log(err);
            });
        }
    }
    $scope.add = function (tag) {
        $scope.currentPost.tags.push(tag);
    }
    $scope.removeTag = function (tag) {
        $scope.currentPost.tags.splice($scope.currentPost.tags.indexOf(tag), 1);
    }
    $scope.removePhoto = function (index) {
        $scope.currentPost.pictures.splice(index, 1);
    }

    $scope.openEditPost = function (post) {
        editPostMode = true;

        $scope.currentPost = {};
        $scope.currentPost.schoolId = $scope.baby.schoolId;
        $scope.currentPost.entryId = post.entryId;
        $scope.currentPost.kidId = $scope.baby.kidId;
        $scope.currentPost.date = new Date(post.date);
        $scope.date = $scope.currentPost.date;
        $scope.currentPost.text = post.text;
        $scope.currentPost.pictures = post.pictures;
        $scope.currentPost.tags = post.tags;
        $scope.currentPost.authorId = profileService.getMyProfileID();
        // $scope.setMood(post.mood);
        $scope.newPostModal.show();
    }

    $scope.removePost = function (post) {
        photoSrcSelect = $ionicPopup.show({
            title: $filter('translate')('delete_title'),
            scope: $scope,
            buttons: [
                {

                    text: $filter('translate')('delete_cancel'),
                    type: 'button-add-picture',


                      },
                {
                    text: $filter('translate')('delete_confirm'),
                    type: 'button-add-picture',
                    onTap: function (e) {
                        $ionicLoading.show();
                        dataServerService.removePost($scope.baby.schoolId, $scope.baby.kidId, post.entryId).then(function (posts) {
                            dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0, Date.parse(todayEnd), length).then(function (posts) {

                                //dataServerService.getPostsByBabyId($scope.baby.schoolId, $scope.baby.kidId, 0,Date.parse(endDate), length).then(function (posts) {
                                $scope.posts = posts;
                                $ionicLoading.hide();
                                Toast.show($filter('translate')('delete_done'), 'short', 'bottom');

                            }, function (err) {
                                $ionicLoading.hide();
                                Toast.show($filter('translate')('delete_error'), 'short', 'bottom');
                            });
                        }, function (err) {
                            $ionicLoading.hide();
                            Toast.show($filter('translate')('error_popup_title'), 'short', 'bottom');
                        });
                    }
                    }
                                    ]
        });

    }
    $scope.tagName = "";
    $scope.sharePost = function (post) {
        //TODO: have to define what to share
    }
    var selectTag = function (selectTag) {
        $scope.currentPost.tags.push(suggestion);
        $scope.searchParam = '';
        $scope['tags'] = [];
    }

    $scope.changeString = function (suggestion) {
        $scope.currentPost.tags.push(suggestion);
        $scope.searchParam = '';
        $scope['tags'] = [];
        //        console.log("changestringfrom");
        //        $scope.place = 'from';
        //        planService.setPosition($scope.place, $scope.placesandcoordinates[suggestion].latlong.split(',')[0], $scope.placesandcoordinates[suggestion].latlong.split(',')[1]);
        //        planService.setName($scope.place, suggestion);
        //        for (var i = 0; i < $scope.favoritePlaces.length; i++) {
        //            if ($scope.favoritePlaces[i].name == suggestion) {
        //                $scope.favoriteFrom = true;
        //                break;
        //            }
        //        }

        // selectTag(suggestion);
    };
    $scope.typeTag = function (typedthings) {
        //        if (($scope.placesandcoordinates && $scope.placesandcoordinates[typedthings] == null) || typedthings == '' || $scope.placesandcoordinates == null) {
        //            $scope.planParams[fromOrTo] = {
        //                name: '',
        //                lat: '',
        //                long: ''
        //            }
        //            if (fromOrTo == 'from')
        //                $scope.favoriteFrom = false;
        //            $scope.favoriteTo = false;
        //        };

        $scope.result = typedthings;

        dataServerService.getTags($scope.baby.schoolId).then(function (data) {
            $scope['tags'] = [];
            $scope.placesandcoordinates = [];
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name.toLowerCase().indexOf(typedthings.toLowerCase()) > -1) {
                        $scope['tags'].push(data[i].name);
                        $scope.placesandcoordinates.push(data[i].name);
                    }
                }
            } else {
                $scope['tags'] = null;
                $scope.placesandcoordinates = null;
            }
        });
    };

});
