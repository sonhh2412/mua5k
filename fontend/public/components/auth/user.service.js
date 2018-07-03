'use strict';
angular.module('shopnxApp').factory('User', function($resource) {
    return $resource('/api/users/:id/:controller', {
        id: '@_id'
    }, {
        update: {
            method: 'PUT',
            params: {
                controller: 'update'
            }
        },
        get: {
            method: 'GET',
            params: {
                id: 'me'
            }
        },
        getActive: {
            method: 'GET',
            params: {
                controller: 'getActive'
            }
        },
        getInfoActive: {
            method: 'GET',
            params: {
                controller: 'getInfoActive'
            }
        },
        getEventK: {
            method: 'PUT',
            params: {
                controller: 'getEventK'
            }
        },
        updateEventK: {
            method: 'PUT',
            params: {
                controller: 'updateEventK'
            }
        },
        setActive: {
            method: 'PUT',
            params: {
                controller: 'setActive'
            }
        },
        SendSmsForGotPasswd: {
            method: 'PUT',
            params: {
                controller: 'SendSmsForGotPasswd'
            }
        },
        napCard: {
            method: 'PUT',
            params: {
                controller: 'napCard'
            }
        },
        SendSmsCodeForGotPasswd: {
            method: 'PUT',
            params: {
                controller: 'SendSmsCodeForGotPasswd'
            }
        },
        CapNhapMK: {
            method: 'PUT',
            params: {
                controller: 'CapNhapMK'
            }
        },
        updateUser: {
            method: 'PUT',
            params: {
                controller: 'updateUser'
            }
        },
        updatePassword: {
            method: 'PUT',
            params: {
                controller: 'updatePassword'
            }
        },
        updateShippingAddress: {
            method: 'PUT',
            params: {
                controller: 'updateShippingAddress'
            }
        },
        removeShippingAddress: {
            method: 'PUT',
            params: {
                controller: 'removeShippingAddress'
            }
        },
        defaultShippingAddress: {
            method: 'PUT',
            params: {
                controller: 'defaultShippingAddress'
            }
        },
        getUserbyId: {
            method: 'GET',
            params: {
                controller: 'getUserbyId'
            }
        },
        checkEmailExits: {
            method: 'PUT',
            params: {
                controller: 'checkEmailExits'
            }
        },
        checkForgotPasswd: {
            method: 'PUT',
            params: {
                controller: 'checkForgotPasswd'
            }
        },
        sendEmailForgot: {
            method: 'PUT',
            params: {
                controller: 'sendEmailForgot'
            }
        },
        checkHaskTringFogotPasswd: {
            method: 'PUT',
            params: {
                controller: 'checkHaskTringFogotPasswd'
            }
        },
        BuyK: {
            method: 'PUT',
            params: {
                controller: 'BuyK'
            }
        },
        createUserbyProvider: {
            method: 'POST',
            params: {
                controller: 'createUserbyProvider'
            }
        },
        editUserbyProvider: {
            method: 'PUT',
            params: {
                controller: 'editUserbyProvider'
            }
        },
        getUserbyPhoneEmail: {
            method: 'PUT',
            params: {
                controller: 'getUserbyPhoneEmail'
            }
        },
        getUserbyDir: {
            method: 'PUT',
            params: {
                controller: 'getUserbyDir'
            }
        },
        removeUser: {
            method: 'DELETE',
            params: {
                controller: 'removeUser'
            }
        },
        GetCustomById: {
            method: 'PUT',
            params: {
                controller: 'GetCustomById'
            }
        },
        ChuyenK: {
            method: 'PUT',
            params: {
                controller: 'ChuyenK'
            }
        },
        getTotalKById: {
            method: 'GET',
            params: {
                controller: 'getTotalKById'
            }
        },
        getUserbyEmail: {
            method: 'PUT',
            params: {
                controller: 'getUserbyEmail'
            }
        },
        getNotifyWaitingResult: {
            method: 'GET',
            isArray: true,
            params: {
                controller: 'getNotifyWaitingResult'
            }
        },
        resetNotifyMess: {
            method: 'PUT',
            params: {
                controller: 'resetNotifyMess'
            }
        },
        updateStatusNotifyLogin: {
            method: 'PUT',
            params: {
                controller: 'updateStatusNotifyLogin'
            }
        },
        getListNewNotify: {
            method: 'GET',
            params: {
                controller: 'getListNewNotify'
            }
        },
        getListNewNotify_tmp: {
            method: 'GET',
            params: {
                controller: 'getListNewNotify_tmp'
            }
        },
        getDetailNewNotify: {
            method: 'PUT',
            params: {
                controller: 'getDetailNewNotify'
            }
        },
        updateShowGuide: {
            method: 'PUT',
            params: {
                controller: 'updateShowGuide'
            }
        },
        removeTokenUser: {
            method: 'PUT',
            params: {
                controller: 'removeTokenUser'
            }
        }
        // topUp : {
        //     method: 'PUT',
        //     params: {
        //         controller: 'topUp'
        //     }
        // },
    });
});