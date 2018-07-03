'use strict';

var _ = require('lodash');
var Order = require('../../../node_amqplib/node_mongodb/order_dial/model.order.dial');
var Order_state = require('../../../node_amqplib/node_mongodb/order_dial/model.order.dial.states');
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');
var paginate = require('node-paginate-anything');

exports.listorderbyuser  = function(req, res){
  var id_user = req.params.id;
  Order.aggregate([
    {
        $project : { 
          "description": 1,
          "id": 1,
          "partner_id": 1,
          "shipper_id": 1,
          "lines": 1,
          "name": 1,
          "date": 1
        }
    },
    { $match: { partner_id: id_user } },
    {   
        $sort: {"date":-1} 
    }
  ],function(err,data){
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });

}

exports.getStatebyId  = function(req, res){
  var id = req.params.id;
  Order_state.aggregate([
    {
        $project : { 
          "state_string": 1,
          "id": 1,
          "state" : 1
        }
    },
    { $match: { id: parseInt(id) } }
  ],function(err,data){
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });

}

