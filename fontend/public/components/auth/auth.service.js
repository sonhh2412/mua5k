'use strict';
angular
    .module('shopnxApp')
    .value('redirectToUrlAfterLogin', {url: '/'})
    .factory('Auth', function Auth(
        $location,
        $rootScope,
        $http,
        $loading,
        User,
        $cookieStore,
        $q,
        redirectToUrlAfterLogin
    ) {
        var currentUser = $cookieStore.get('token')
            ? User.get()
            : {};
        return {
            BuyK                     : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .BuyK({
                        id: data._id
                    }, {
                        user: data
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            CapNhapMK                : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .CapNhapMK(data, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            checkEmailExits          : function (email, callback) {
                var cb = callback || angular.noop;
                return User
                    .checkEmailExits({
                        email: email
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            checkForgotPasswd        : function (email, callback) {
                var cb = callback || angular.noop;
                return User
                    .checkForgotPasswd({
                        email: email
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            checkHaskTringFogotPasswd: function (stageObj, callback) {
                var cb = callback || angular.noop;
                return User
                    .checkHaskTringFogotPasswd(stageObj, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            ChuyenK                  : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .ChuyenK({
                        id: data.id
                    }, {
                        user: data
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            createUser               : function (user, callback) {
                var cb = callback || angular.noop;
                return User
                    .save(user, function (data) {
                        return cb(data)
                    }, function (err) {
                        this.logout();
                        return cb(err)
                    }.bind(this))
                    .$promise
            },
            createUserbyProvider     : function (user, callback) {
                var cb = callback || angular.noop;
                return User
                    .createUserbyProvider(user, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    }.bind(this))
                    .$promise
            },
            defaultShippingAddress   : function (currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .defaultShippingAddress({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            editUserbyProvider       : function (user, callback) {
                var cb = callback || angular.noop;
                return User
                    .editUserbyProvider(user, function (data) {
                        $cookieStore.put('token', data.token);
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getCurrentUser           : function () {
                return currentUser
            },
            GetCustomById            : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .GetCustomById({
                        data: data
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getDetailNewNotify       : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .getDetailNewNotify({
                        slug   : data.slug,
                        user_id: data.user_id
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getEventK                : function (_id, callback) {
                var cb = callback || angular.noop;
                return User
                    .getEventK({
                        id: _id
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getInfoUserActive        : function (_id, callback) {
                var cb = callback || angular.noop;
                return User
                    .getInfoActive({
                        id: _id
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        currentUser = User.get();
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getListNewNotify         : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .getListNewNotify({
                        id: data.id
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getListNewNotify_tmp     : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .getListNewNotify_tmp({
                        id: data.id
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getNotifyWaitingResult   : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .getNotifyWaitingResult({
                        id: data.id
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getToken                 : function () {
                return $cookieStore.get('token')
            },
            getTotalKById            : function (id, callback) {
                var cb = callback || angular.noop;
                return User
                    .getTotalKById({
                        id: id
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getUserActive            : function (_id, callback) {
                var cb = callback || angular.noop;
                return User
                    .getActive({
                        id: _id
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getUserbyDir             : function (id, callback) {
                var cb = callback || angular.noop;
                return User
                    .getUserbyDir({
                        id: id
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getUserbyEmail           : function (email, callback) {
                var cb = callback || angular.noop;
                return User
                    .getUserbyEmail({
                        email: email
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getUserbyId              : function (id, callback) {
                var cb = callback || angular.noop;
                return User
                    .getUserbyId({
                        id: id
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            getUserbyPhoneEmail      : function (email, callback) {
                var cb = callback || angular.noop;
                return User
                    .getUserbyPhoneEmail({
                        email: email
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            isAdmin                  : function () {
                return currentUser.role === 'admin'
            },
            isLoggedIn               : function () {
                return currentUser.hasOwnProperty('role')
            },
            isLoggedInAsync          : function (cb) {
                if (currentUser.hasOwnProperty('$promise')) {
                    currentUser
                        .$promise
                        .then(function () {
                            cb(true)
                        })
                        .catch(function () {
                            cb(false)
                        })
                    } else if (currentUser.hasOwnProperty('role')) {
                    cb(true)
                } else {
                    cb(false)
                }
            },
            login                    : function (user, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();
                $http
                    .post('/auth/local', {
                        email   : user.user,
                        password: user.password,
                        tokenApp: user.tokenApp
                    })
                    .success(function (data) {
                        $cookieStore.put('token', data.token);
                        currentUser = User.get();
                        deferred.resolve(data);
                        return cb()
                    })
                    .error(function (err) {
                        this.logout();
                        deferred.reject(err);
                        return cb(err)
                    }.bind(this));
                return deferred.promise
            },
            logout                   : function (data, callback) {
                data && (
                    User.removeTokenUser(data)
                );
                $cookieStore.remove('token');
                currentUser = {}
            },
            napCard                  : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .napCard(data, function (card) {
                        return cb(card)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            redirectToAttemptedUrl   : function (user) {
                user.isEmail === true
                    ? ($location.path('/kich-hoat-email/' + user._id + '.html'))
                    : ($location.path('/kich-hoat-tin-nhan-dien-thoai/' + user._id + '.html'))
            },
            removeShippingAddress    : function (currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .removeShippingAddress({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            removeUser               : function (id, callback) {
                var cb = callback || angular.noop;
                return User
                    .removeUser({
                        id: id
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            resetNotifyMess          : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .resetNotifyMess({
                        id  : data._id,
                        type: data.type
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            saveAttemptUrl           : function () {
                if ($location.path().toLowerCase() !== '/dang-ky-tai-khoan.html' || $location.path().toLowerCase() !== '/dang-nhap.html') {
                    redirectToUrlAfterLogin.url = $location.path()
                } else {
                    redirectToUrlAfterLogin.url = '/'
                }
            },
            sendEmailForgot          : function (userId, callback) {
                var cb = callback || angular.noop;
                return User
                    .sendEmailForgot({
                        id      : userId
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            SendSmsCodeForGotPasswd  : function (data, code, callback) {
                var cb = callback || angular.noop;
                return User
                    .SendSmsCodeForGotPasswd({
                        code: code,
                        id  : data
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            SendSmsForGotPasswd      : function (data, telephone, callback) {
                var cb = callback || angular.noop;
                return User
                    .SendSmsForGotPasswd({
                        id       : data,
                        telephone: telephone
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            setUserActive            : function (_id, code, callback) {
                var cb = callback || angular.noop;
                return User
                    .setActive({
                        id: _id
                    }, {
                        code: code
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        currentUser = User.get();
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            updateEventK             : function (session, callback) {
                var cb = callback || angular.noop;
                return User
                    .updateEventK({
                        session: session
                    }, function (user) {
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            updatePassword           : function (currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .updatePassword({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            updateShippingAddress    : function (currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .updateShippingAddress({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            updateStatusNotifyLogin  : function (data, callback) {
                var cb = callback || angular.noop;
                return User
                    .updateStatusNotifyLogin({
                        id: data.id
                    }, function (data) {
                        return cb(data)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            updateUser               : function (currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .update({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            updateUserProfile        : function (currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .updateUser({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {
                        $cookieStore.put('token', user.token);
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            refreshKNumber: function(callback) {
                var k_number = 0;
                $cookieStore.get('token') && (
                    User.get({}, function(user) {
                        k_number = user ? user.k_number : 0;
                        currentUser.k_number = k_number;
                    }, function(err) {
                    })
                )
                return true;
            },
            updateShowGuide: function(currentUser, callback) {
                var cb = callback || angular.noop;
                return User
                    .updateShowGuide({
                        id: currentUser._id
                    }, {
                        user: currentUser
                    }, function (user) {                        
                        return cb(user)
                    }, function (err) {
                        return cb(err)
                    })
                    .$promise
            },
            // topUp : function(data, callback) {
            //     var cb = callback || angular.noop;
            //     return User.topUp(data, function (result) {
            //             return cb(result)
            //         }, function (err) {
            //             return cb(err)
            //         })
            //         .$promise;
            // }
        }
    });