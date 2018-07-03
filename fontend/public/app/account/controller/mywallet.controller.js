'use strict';
angular.module('shopnxApp').controller('MywalletCtrl', function($scope, Auth, $location, Product, $rootScope) {
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    Auth.isLoggedInAsync(function(cb) {
        if (!cb) {
            $location.path('/dang-nhap.html');
        } else {
            $scope.listhistorysell = {};
            $scope.session = {};
            $scope.urlHistoryPage = '/api/products/GetHistorySellById/' + Auth.getCurrentUser()._id;
            $scope.session = {
                numk: Auth.getCurrentUser().k_number,
                history_oder: Auth.getCurrentUser().history_oder,
                history_transfer: Auth.getCurrentUser().history_transfer,
                history_topup: Auth.getCurrentUser().history_topup,
                _id: Auth.getCurrentUser()._id,
            };
            $scope.MsgNull = false;
            Product.GetHistorySellById.query({
                id: Auth.getCurrentUser()._id
            }).$promise.then(function(result) {
                $scope.listhistorysell = result;
            }).catch(function(err) {
                if (err.data.count == 0) {
                    $scope.MsgNull = true;
                }
            });
        }
    });
});