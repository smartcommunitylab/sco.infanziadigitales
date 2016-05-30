angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.directives', [])

//.directive('backImg', function () {
//    return function (scope, element, attrs) {
//        var url = attrs.backImg;
//        var content = element.find('a');
//        content.css({
//            'background-image': 'url(' + url + ')',
//            'background-size': 'cover'
//        });
//    };
//})
//
//.directive('coverImg', function () {
//        return function (scope, element, attrs) {
//            attrs.$observe('coverImg', function (value) {
//                element.css({
//                    'background-image': 'url(' + value + ')',
//                    'background-size': 'cover'
//                });
//            });
//        };
//    })
//    .directive('backImg', function () {
//        return function (scope, element, attrs) {
//            var url = attrs.backImg;
//            element.css({
//                'background-image': 'url(' + url + ')',
//                'background-size': 'cover'
//            });
//        };
//    })
//    .directive('starRating', function () {
//        return {
//            restrict: 'A',
//            template: '<ul class="rating">' +
//                '<li ng-repeat="starType in stars track by $index" ng-click="toggle($index)">' +
//                '<i class="icon vote-star" ng-class="{\'ion-android-star\': starType == \'full\', \'ion-android-star-half\': starType == \'half\', \'ion-android-star-outline\': starType == \'empty\'}"></i>' +
//                '</li>' +
//                '</ul>',
//            scope: {
//                ratingValue: '=',
//                max: '=',
//                onRatingSelected: '&',
//                getRating: '&'
//            },
//            link: function (scope, elem, attrs) {
//                var updateStars = function () {
//                    scope.stars = scope.getRating();
//                };
//
//                scope.toggle = function (index) {
//                    scope.ratingValue = index + 1;
//                    scope.onRatingSelected({
//                        rating: index + 1
//                    });
//                };
//
//                scope.$watch('ratingValue', function (oldVal, newVal) {
//                    /*if (newVal) {*/
//                    updateStars();
//                    /*}*/
//                });
//            }
//        }
//    })

.directive('babyPost', function (galleryService, $state) {
    return {
        restrict: 'E',
        templateUrl: "templates/babyPost.html",
        scope: {
            post: '=',
            baby: '=',
            shareCallback: '&',
            removeCallback: '&',
            editCallback: '&'
        },
        link: function (scope, elem, attrs) {
            scope.getBabyAgeString = function (birthday, postDate) {
                var difference = postDate - birthday;
                difference = new Date(difference);
                var toRtn = (difference.getFullYear() - 1970) + "a " +
                    difference.getMonth() + "m " +
                    difference.getDate() + "g";


                return toRtn;
            };

            scope.viewPhotos = function (photos, index) {
                galleryService.setSelectedGallery(photos, index);
                $state.go("app.postgallery");
            }

            scope.shareCallback = scope.shareCallback();
            scope.editCallback = scope.editCallback();
            scope.removeCallback = scope.removeCallback();

            scope.editPost = function (post) {
                scope.editCallback(post);
            }
            scope.removePost = function (post) {
                scope.removeCallback(post);
            }
            scope.sharePost = function (post) {
                scope.shareCallback();
            }

        }
    }
})

//.directive("myDirective", function() {
//
//    return {
//        restrict: "E",
//        scope: {
//            callback: "&"
//        },
//        template: "<div style='width: 200px; height: 200px; background-color: black;' ng-click='callCallback()'></div>", // call function this way...
//        link: function(scope, element, attrs) {
//            // unwrap the function
//            scope.callback = scope.callback();
//
//            scope.data = "data from somewhere";
//
//            scope.callCallback = function() {
//                scope.callback(scope.data);
//            }
//        }
//    }
//})

.directive('fabButton', function ($document) {
    return {
        restrict: 'E',
        template: '<i class="icon stream fab-icon ion-android-add"></i>',
        scope: {
            attachedTo: "@"
        },
        link: function (scope, element, attrs) {
            var scrollView = angular.element(document.querySelector('#' + scope.attachedTo));
            element.addClass("button");
            element.addClass("stream");
            element.addClass("fab");

            var start = 0;
            var lastDirection = -1; //0 = bottom, 1 = top
            scrollView.bind('scroll', function (e) {
                if (e.detail.scrollTop > start) {
                    if (lastDirection !== 0) {
                        element.addClass("hidden");
                        //element.style.display = "hidden";
                    }
                    lastDirection = 0;
                } else if (e.detail.scrollTop < start) {
                    if (lastDirection !== 1) {
                        element.removeClass("hidden");
                    }
                    lastDirection = 1;
                }
                start = e.detail.scrollTop;
            });
        }
    }
})

.directive('autocompleteTags', function ($document, $ionicPopover, dataServerService, $ionicPopup, $filter) {
    return {
        restrict: 'E',
        templateUrl: 'templates/autocompleteTags.html',
        scope: {
            tags: "=",
            attachedTags: "="
        },
        link: function (scope, element, attrs) {
            //This is not working! Work in progress!
            var alreadyOpen = false;
            var tagsPopover;

            var inputTagsFilter = function (value) {
                var lastTag = scope.tagsInserted.split(",");
                lastTag = scope.tagsInserted.trim().toLowerCase();
                return value.value.toLowerCase().indexOf(lastTag) > -1;


            }

            scope.completeTag = function (index) {
                if (scope.attachedTags.indexOf(scope.tags[index]) === -1) { //check if tag is already added
                    scope.attachedTags.push(scope.tags[index].name);
                }
                scope.tagsInserted = "";
                scope.filteredTags = scope.tags.slice(); //workaround for a bug on android, after adding a tag the input text is empty but the tagsInserted is badly filtered
                scope.closePopover();
            }

            scope.removeTag = function (tag) {
                scope.attachedTags.splice(scope.attachedTags.indexOf(tag), 1);
            }


            if (scope.tags) {
                scope.filteredTags = scope.tags.slice();
            }


            scope.inputChanged = function ($event) {
                if (!alreadyOpen) {
                    scope.openPopover($event);
                    alreadyOpen = true;
                }
                scope.filteredTags = scope.tags.filter(inputTagsFilter);
            }

            scope.addTag = function (name) {
                var addTagPopup = $ionicPopup.confirm({
                    title: $filter('translate')('add_tag_title'),
                    template: name + ' ' + $filter('translate')('add_tag_description'),
                    okType: 'button-add-picture',
                });
                addTagPopup.then(function (result) {
                    if (result) {
                        //TODO: add tag to the server list of tags, right now it adds tag to the object
                        scope.closePopover();
                        //scope.tagsInserted = name;
                        //                        var newTag = {
                        //                            name: name,
                        //                            tagId: name
                        //                        }
                        scope.filteredTags.push(name);
                        scope.attachedTags.push(name);
                        scope.filteredTags = scope.tags.slice(); //workaround for a bug on android, after adding a tag the input text is empty but the tagsInserted is badly filtered
                    } else {}
                });
            }


            $ionicPopover.fromTemplateUrl('templates/tagsPopup.html', {
                scope: scope
            }).then(function (popover) {
                tagsPopover = popover;
            });

            scope.openPopover = function ($event) {
                tagsPopover.show($event);
            };
            scope.closePopover = function () {
                tagsPopover.hide();
                alreadyOpen = false;
            };


        }
    }
});
