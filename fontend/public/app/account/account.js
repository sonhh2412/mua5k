'use strict';
angular.module('shopnxApp').config(function($stateProvider) {
    $stateProvider.state('active_email', {
        title: 'Kích hoạt Email',
        url: '/kich-hoat-email/:_id.html',
        templateUrl: 'app/account/views/active.view.html',
        controller: 'ActiveEmailCtrl',
        data: {
            css: 'assets/theme/other/style.signup.css'
        }
    }).state('active_telephone', {
        title: 'Kích hoạt số điện thoại',
        url: '/kich-hoat-tin-nhan-dien-thoai/:_id.html',
        templateUrl: 'app/account/views/active.phone.view.html',
        controller: 'ActivePhoneCtrl',
        data: {
            css: 'assets/theme/other/style.signup.css'
        }
    }).state('signup', {
        title: 'Đăng ký tài khoản',
        url: '/dang-ky-tai-khoan.html',
        templateUrl: 'app/account/views/signup.view.html',
        controller: 'SignupCtrl',
        data: {
            css: 'assets/theme/other/style.signup.css'
        }
    }).state('login', {
        title: 'Đăng nhập',
        url: '/dang-nhap.html',
        templateUrl: 'app/account/views/login.view.html',
        controller: 'loginControler',
        data: {
            css: 'assets/theme/other/style.login.css'
        }
    }).state('nhapmasmsquenmatkhau', {
        title: 'Quên mật khẩu nhập mã sms ',
        url: '/quen-mat-khau-nhap-ma-sms/:id.html',
        templateUrl: 'app/account/views/input.sms.fogot.passwrod.html',
        controller: 'forgoiSmsInputController',
        data: {
            css: 'assets/theme/other/style.forgot.password.css'
        }
    }).state('forgotpassword', {
        title: 'Quên mật khẩu',
        url: '/quen-mat-khau.html',
        templateUrl: 'app/account/views/forgot.password.view.html',
        controller: 'forgotController',
        data: {
            css: 'assets/theme/other/style.forgot.password.css'
        }
    }).state('changepasswordState', {
        title: 'Nhập mật khẩu mới',
        url: '/thay-doi-mat-khau/:string/:id.html',
        templateUrl: 'app/account/views/change.passwrod.view.html',
        controller: 'ChangePasswordController',
        data: {
            css: 'assets/theme/other/style.forgot.password.css'
        }
    }).state('settings', {
        title: 'Thông tin tài khoản',
        url: '/quan-ly-tai-khoan.html',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true,
    }).state('address', {
        title: 'Thông tin địa chỉ giao hàng.',
        url: '/thong-tin-dia-chi-giao-hang.html',
        templateUrl: 'app/account/address/address.html',
        controller: 'AddressCtrl',
        authenticate: true,
    }).state('profile', {
        title: 'Trang ca nhan',
        url: '/trang-ca-nhan.html',
        templateUrl: 'app/account/views/profile.view.html',
        controller: 'ProfileCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state('mywallet', {
        title: 'Ví của tôi',
        url: '/vi-cua-toi.html',
        templateUrl: 'app/account/views/mywallet.view.html',
        controller: 'MywalletCtrl',
        authenticate: true,
    }).state('yourprofile', {
        title: 'Hồ sơ của bạn',
        url: '/ho-so-cua-ban.html',
        templateUrl: 'app/account/views/yourprofile.view.html',
        controller: 'YourprofileCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state('updateavatar', {
        title: 'Hồ sơ của bạn',
        url: '/sua-doi-avatar.html',
        templateUrl: 'app/account/views/updateavatar.view.html',
        controller: 'UpdateavatarCtrl',
        authenticate: true,
    }).state('changepassword', {
        title: 'Thay đổi mật khẩu',
        url: '/thay-doi-mat-khau.html',
        templateUrl: 'app/account/views/changepassword.view.html',
        controller: 'ChangepasswordCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state('shippingaddress', {
        title: 'Địa chỉ giao hàng ',
        url: '/dia-chi-giao-hang.html',
        templateUrl: 'app/account/views/shippingaddress.view.html',
        controller: 'ShippingaddressCtrl',
        authenticate: true,
    }).state('muak', {
        title: 'Mua K',
        url: '/dang-ky-mua-k.html',
        templateUrl: 'app/account/views/dangkymuak.view.html',
        controller: 'BuyKCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state('resultmuak', {
        title: 'Kết quả trả về thành công',
        url: '/ket-qua-tra-ve.html',
        templateUrl: 'app/account/views/ketquatrave.view.html',
        controller: 'ResultBuyKCtrl',
        authenticate: true,
    }).state('purchaserecords', {
        title: 'Hồ sơ mua bán ',
        url: '/ho-so-mua-ban.html',
        templateUrl: 'app/account/views/purchaserecords.view.html',
        controller: 'PurchaseRecordsCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state('customerprofile', {
        title: 'Hồ sơ khách hàng',
        url: '/ho-so/:id.html',
        templateUrl: 'app/account/views/customerprofile.view.html',
        controller: 'CustomerProfileCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state('chuyenk', {
        title: 'CHUYỂN K',
        url: '/chuyen-k.html',
        templateUrl: 'app/account/views/chuyenk.view.html',
        controller: 'TransferKCtrl',
        authenticate: true,
    }).state('winningproducts', {
        title: 'Sản phẩm trúng thưởng',
        url: '/san-pham-trung-thuong.html',
        templateUrl: 'app/account/views/winningproducts.view.html',
        controller: 'WinningProductsCtrl',
        authenticate: true,
    }).state('detailprofile', {
        title: 'Chi tiết tài khoản',
        url: '/chi-tiet-tai-khoan.html',
        templateUrl: 'app/account/views/detailprofile.view.html',
        controller: 'DetailProfileCtrl',
        data: {
            css: 'assets/theme/other/style.app.css'
        },
        authenticate: true,
    }).state("verifyAccount", {
        title: "Xác minh tài khoản",
        url: "/xac-minh-tai-khoan/:_id/:code.html",
        controller: "verifyAccountCtrl",
        templateUrl: 'app/account/views/active.watting.html',
        data: {
            css: 'assets/theme/other/style.active.user.css'
        },
    }).state("newnotify", {
        title: "Thông báo mới",
        url: "/thong-bao-moi.html",
        controller: "NewNotifyCtrl",
        templateUrl: 'app/account/views/notify.content.view.html',
    }).state("newnotifydetail", {
        title: "Nội dung thông báo",
        url: "/thong-bao-moi/:slug.html",
        controller: "NewNotifyDetailCtrl",
        templateUrl: 'app/account/views/detail.notify.content.view.html',
    })
    // .state("topup", {
    //     title: "Nạp tiền trực tiếp TopUp",
    //     url: "/topup.html",
    //     controller: "TopUpCtrl",
    //     templateUrl: 'app/account/views/topup.view.html',
    // });
});