'use strict';
angular.module('shopnxApp').controller('ManageBannerCtrl', function($scope, Auth, Banner, $rootScope, $location, $mdDialog) {
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    $rootScope.parmas = {
        home: false,
        waiting_result: false,
        restricted_area: false,
        customer_share: false,
        forum: false,
        help: false,
    };
    Auth.isLoggedInAsync(function(cb) {
        if (!cb) {
            $location.path('/dang-nhap.html');
        } else {
            $rootScope.isAdmin = Auth.isAdmin();
            if (!$rootScope.isAdmin) {
                $location.path('/dang-nhap.html');
            } else {
                $scope.banner = {};
                $scope.list_banner_slice = {};
                $scope.list_banner_right = {};
                $scope.list_banner_item = {};
                $scope.list_banner_limited = {};
                $scope.list_banner_guide = {};
                $scope.list_banner_guidemobile = {};
                $scope.urlBannerSlice = '/api/banner/getListSliceBanners';
                $scope.urlBannerRight = '/api/banner/getListBannerRights';
                $scope.urlBannerItem = '/api/banner/getListBannerItems';
                $scope.urlBannerLimited = '/api/banner/getListBannerLimited';
                $scope.urlBannerGuide = '/api/banner/getListGuideBanners';
                $scope.urlBannerGuideMobile = '/api/banner/getListGuideMobileBanners';
                $scope.ViewFormOpen = function() {
                    $scope.banner.type = 'slice';
                    $scope.banner.state = 1;
                    $scope.banner.name = '';
                    $scope.banner.image = '';
                    $scope.banner.link_href = '';
                    $scope.banner.sequence = 1;
                    $scope.isAddBanner = true;
                };
                $scope.CloseFormOpen = function() {
                    $scope.isAddBanner = false;
                };
                $scope.submit = function() {
                    Banner.addBanner.save($scope.banner).$promise.then(function(result) {
                        if (result.type === 'slice') $scope.reloadSlice = true;
                        else if (result.type === 'right') $scope.reloadRight = true;
                        else if (result.type === 'item') $scope.reloadItem = true;
                        else if (result.type === 'limited') $scope.reloadLimited = true;
                        else if (result.type === 'guide') $scope.reloadGuide = true;
                        else if (result.type === 'guidemobile') $scope.reloadGuideMobile = true;
                        $scope.isAddBanner = false;
                    }).catch(function(err) {});
                };
                $scope.RemoveBanner = function(id) {
                    var confirm = $mdDialog.confirm().title('Bạn có muốn xóa banner này?').targetEvent(id).ok('Xóa').cancel('Hủy');
                    $mdDialog.show(confirm).then(function() {
                        Banner.removeBanner.remove({
                            id: id
                        }).$promise.then(function(result) {
                            if ($scope.list_banner_slice.results.length === 1) {
                                $scope.goto($scope.page > 0 ? $scope.page - 1 : 0);
                            }
                            if (result.type === 'slice') $scope.reloadSlice = true;
                            else if (result.type === 'right') $scope.reloadRight = true;
                            else if (result.type === 'item') $scope.reloadItem = true;
                            else if (result.type === 'limited') $scope.reloadLimited = true;
                            else if (result.type === 'guide') $scope.reloadGuide = true;
                            else if (result.type === 'guidemobile') $scope.reloadGuideMobile = true;
                        }).catch(function(err) {});
                    }, function() {});
                };
            }
        }
    });
}).controller('BannerBySlugCtrl', function($scope, Auth, Banner, $rootScope, $location, $stateParams, $window, $mdDialog) {
    $rootScope.parmas = {
        home: false,
        waiting_result: false,
        restricted_area: false,
        customer_share: false,
        forum: false,
        help: false,
    };
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    Auth.isLoggedInAsync(function(cb) {
        if (!cb) {
            $location.path('/dang-nhap.html');
        } else {
            $rootScope.isAdmin = Auth.isAdmin();
            if (!$rootScope.isAdmin) {
                $location.path('/dang-nhap.html');
            } else {
                $scope.banner = {};
                $scope.isEdit = false;
                var getBanner = function() {
                    Banner.getBannerbySlug.get({
                        slug: $stateParams.slug
                    }).$promise.then(function(result) {
                        $scope.banner = result;
                    }).catch(function(err) {});
                };
                getBanner();
                $scope.backHistory = function() {
                    $window.history.back();
                };
                $scope.EditBanner = function() {
                    $scope.isEdit = true;
                };
                $scope.CloseFormOpen = function() {
                    $scope.isEdit = false;
                    getBanner();
                };
                $scope.submit = function() {
                    Banner.editBanner.save($scope.banner).$promise.then(function(result) {
                        $scope.isEdit = false;
                        getBanner();
                    })
                };
                $scope.RemoveBanner = function(id) {
                    var confirm = $mdDialog.confirm().title('Bạn có muốn xóa banner này?').targetEvent(id).ok('Xóa').cancel('Hủy');
                    $mdDialog.show(confirm).then(function() {
                        Banner.removeBanner.remove({
                            id: id
                        }).$promise.then(function(result) {
                            $location.path('/quan-ly-banner.html');
                        }).catch(function(err) {});
                    }, function() {});
                };
            }
        }
    });
})