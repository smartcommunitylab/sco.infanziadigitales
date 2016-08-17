angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.directives', [])

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
    .directive('ionMdInput', function () {
        return {
            restrict: 'E',
            replace: true,
            require: '?ngModel',
            template: '<label class="item item-input item-md-label">' +
                '<input type="text">' +
                '<span class="input-label"></span>' +
                '<div class="hightlight"></div>' +
                '</label>',
            compile: function (element, attr) {

                var hightlight = element[0].querySelector('.hightlight');
                var hightlightColor;
                console.log(hightlight);

                if (!attr.hightlightColor) {
                    hightlightColor = 'calm';
                } else {
                    hightlightColor = attr.hightlightColor;
                }

                console.log(hightlightColor);
                hightlight.className += ' hightlight-' + hightlightColor;

                var label = element.find('span');
                label.html(attr.placeholder);

                var input = element.find('input');
                input.bind('blur', function () {
                    if (input.val())
                        input.addClass('used');
                    else
                        input.removeClass('used');
                });
                angular.forEach({
                    'name': attr.name,
                    'type': attr.type,
                    'ng-value': attr.ngValue,
                    'ng-model': attr.ngModel,
                    'required': attr.required,
                    'ng-required': attr.ngRequired,
                    'ng-minlength': attr.ngMinlength,
                    'ng-maxlength': attr.ngMaxlength,
                    'ng-pattern': attr.ngPattern,
                    'ng-change': attr.ngChange,
                    'ng-trim': attr.trim,
                    'ng-blur': attr.ngBlur,
                    'ng-focus': attr.ngFocus,
                }, function (value, name) {
                    if (angular.isDefined(value)) {
                        input.attr(name, value);
                    }
                });
                var cleanUp = function () {
                    ionic.off('$destroy', cleanUp, element[0]);
                };
                ionic.on('$destroy', cleanUp, element[0]);
            }
        };
    }).filter('reverse', function () {
        return function (items) {
            return items.slice().reverse();
        };
    });
//    .directive('preventDrag', function ($ionicGesture, $ionicSlideBoxDelegate) {
//        return {
//            restrict: 'A',
//
//            link: function (scope, elem, attrs, e) {
//                var reportEvent = function (e) {
//
//                    if (e.target.tagName.toLowerCase() == 'div') {
//                        $ionicSlideBoxDelegate.enableSlide(false);
//                    } else {
//                        $ionicSlideBoxDelegate.enableSlide(true);
//                    }
//                };
//
//
//                $ionicGesture.on('drag', reportEvent, elem);
//            }
//        };
//    })
//;
