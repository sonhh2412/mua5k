"use strict";

var Order_dital_states = require('../order_dial/model.order.dial.states');
var _ = require('lodash');

exports.mongoSave = function(data, callback ) {

	if(data.description){
		    
		Order_dital_states.find({
			id: data.id,
			name: data.name
		}, function (err, result) {

			!err ? (

				_.size(result) === 0 ? (new Order_dital_states(data).save(function (err, result) {
						callback(err === null);
					})
				) : (
					Order_dital_states.update({
						id : data.id, 
						name : data.name
					},{
						$set : { state_string: data.state_string ,  state : data. state }
					}, function(err, result){

						callback(err === null);
					})
				)

			) : (
				callback(err === null)
			)
		})
	}else{
		callback(true);
	}
    
};
