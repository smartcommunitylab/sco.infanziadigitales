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
