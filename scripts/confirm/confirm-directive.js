'use strict';

App.directive("confirm", ['$rootScope',
    function($rootScope) {
        return {
            link: function($scope) {
                $rootScope.$on('showConfirmDialog', function(event, confirmDialogTextHeader, confirmDialogTextBody) {
                    $scope.showConfirmDialog(confirmDialogTextHeader, confirmDialogTextBody)
                });
                $rootScope.$on('hideConfirmDialog', $scope.hideConfirmDialog);
            },
            controller: ['$scope', 'confirm', function ($scope, confirm) {
                $scope.accept = function () {
                    $scope.hideConfirmDialog();
                    confirm.accept();
                };
                $scope.reject = function () {
                    $scope.hideConfirmDialog();
                    confirm.reject();
                };

                $scope.showConfirmDialog = function (confirmDialogTextHeader, confirmDialogTextBody) {
                    $scope.isShowConfirmDialog = true;
                    $scope.confirmDialogTextHeader = confirmDialogTextHeader;
                    $scope.confirmDialogTextBody = confirmDialogTextBody;
                };
                $scope.hideConfirmDialog = function () {
                    $scope.isShowConfirmDialog = false;
                };
            }],
            restrict: 'AE',
            replace: true,
            template: "<div ng-show='isShowConfirmDialog' class='confirm-dialog'>" +
                            "<div class='confirm-dialog-container'>" +
                                "<div class='confirm-dialog-text-header'>" +
                                    "{{confirmDialogTextHeader}}" +
                                "</div>" +
                                "<div class='confirm-dialog-text-body'>" +
                                    "{{confirmDialogTextBody}}" +
                                "</div>" +
                                "<div class='confirm-dialog-buttons'>" +
                                    "<button class='confirm-dialog-btn' ng-click='accept()'>Yes</button> <button class='confirm-dialog-btn' ng-click='reject()'>No</button>" +
                                "</div>" +
                            "</div>" +
                        "</div>"
        }
    }
]);