'use strict'; angular.module('shopnxApp') .config(function($stateProvider) {$stateProvider .state('category_watting', {title: 'Danh mục sản phẩm chờ công bố', url: '/danh-muc/sap-cong-bo.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryWattingCtrl', data: {css: 'assets/theme/other/style.app.css'}, }) .state('category_watting_buyer', {title: 'Danh mục sản phẩm chưa đủ người mua', url: '/danh-muc/chua-du-nguoi-mua.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryWattingPeopleCtrl', }) .state('category_hot', {title: 'Danh mục sản phẩm hot', url: '/danh-muc/san-pham-hot.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryHotCtrl', data: {css: 'assets/theme/other/style.app.css'}, }) .state('category_new', {title: 'Danh mục sản phẩm mới nhất', url: '/danh-muc/san-pham-moi-nhat.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryNewCtrl', data: {css: 'assets/theme/other/style.app.css'}, }) .state('category_area', {title: 'Danh mục sản phẩm hạn chế', url: '/danh-muc/khu-vuc-hang-che.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryAreaCtrl', }) .state('category_child_watting', {title: 'Danh mục sản phẩm chờ công bố', url: '/danh-muc/sap-cong-bo/:slug.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryChildWattingCtrl', data: {css: 'assets/theme/other/style.app.css'}, }) .state('category_child_watting_people', {title: 'Danh mục sản phẩm chưa đủ người mua', url: '/danh-muc/chua-du-nguoi-mua/:slug.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryChildWattingPeopleCtrl', }) .state('category_child_hot', {title: 'Danh mục sản phẩm hot', url: '/danh-muc/san-pham-hot/:slug.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryChildHotCtrl', data: {css: 'assets/theme/other/style.app.css'}, }) .state('category_child_area', {title: 'Danh mục sản phẩm hạn chế', url: '/danh-muc/khu-vuc-hang-che/:slug.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryChildAreaCtrl', }) .state('category_child_new', {title: 'Danh mục sản phẩm mới nhất', url: '/danh-muc/san-pham-moi-nhat/:slug.html', templateUrl: 'app/category/views/category.view.html', controller: 'CategoryChildNewCtrl', data: {css: 'assets/theme/other/style.app.css'}, }) });