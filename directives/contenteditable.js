'use strict';

App.directive('contenteditable', ['$sce', function($sce) {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$apply(function() {
                    ngModel.$setViewValue(element.html());
                });
            });

            // model -> view
            ngModel.$render = function() {
                element.html(ngModel.$viewValue);
            };

            // load init value from DOM
            //ngModel.$setViewValue(element.html());
        }
    };
}]);