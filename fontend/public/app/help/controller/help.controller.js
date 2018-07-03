'use strict';
angular.module('shopnxApp').controller('HelpCtrl', function($scope, $location) {
    $location.path('/tro-giup/gioi-thieu-mua5k.html');
}).controller('HelpAdminCtrl', function($scope, Auth, $rootScope, Help, $location, $mdDialog, $window) {
    $window.scrollTo(0, 0);
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    $scope.session = {};
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
                $scope.post = {};
                $scope.urlListContent = '/api/help/listHelpContents';
                $scope.$watch('listcontent', function(datas) {
                    if (typeof datas != 'undefined') {
                        var index = 0;
                        _.each(datas.results, function(key, value) {
                            console.log($scope.listcontent.results[index]);
                            $scope["active_" + key] = false;
                            $scope["edit_" + key] = false;
                            $scope["post_" + index] = {};
                            $scope["post_" + index].title = $scope.listcontent.results[index].title;
                            $scope["post_" + index].slug = $scope.listcontent.results[index].slug;
                            $scope["post_" + index].content = $scope.listcontent.results[index].content;
                            $scope["post_" + index].state = $scope.listcontent.results[index].state;
                            $scope["post_" + index]._id = $scope.listcontent.results[index]._id;
                            index++;
                        });
                    }
                });
                $scope.isAddFormOpen = false;
                $scope.ViewFormOpen = function() {
                    $scope.isAddFormOpen = true;
                    $scope.post.title = null;
                    $scope.post.slug = null;
                    $scope.post.content = null;
                    $scope.post.state = 1;
                    $scope.post._id = null;
                };
                $scope.CloseFormOpen = function(id) {
                    if (id != undefined) {
                        $scope["active_" + id] = false;
                        $scope["edit_" + id] = false;
                    } else {
                        $scope.isAddFormOpen = false;
                    }
                };
                $scope.showHelpContent = function(id) {
                    if (!$scope["edit_" + id]) $scope["active_" + id] = !$scope["active_" + id];
                };
                $scope.editHelpContent = function(id) {
                    $scope["post_" + id] = {};
                    $scope["post_" + id].title = $scope.listcontent.results[id].title;
                    $scope["post_" + id].slug = $scope.listcontent.results[id].slug;
                    $scope["post_" + id].content = $scope.listcontent.results[id].content;
                    $scope["post_" + id].state = $scope.listcontent.results[id].state;
                    $scope["post_" + id]._id = $scope.listcontent.results[id]._id;
                    $scope["active_" + id] = true;
                    $scope["edit_" + id] = true;
                };
                $scope.RemoveHelpContent = function(id, key) {
                    
                    var confirm = $mdDialog.confirm().title('Bạn có muốn xóa danh mục này?').targetEvent(id).ok('Xóa').cancel('Hủy');
                    $mdDialog.show(confirm).then(function() {
                        Help.removeHelpContent.remove({
                            id: id
                        }).$promise.then(function(result) {
                            $scope["active_" + key] = false;
                            $scope["edit_" + key] = false;
                            $scope.reloadPage = true;
                        }).catch(function(err) {});
                    });
                };
                $scope.submit = function() {
                    Help.addHelpContent.save($scope.post).$promise.then(function(result) {
                        $scope.isAddFormOpen = false;
                        $scope.reloadPage = true;
                    }).catch(function(err) {});
                };
                $scope.submit_save = function(id) {
                    Help.addHelpContent.save($scope["post_" + id]).$promise.then(function(result) {
                        $scope["active_" + id] = true;
                        $scope["edit_" + id] = false;
                        $scope.reloadPage = true;
                    }).catch(function(err) {});
                };
            }
        }
    });
}).controller('HelpPostContentCtrl', function($scope, $rootScope, $stateParams, Help, $location, $window) {
    $window.scrollTo(0, 0);
    $scope.listmenu = [{
        'title': 'GIỚI THIỆU',
        'listchild': [{
            'id': 'menu1',
            'title': 'Giới thiệu Mua5K',
            'link': '/tro-giup/gioi-thieu-mua5k.html'
        }, {
            'id': 'menu2',
            'title': 'Thỏa thuận dịch vụ',
            'link': '/tro-giup/thoa-thuan-dich-vu.html'
        }, {
            'id': 'menu3',
            'title': 'Câu hỏi thường gặp',
            'link': '/tro-giup/cau-hoi-thuong-gap.html'
        }, ]
    }, {
        'title': 'HƯỚNG DẪN',
        'listchild': [{
            'id': 'menu4',
            'title': 'Hướng dẫn chơi',
            'link': '/tro-giup/huong-dan-choi.html'
        }, {
            'id': 'menu5',
            'title': 'Hướng dẫn tạo tài khoản',
            'link': '/tro-giup/huong-dan-tao-tai-khoan.html'
        }, {
            'id': 'menu6',
            'title': 'Hướng dẫn nạp tiền',
            'link': '/tro-giup/huong-dan-nap-tien.html'
        }]
    }, {
        'title': 'ĐẢM BẢO DỊCH VỤ',
        'listchild': [{
            'id': 'menu7',
            'title': 'Hàng hóa đảm bảo',
            'link': '/tro-giup/hang-hoa-dam-bao.html'
        }, {
            'id': 'menu8',
            'title': 'Chính sách bảo hành',
            'link': '/tro-giup/chinh-sach-bao-hanh.html'
        }, {
            'id': 'menu9',
            'title': 'Chính sách giao hàng',
            'link': '/tro-giup/chinh-sach-giao-hang.html'
        }, {
            'id': 'menu10',
            'title': 'Bảo mật thông tin',
            'link': '/tro-giup/bao-mat-thong-tin.html'
        }]
    }, {
        'title': 'VỀ MUA5K',
        'listchild': [{
            'id': 'menu11',
            'title': 'Liên hệ',
            'link': '/tro-giup/lien-he.html'
        }, {
            'id': 'menu12',
            'title': 'Hợp tác',
            'link': '/tro-giup/hop-tac.html'
        }, {
            'id': 'menu13',
            'title': 'Liên kết',
            'link': '/tro-giup/lien-ket.html'
        }]
    }, ];
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    $scope.activemenu = '';
    var isfind = false;
    _.each($scope.listmenu, function(value) {
        _.each(value.listchild, function(value2) {
            if ($location.path() === value2.link) {
                isfind = true;
                $scope.activemenu = value2.id;
                return false;
            }
        });
        if (isfind) return false;
    });
    $scope.session = {};
    $scope.postitem = {};
    $scope.authorinfo = {};
    $rootScope.parmas = {
        home: false,
        waiting_result: false,
        restricted_area: false,
        customer_share: false,
        forum: false,
        help: true,
    };
    var md = new MobileDetect(window.navigator.userAgent);
    $scope.doTheBack   = function () {
        window
            .history
            .back()
    };
    $scope.isMobile    = false;
    $scope.isnotMobile = true;
    if (md.mobile() != null) {
        $scope.isMobile    = true;
        $scope.isnotMobile = false
    }
    Help.getHelpPostbySlug.get({
        slug: $stateParams.slug
    }).$promise.then(function(result) {
        if (result.title) {
            $scope.postitem = result;
        } else {
            $scope.postitem = {
                'title': 'Bài viết hiện không tồn tại.',
                'content': ''
            };
        }
    }).catch(function(err) {});
}).controller('HelpAdminChildCtrl', function($scope, $rootScope, $stateParams, Help) {

}).controller('GuideCtrl', function($scope, $rootScope, $stateParams, Help) {
    var md = new MobileDetect(window.navigator.userAgent);
    $scope.doTheBack   = function () {
        window
            .history
            .back()
    };
    $scope.isMobile    = false;
    $scope.isnotMobile = true;
    if (md.mobile() != null) {
        $scope.isMobile    = true;
        $scope.isnotMobile = false
    }
})