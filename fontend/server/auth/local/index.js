'use strict';

var _ = require('lodash');
var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');
var request = require('request');
var publisher = require("../../../node_amqplib/lib_publisher");
var errUserLogin = require("../../../node_amqplib/node_mongodb/res_user/model.res.user.error.login.history");
var DeviceManage = require('../../../node_amqplib/node_mongodb/device_manage/model.device.manage');


router.post('/', function(req, res, next) {
	var list_token = [];
  	passport.authenticate('local', function (err, user, info) {
    	var error = err || info;
    	if (error) return res.status(403).json(1);
    	if (!user) return res.status(404).json(1);
    	var ip = null;
    	var region_tmp = '';
    	!user.actived ? res.status(403).json({status: 2, _id : user._id}) : (
    		ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress,
			request('http://ipinfo.io/'+ip+'/region', function(error_ipinfo, res_ipinfo, body) {
				!error_ipinfo ? (
				body.trim() != 'undefined' && (region_tmp = body.trim()),
				User.findOneAndUpdate(
	        		{_id : user._id} 
	        	, {
		    		login_date : new Date(),
		    		ip : ip,
		    		region : region_tmp
		    	}, function(err, result){

		    		User.findById( user._id , function(errfind, userLogin){
		    			!errfind && publisher.publisher('website_login_history', userLogin, function(cb){
	                        !cb && new errUserLogin(userLogin).save(function(err, userLogin){})
	                    }),
	                    console.log(req.body),
	                    req.body.tokenApp && (
	                    	list_token = _.map(userLogin.tokenApps || [], function(item) {
	                    		return item.tokenApp;
	                    	}),
	                    	list_token.indexOf(req.body.tokenApp) === -1 && (
		                    	userLogin.tokenApps.push({
		                    			id: userLogin._id,
		                    			tokenApp: req.body.tokenApp
		                    		}
		                    	)
	                    	),
	                    	userLogin.update(userLogin, function(err, result){
	                    		!err && (
	                    			DeviceManage.findOne({token_id:req.body.tokenApp}, function(err, result){
	                    				!err && !result && (
	                    					DeviceManage.create(
                    						{
                    							token_id:req.body.tokenApp,
                    							isSendNotification: true
                    						}, function(err, device_token){})
	                    				)
	                    			})
	                    		)
	                    	})
	                    )
	                    errfind && new errUserLogin(userLogin).save(function(err, userLogin){})
		    		})
		    		
		    		!err && res.status(200).json({token: auth.signToken(user._id, user.role)})
		    		err && res.status(404).json(1)

		    	})
	    	) : (
	    		res.status(404).json(1)
	    	)
		})
    )
  })(req, res, next)
});

module.exports = router;