'use strict';
angular.module('shopnxApp').config(function($stateProvider) {
    $stateProvider.state('help', {
        title: 'Trợ giúp',
        url: '/tro-giup.html',
        templateUrl: 'app/help/views/help.view.html',
        controller: 'HelpCtrl'
    });
    $stateProvider.state('helppostcontent', {
        title: 'Trợ giúp',
        url: '/tro-giup/:slug.html',
        templateUrl: 'app/help/views/help.admin.post.view.html',
        controller: 'HelpPostContentCtrl'
    });
    $stateProvider.state('managepostadmin', {
        title: 'Quản lý trang tĩnh thông tin',
        url: '/quan-ly-bai-viet.html',
        templateUrl: 'app/help/views/help.admin.view.html',
        controller: 'HelpAdminCtrl',
    });
    $stateProvider.state('postcontentadmin', {
        title: 'Chi tiết thông tin',
        url: '/tro-giup/admin/:slug.html',
        templateUrl: 'app/help/views/help.admin.post.view.html',
        controller: 'HelpAdminChildCtrl',
    });
    $stateProvider.state('guide', {
        title: 'Hướng dẫn',
        url: '/huong-dan.html',
        templateUrl: 'app/help/views/guide.view.html',
        controller: 'GuideCtrl'
    })
});