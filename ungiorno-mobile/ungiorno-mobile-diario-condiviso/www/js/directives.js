angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.directives', [])

.directive('placeautocomplete', function () {
        var index = -1;

        return {
            restrict: 'E',
            scope: {
                searchParam: '=ngModel',
                suggestions: '=data',
                onType: '=onType',
                onSelect: '=onSelect',
                placeautocompleteRequired: '='
            },
            controller: [
            '$scope',
            function ($scope) {
                    // the index of the suggestions that's currently selected
                    $scope.selectedIndex = -1;

                    $scope.initLock = true;

                    // set new index
                    $scope.setIndex = function (i) {
                        $scope.selectedIndex = parseInt(i);
                    };

                    this.setIndex = function (i) {
                        $scope.setIndex(i);
                        $scope.$apply();
                    };

                    $scope.getIndex = function (i) {
                        return $scope.selectedIndex;
                    };

                    $scope.clear = function () {
                        $scope.searchParam = '';
                    };

                    // watches if the parameter filter should be changed
                    var watching = true;

                    // autocompleting drop down on/off
                    $scope.completing = false;

                    // starts autocompleting on typing in something
                    $scope.$watch('searchParam', function (newValue, oldValue) {
                        if (oldValue === newValue || (!oldValue && $scope.initLock)) {
                            return;
                        }

                        if (watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
                            $scope.completing = true;
                            $scope.searchFilter = $scope.searchParam;
                            $scope.selectedIndex = -1;
                        }

                        // function thats passed to on-type attribute gets executed
                        if ($scope.onType) {
                            $scope.onType($scope.searchParam);
                        }
                    });

                    // for hovering over suggestions
                    this.preSelect = function (suggestion) {
                        watching = false;

                        // this line determines if it is shown
                        // in the input field before it's selected:
                        //$scope.searchParam = suggestion;

                        $scope.$apply();
                        watching = true;
                    };

                    $scope.preSelect = this.preSelect;

                    this.preSelectOff = function () {
                        watching = true;
                    };

                    $scope.preSelectOff = this.preSelectOff;

                    // selecting a suggestion with RIGHT ARROW or ENTER
                    $scope.select = function (suggestion) {
                        if (suggestion) {
                            $scope.searchParam = suggestion;
                            $scope.searchFilter = suggestion;
                            if ($scope.onSelect) {
                                $scope.onSelect(suggestion);
                                $scope.clear();
                            }
                        }
                        watching = false;
                        $scope.completing = false;
                        setTimeout(function () {
                            watching = true;
                        }, 1000);
                        $scope.setIndex(-1);
                    };
            }
        ],
            link: function (scope, element, attrs) {
                setTimeout(function () {
                    scope.initLock = false;
                    scope.$apply();
                }, 250);

                var attr = '';

                // Default atts
                scope.attrs = {
                    "placeholder": "start typing...",
                    "class": "",
                    "id": "",
                    "inputclass": "",
                    "inputid": ""
                };

                for (var a in attrs) {
                    attr = a.replace('attr', '').toLowerCase();
                    // add attribute overriding defaults
                    // and preventing duplication
                    if (a.indexOf('attr') === 0) {
                        scope.attrs[attr] = attrs[a];
                    }
                }

                if (attrs.clickActivation) {
                    element[0].onclick = function (e) {
                        if (!scope.searchParam) {
                            setTimeout(function () {
                                scope.completing = true;
                                scope.$apply();
                            }, 200);
                        }
                    };
                }

                var key = {
                    left: 37,
                    up: 38,
                    right: 39,
                    down: 40,
                    enter: 13,
                    esc: 27,
                    tab: 9
                };

                document.addEventListener("keydown", function (e) {
                    var keycode = e.keyCode || e.which;

                    switch (keycode) {
                    case key.esc:
                        // disable suggestions on escape
                        scope.select();
                        scope.setIndex(-1);
                        scope.$apply();
                        e.preventDefault();
                    }
                }, true);

                document.addEventListener("blur", function (e) {
                    // disable suggestions on blur
                    // we do a timeout to prevent hiding it before a click event is registered
                    setTimeout(function () {
                        scope.select();
                        scope.setIndex(-1);
                        scope.$apply();
                    }, 150);
                }, true);

                element[0].addEventListener("keydown", function (e) {
                    var keycode = e.keyCode || e.which;

                    var l = angular.element(this).find('li').length;

                    // this allows submitting forms by pressing Enter in the autocompleted field
                    if (!scope.completing || l == 0) return;

                    // implementation of the up and down movement in the list of suggestions
                    switch (keycode) {
                    case key.up:
                        index = scope.getIndex() - 1;
                        if (index < -1) {
                            index = l - 1;
                        } else if (index >= l) {
                            index = -1;
                            scope.setIndex(index);
                            scope.preSelectOff();
                            break;
                        }
                        scope.setIndex(index);

                        if (index !== -1)
                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

                        scope.$apply();

                        break;
                    case key.down:
                        index = scope.getIndex() + 1;
                        if (index < -1) {
                            index = l - 1;
                        } else if (index >= l) {
                            index = -1;
                            scope.setIndex(index);
                            scope.preSelectOff();
                            scope.$apply();
                            break;
                        }
                        scope.setIndex(index);

                        if (index !== -1) {
                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());
                        }

                        break;
                    case key.left:
                        break;
                    case key.right:
                    case key.enter:
                    case key.tab:
                        index = scope.getIndex();
                        // scope.preSelectOff();
                        if (index !== -1) {
                            scope.select(angular.element(angular.element(this).find('li')[index]).text());
                            if (keycode == key.enter) {
                                e.preventDefault();
                            }
                        } else {
                            if (keycode == key.enter) {
                                scope.select();
                            }
                        }
                        scope.setIndex(-1);
                        scope.$apply();

                        break;
                    case key.esc:
                        // disable suggestions on escape
                        scope.select();
                        scope.setIndex(-1);
                        scope.$apply();
                        e.preventDefault();
                        break;
                    default:
                        return;
                    }
                });
            },
            template: '\
        <div class="placeautocomplete {{ attrs.class }}" ng-class="{ notempty: (searchParam.length > 0) }" id="{{ attrs.id }}">\
          <input\
            type="text"\
            ng-model="searchParam"\
            placeholder="{{ attrs.placeholder }}"\
            class="placeautocomplete-input {{ attrs.inputclass }}"\
            id="{{ attrs.inputid }}"\
            ng-required="{{ placeautocompleteRequired }}" />\
            <span ng-if="searchParam.length > 0" ng-click="select(searchParam)" class="tags-add">Aggiungi {{searchParam}}</span>\
          <ul ng-if="searchParam.length > 0" ng-show="completing && (suggestions).length > 0">\
            <li\
              suggestion\
              ng-repeat="suggestion in suggestions | orderBy:\'toString()\' track by $index"\
              index="{{ $index }}"\
              val="{{ suggestion }}"\
              class="suggestion suggestion-entry"\
              ng-class="{ active: ($index === selectedIndex) }"\
              ng-click="select(suggestion)"\
              ng-bind-html="suggestion | highlight:searchParam"></li>\
          </ul>\
        </div>'
        };
    })
    .filter('highlight', ['$sce', function ($sce) {
        return function (input, searchParam) {
            if (typeof input === 'function') return '';
            if (searchParam) {
                var words = '(' +
                    searchParam.split(/\ /).join(' |') + '|' +
                    searchParam.split(/\ /).join('|') +
                    ')',
                    exp = new RegExp(words, 'gi');
                if (words.length) {
                    input = input.replace(exp, "<span class=\"highlight\">$1</span>");
                }
            }
            return $sce.trustAsHtml(input);
        };
}])
    .directive('babyPost', function (galleryService, $state, $rootScope) {
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
                    var toRtn = (difference.getFullYear() - 1970) + " anni, " + difference.getMonth() + " mesi.";
                    return toRtn;
                };
                scope.getAuthor = function (post) {
                    var author = "";
                    //cat name and relation
                    if ($rootScope.personsProfiles[post.authorId].name) {
                        author += $rootScope.personsProfiles[post.authorId].name
                    }
                    if ($rootScope.personsProfiles[post.authorId].relation) {
                        author += ' - ' +
                            $$rootScope.personsProfiles[post.authorId].relation
                    }

                    return author;
                }
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
                if (scope.tags) {
                    scope.filteredTags = scope.tags.slice();
                }
                tagsPopover.show($event);
            };
            scope.closePopover = function () {
                tagsPopover.hide();
                alreadyOpen = false;
            };


        }
    }
});
