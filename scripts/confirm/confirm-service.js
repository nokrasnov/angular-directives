'use strict';

App.service('confirm', ['$q', '$rootScope',
    function($q, $rootScope) {
        var self = this;

        var confirmDfd;

        self.open = function(confirmDialogTextHeader, confirmDialogTextBody) {
            confirmDfd = $q.defer();

            showConfirmDialog(confirmDialogTextHeader, confirmDialogTextBody);

            return confirmDfd.promise;
        };

        self.accept = function() {
            confirmDfd.resolve();
        };

        self.reject = function() {
            confirmDfd.reject();
        };

        function showConfirmDialog(confirmDialogTextHeader, confirmDialogTextBody) {
            $rootScope.$broadcast('showConfirmDialog', confirmDialogTextHeader, confirmDialogTextBody);
        }
    }
]);
