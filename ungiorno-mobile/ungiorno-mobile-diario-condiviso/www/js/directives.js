angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.directives', [])

.directive('backImg', function () {
    return function (scope, element, attrs) {
        var url = attrs.backImg;
        var content = element.find('a');
        content.css({
            'background-image': 'url(' + url + ')',
            'background-size': 'cover'
        });
    };
})

.directive('coverImg', function () {
        return function (scope, element, attrs) {
            attrs.$observe('coverImg', function (value) {
                element.css({
                    'background-image': 'url(' + value + ')',
                    'background-size': 'cover'
                });
            });
        };
    })
    .directive('backImg', function () {
        return function (scope, element, attrs) {
            var url = attrs.backImg;
            element.css({
                'background-image': 'url(' + url + ')',
                'background-size': 'cover'
            });
        };
    })
    .directive('starRating', function () {
        return {
            restrict: 'A',
            template: '<ul class="rating">' +
                '<li ng-repeat="starType in stars track by $index" ng-click="toggle($index)">' +
                '<i class="icon vote-star" ng-class="{\'ion-android-star\': starType == \'full\', \'ion-android-star-half\': starType == \'half\', \'ion-android-star-outline\': starType == \'empty\'}"></i>' +
                '</li>' +
                '</ul>',
            scope: {
                ratingValue: '=',
                max: '=',
                onRatingSelected: '&',
                getRating: '&'
            },
            link: function (scope, elem, attrs) {
                var updateStars = function () {
                    scope.stars = scope.getRating();
                };

                scope.toggle = function (index) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                        rating: index + 1
                    });
                };

                scope.$watch('ratingValue', function (oldVal, newVal) {
                    /*if (newVal) {*/
                    updateStars();
                    /*}*/
                });
            }
        }
    })

.directive('babyPost', function () {
    return {
        restrict: 'E',
        templateUrl: "templates/babyPost.html",
        scope: {
            post: '=',
            baby: '=',
        },
        link: function (scope, elem, attrs) {
            scope.getBabyAgeString = function (birthday, postDate) {
                var difference = postDate - birthday;
                difference = new Date(difference * 1000);
                var toRtn = (difference.getFullYear() - 1970) + "a " +
                    difference.getMonth() + "m " +
                    difference.getDate() + "g";


                return toRtn;
            };
        }
    }
})

.directive('fabButton', function($document) {
    return {
        restrict: 'E',
        template: '<i class="icon stream fab-icon ion-android-add"></i>',
        scope: {
            attachedTo: "@"
        },
        link: function(scope, element, attrs) {
            var scrollView = angular.element(document.querySelector('#' + scope.attachedTo));
            element.addClass("button");
            element.addClass("stream");
            element.addClass("fab");

            var start = 0;
            var lastDirection = -1; //0 = bottom, 1 = top
            scrollView.bind('scroll', function(e) {
                if(e.detail.scrollTop > start) {
                    if (lastDirection !== 0) {
                        element.addClass("hidden");
                        //element.style.display = "hidden";
                    }
                    lastDirection = 0;
                } else if (e.detail.scrollTop < start){
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

.directive('autocompleteTags', function($document, $ionicModal) {
    return {
        restrict: 'E',
        template: '<label class="item item-input post-create-element"><input type="text" ng-model="tagsInserted" ng-change="inputChanged()"></input></label>',
        scope: {
            tags: "=",
        },
        link: function(scope, element, attrs) {
            //This is not working! Work in progress!
            var alreadyOpen = false;
            var tagsModal;

            scope.tagsa = ["Gruppo", "Giovane", "Bambino"];

            scope.inputChanged = function () {
                console.log(scope.tagsInserted);
                if (!alreadyOpen) {
                    tagsModal.show();
                }
                alreadyOpen = true;
            }

            $ionicModal.fromTemplateUrl('templates/tagsModal.html', {
                scope: scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                tagsModal = modal;
            })


        }
    }
});
