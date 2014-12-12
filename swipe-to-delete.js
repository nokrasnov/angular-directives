'use strict';

App.directive('swipeToDelete', ['$parse', function($parse){
    var tapping = false, startX, startY, lastDeltaX = 0, deltaX = 0, deltaY = 0, parentWidth, isSwiping = false;
    function isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }

    function start(event, scope, element, attrs) {
        lastDeltaX = 0; deltaX = 0; deltaY = 0;
        if (event.touches) {
            startX = event.touches[0].screenX;
            startY = event.touches[0].screenY;
        } else {
            startX = event.screenX;
            startY = event.screenY;
        }
        element.css('-webkit-transition-duration', '0');
        element.css('transition-duration', '0');
        parentWidth = element.parent()[0].offsetWidth;
        tapping = true;
        isSwiping = false;
    }

    function move(event, scope, element, attrs) {
        if (isSwiping) event.preventDefault();
        if (tapping) {
            if (event.touches) {
                deltaX = event.touches[0].screenX - startX;
                deltaY = event.touches[0].screenY - startY;
                if (!isSwiping && (Math.abs(deltaX) > Math.abs(deltaY))) {
                    event.preventDefault(); // android 4.4 fire touchcancel if scroll
                    isSwiping = true;
                }
            } else {
                deltaX = event.screenX - startX;
                deltaY = event.screenY - startY;
            }

            if (Math.abs(lastDeltaX - deltaX) >= 2) {
                element.css('opacity', 1 - Math.abs(deltaX)/parentWidth);
                element.css('left', deltaX + 'px');
            }
            lastDeltaX = deltaX;
        }
    }

    function end(scope, element, attrs, event) {
        if (tapping) {
            tapping = false;

            element.css('-webkit-transition-duration', '250ms');
            element.css('transition-duration', '250ms');
            if (deltaX > parentWidth/2) {
                element.css('left', 1500 + 'px');
                element.css('opacity', 0);
                var fn = $parse(attrs['swipeToDelete']);
                scope.$apply(function() {
                    fn(scope, {$event: event});
                });
            } else {
                element.css('left', 0 + 'px');
                element.css('opacity', 1);
            }

            lastDeltaX = 0; deltaX = 0; deltaY = 0;
            isSwiping = false;
        }
    }

    function link(scope, element, attrs){
        if (isTouchDevice()) {
            element.on('touchstart', function(event) {
                start(event, scope, element, attrs);
            });
            element.on('touchmove', function(event) {
                move(event, scope, element, attrs);
            });
            element.on('touchend touchcancel', function(event) {
                end(scope, element, attrs, event);
            });
        } else {
            element.on('mousedown', function(event) {
                start(event, scope, element, attrs);
            });
            element.on('mousemove', function(event) {
                move(event, scope, element, attrs);
            });
            element.on('mouseup', function(event) {
                end(scope, element, attrs, event);
            });
        }
    }

    return {
        link: link,
        restrict: 'A'
    };
}]);