// 'use strict';
// angular
//     .module('shopnxApp')
//     .controller('TopUpCtrl', function (
//         $scope,
//         Auth,
//         $loading,
//         $location,
//         $http,
//         $mdDialog,
//         $window,
//         $rootScope
//     ) {
//         $rootScope.isPageProduct = false;
//         $rootScope.isHomePage    = false;
//         Auth.isLoggedInAsync(function (cb) {
//             if (!cb) {
//                 $location.path('/dang-nhap.html')
//             } else {

//                 $scope.topUpInfo = {
//                     provider: '0',
//                     amount: 10000,
//                 };

//                 var md = new MobileDetect(window.navigator.userAgent);
                
//                 $scope.doTheBack   = function () {
//                     window
//                         .history
//                         .back()
//                 };
//                 $scope.isMobile    = false;
//                 $scope.isnotMobile = true;
//                 if (md.mobile() != null) {
//                     $scope.isMobile    = true;
//                     $scope.isnotMobile = false
//                 }
//                 $scope.submitTopUp = function() {
//                     $loading.start('lazy-submit');
//                     $scope.is_requesting = true;
//                     if ($rootScope.getCurrentUser.k_number >= $scope.topUpInfo.amount / 1000) {
//                         $scope.topUpInfo.id = $rootScope.getCurrentUser._id;
//                         Auth.topUp($scope.topUpInfo)
//                         .then(function(result) {
//                             $loading.finish('lazy-submit');
//                             $scope.is_requesting = false;
//                             $mdDialog
//                                 .show($mdDialog.alert().clickOutsideToClose(false).htmlContent(
//                                     result.message_err ? result.message_err : 'Thành công.'
//                                 ).ok('Đồng ý'))
//                                 .then(function () {
//                                 });
//                         })
//                         .catch(function (err) {
//                             $loading.finish('lazy-submit');
//                             $scope.is_requesting = false;
//                             if (err.data && err.data.message_err) {
//                                 $mdDialog
//                                         .show($mdDialog.alert().clickOutsideToClose(false).htmlContent(
//                                             err.data.message_err
//                                         ).ok('Đồng ý'))
//                                         .then(function () {
//                                         });
//                             }
//                         });
//                     } else {
//                         $loading.finish('lazy-submit');
//                         $scope.is_requesting = false;
//                         $mdDialog
//                             .show($mdDialog.alert().clickOutsideToClose(false).htmlContent(
//                                 'Bạn không đủ số K để thực hiện giao dịch này.'
//                             ).ok('Đồng ý'))
//                             .then(function () {
//                             });
//                     }
                    
//                 }
//             }
//         })
//     });