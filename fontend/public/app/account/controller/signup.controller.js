'use strict';
angular.module('shopnxApp').controller('SignupCtrl', function($scope, Auth, $loading, $rootScope, md5, vcRecaptchaService) {
    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };
    var isInt = function(value) {
        return value % 1 === 0 && value > 0;
    };
    var validatePhone = function(txtPhone) {
        var phoneno = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        return txtPhone.match(phoneno);
    };
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    $scope.session = {};
    $scope.err_sever = {};
    $scope.response = null;
    $scope.widgetId = null;
    $scope.checkMess = '';
    $scope.submit = function() {
        $scope.session.isPhone = false;
        $scope.session.isEmail = false;
        if (isInt($scope.session.email)) {
            if (_.size(validatePhone($scope.session.email)) > 0) {
                $scope.session.isPhone = true;
                $scope.session.isEmail = false;
            } else {
                $scope.checkMess = 'Sđt không đúng định dạng';
            }
        } else {
            if (validateEmail($scope.session.email)) {
                $scope.session.isPhone = false;
                $scope.session.isEmail = true;
            } else {
                $scope.checkMess = 'Email không đúng định dạng';
            }
        }

        (($scope.session.isPhone === true || $scope.session.isEmail === true) && ($loading.start('lazy-submit'), Auth.createUser($scope.session, function(cb) {
            // cb.status === 304 && (vcRecaptchaService.reload($scope.widgetId), $scope.response = null, $scope.err_sever_capcha = true, $scope.err_client_capcha = false);
            cb.status === 422 && ($scope.err_sever.token_telephone = _.contains(cb.data, 2), $scope.err_sever.token_email = _.contains(cb.data, 3), $scope.checkMess = $scope.err_sever.token_telephone === true ? 'Tài khoản đã được đăng ký' : 'Tài khoản đã được đăng ký');
            $loading.finish('lazy-submit');
        }).then(function(data) {
            Auth.redirectToAttemptedUrl(data)
        })))
    };
    // $scope.model = {
    //     key: '6LceSBwUAAAAACmXbyAIhB8TQS70YEXsVdwK2-wh'
    // };
    // $scope.setResponse = function(response) {
    //     $scope.response = response
    // };
    // $scope.setWidgetId = function(widgetId) {
    //     $scope.widgetId = widgetId
    // };
    // $scope.cbExpiration = function() {
    //     $scope.response = null
    // }
}).directive("compareTo", function() {
    return {
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate()
            })
        },
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        }
    }
}); 