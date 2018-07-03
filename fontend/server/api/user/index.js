'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/update', auth.isAuthenticated(), controller.updateUser);

router.get('/:id', auth.isAuthenticated(), controller.show);

router.post('/', controller.create);

router.put('/:id/setActive', controller.setActive);

router.get('/:id/getActive', controller.getActive);
router.get('/:id/getInfoActive', controller.getInfoActive);

router.put('/:id/updateUser',auth.isAuthenticated(), controller.updateUser);

router.post('/:id/uploadFile',auth.isAuthenticated(), controller.uploadFile);

router.put('/:id/updatePassword',auth.isAuthenticated(), controller.updatePassword);

router.put('/:id/updateShippingAddress',auth.isAuthenticated(), controller.updateShippingAddress);

router.put('/:id/removeShippingAddress',auth.isAuthenticated(), controller.removeShippingAddress);

router.put('/:id/defaultShippingAddress',auth.isAuthenticated(), controller.defaultShippingAddress);

router.get('/:id/getUserbyId', controller.getUserbyId);

router.put('/checkEmailExits', controller.checkEmailExits);

router.put('/checkForgotPasswd', controller.checkForgotPasswd);

router.put('/sendEmailForgot', controller.sendEmailForgot);

router.put('/checkHaskTringFogotPasswd', controller.checkHaskTringFogotPasswd);


router.put('/:id/BuyK',auth.isAuthenticated(), controller.BuyK);

router.post('/createUserbyProvider', controller.createUserbyProvider);

router.put('/editUserbyProvider', controller.editUserbyProvider);

router.get('/ReturnBuyK/:token', controller.ReturnBuyK);

router.put('/getUserbyPhoneEmail', controller.getUserbyPhoneEmail);

router.delete('/:id/removeUser', controller.removeUser);

router.put('/GetCustomById', controller.GetCustomById);

router.put('/:id/ChuyenK',auth.isAuthenticated(), controller.ChuyenK);

router.get('/:id/getTotalKById',auth.isAuthenticated(), controller.getTotalKById);

router.put('/CapNhapMK', controller.CapNhapMK);

router.put('/SendSmsForGotPasswd', controller.SendSmsForGotPasswd);
router.put('/SendSmsCodeForGotPasswd', controller.SendSmsCodeForGotPasswd);

router.put('/napCard', auth.isAuthenticated(), controller.napCard);

router.put('/updateEventK', auth.isAuthenticated(), controller.updateEventK);
router.put('/getEventK', auth.isAuthenticated(), controller.getEventK);

router.put('/getUserbyDir', controller.getUserbyDir);
router.put('/getUserbyEmail', controller.getUserbyEmail);

router.get('/:id/getNotifyWaitingResult', auth.isAuthenticated(), controller.getNotifyWaitingResult);
router.put('/resetNotifyMess', auth.isAuthenticated(), controller.resetNotifyMess);
router.put('/updateStatusNotifyLogin', auth.isAuthenticated(), controller.updateStatusNotifyLogin);
router.get('/:id/getListNewNotify', auth.isAuthenticated(), controller.getListNewNotify);
router.get('/:id/getListNewNotify_tmp', auth.isAuthenticated(), controller.getListNewNotify_tmp);
router.put('/getDetailNewNotify', auth.isAuthenticated(), controller.getDetailNewNotify);

router.put('/:id/updateShowGuide',auth.isAuthenticated(), controller.updateShowGuide);

// router.put('/topUp', auth.isAuthenticated(), controller.makeVNPTEpayTopup);

 

module.exports = router;
