'use strict';

App.directive('touchStart', ['$parse', '$timeout', function ($parse, $timeout) {
    return function (scope, element, attrs) {
        element.bind("touchstart mousedown", function (event) {
            //event.preventDefault();
            var fn = $parse(attrs['touchStart']);
            scope.$apply(function() {
                $timeout(function() {
                    fn(scope, {$event: event});
                });
            });
        });
    };
}]);