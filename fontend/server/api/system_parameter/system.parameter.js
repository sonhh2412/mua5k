'use strict';

var SystemParameter = require('../../../node_amqplib/node_mongodb/system_parameter/model.system.parameter');
var paginate = require('node-paginate-anything');
var mongoose = require('mongoose');

exports.addParameter = function (req, res, next) {
    if(req.body._id == null){
      delete req.body._id;
      new SystemParameter(req.body)
      .save(function(err, result){
        if(!err){
            res.status(200).send();
        }else{
            res.status(403).send();
        }
      });
    }else{
      var id = req.body._id;
      delete req.body._id;
      SystemParameter.findOneAndUpdate(
          {_id : id},
          {$set : req.body}, 
          function(err, results){
            if(!err){
              res.status(200).send();
            }else{
              res.status(403).send();
            }
          }
      );
    }
};

  exports.removeParamater = function(req, res, next) {
    SystemParameter.findByIdAndRemove(req.params.id, function(err, data) {
      if (err || !data) return res.status(500).send(err);
      else{
        res.status(200).send();
      }
    });
  };

  exports.getListParameter = function(req, res, next) {
    var queryParameters = null;
    SystemParameter.count({

    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 12),
        SystemParameter.aggregate([
        {
          $project : { 
            "name": 1,
            "value": 1,
            "key": 1,
          }
        },
        {   
          $sort: {"publish":-1} 
        }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
        .exec(function(err, results) {  
          !err ? res.send({results: results, count: count}) : res.send({results: [], count: 0});
        })
        ) : (
        res.send({results: [], count: 0})
        )
      })
  };

  exports.getParameterByKey = function(req, res, next) {
    var key = req.params.key;
    SystemParameter.findOne({key: key}, function (err, data) {
      if(err || !data) { return res.status(403).send(); }
      return res.status(200).json(data);
    });
  };