'use strict';

var _ = require('lodash');
var Categories = require('../../../node_amqplib/node_mongodb/forum_categories/model.forum.categories');
var Post = require('../../../node_amqplib/node_mongodb/forum_post/model.forum.post');
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');


exports.addCategories = function(req, res){  
  var userId = req.user._id;

  User.findById(userId, function(err, user) {
    if(!err && user){
      var datenow = new Date();
      if(req.body.image == null){
        req.body.image = "/assets/images/forum/logo--tt-dd.jpg";
      }
      
      req.body.publish = datenow;
      
      if(req.body._id == null){
        delete req.body._id;
        new Categories(req.body)
        .save(function(err, result){
          if(!err){
              res.status(200).send();
          }else{
              res.status(403).send();
          }
        });
      }else{
        var id = req.body._id;
        var state = req.body.state;
        delete req.body._id;
        Categories.findOneAndUpdate(
            {_id : id},
            {$set : req.body}, 
            function(err, results){
              if(!err){
                if (state && _.isNumber(parseInt(state))) {
                  Post.update({cate_id: results._id}, { $set: {state:state } }, { multi:1 }, function(err, result){

                  });
                }
                res.status(200).send();
              }else{
                res.status(403).send();
              }
            }
        );
      }
    }
  }); 
}

exports.listCategories = function(req, res){
  var q = req.query;
  Categories.find(q, function (err, data) {
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });
}

exports.listCategoriesPushlic = function(req, res){
  Categories.find({state: 1}, function (err, data) {
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });
}

exports.removeCategories = function(req, res){
  if(req.params.id){
    Categories.findByIdAndRemove(req.params.id, function(err, user) {
      if (err) return res.status(500).send(err);
      else{
        Post.remove({cate_id: user._id}, function(err, result){

        });
        res.status(200).send();
      }
    });
  }  
}

exports.getCategorybySlug = function(req, res){
  var slug = req.params.slug;
  if(slug != ''){
    Categories.findOne({slug : slug}, function (err, data) {
      if(err || !data) { res.status(403).send(); }
      return res.status(200).json(data);
    });
  }  
}

exports.getCategorybyId = function(req, res){
  var id = req.params.id;
  Categories.findById(id, function (err, data) {
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });
}

var getAllcate = function(){
  Categories.find({})  
  .exec(function(err, results){
    // console.log(results)
  })
  
};