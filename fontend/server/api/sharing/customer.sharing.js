'use strict';

var CustomerSharing = require('../../../node_amqplib/node_mongodb/customer_sharing/model.customer.sharing');
var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');
var Product_Lottery = require('../../../node_amqplib/node_mongodb/product_session_lottery/model.product.session.lottery');
var paginate = require('node-paginate-anything');
var mongoose = require('mongoose');

exports.addSharing = function (req, res, next) {
  var err_token = [];
  var data_tmp = req.body;
  data_tmp.slug = slugify(data_tmp.name);

  CustomerSharing.find({
    "product.id": data_tmp.product.id,
    "session.session_id": data_tmp.session.session_id,
    "session.session_number": data_tmp.session.session_number
  }, function(err, data){

    if (err || !data) {
      res.status(403).send();
    } else {
      if (data.length == 0) {
        CustomerSharing.create(data_tmp, function (err, data) {
          if(err || !data) { return handleError(res, err); }
          return res.status(201).json(data);
        });
      } else {
              err_token.push(1);//sharing of product session is exits
              res.status(403).send(err_token);
            }
          }
        });
};

exports.editSharing  = function(req, res, next) {
  var id = req.body._id;
  var err_token = [];
  delete req.body._id;
  req.body.slug = slugify(req.body.name);
  CustomerSharing.find({
    _id : { $ne : id },
    "product.id" : req.body.product[0].id,
    "session.session_id" : req.body.session[0].session_id,
    "session.session_number": req.body.session[0].session_number
  }, function (err, data) {
    if (err || !data) {
      res.status(403).send();
    } else {
      if (data.length == 0) {
        CustomerSharing.findOneAndUpdate(
          {_id : id},
          {$set : req.body}, 
          function(err, results){
            if(!err){
              res.status(200).send();
            }else{
              res.status(403).send();
            }
          });
      } else {
                err_token.push(1);//sharing of product session is exits
                res.status(403).send(err_token);
              }
            }
          });
  };

  exports.getListSharing = function(req, res, next) {
    var queryParameters = null;
    CustomerSharing.count({

    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 12),
        CustomerSharing.aggregate([
        {
          $project : { 
            "name": 1,
            "content": 1,
            "slug": 1,
            "image_main": 1,
            "images": 1,
            "product": 1,
            "user": 1,
            "session": 1,
            "publish": 1,
            "like": 1,
            "comment": 1,
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

  exports.removeSharing = function(req, res, next) {
    CustomerSharing.findByIdAndRemove(req.params.id, function(err, data) {
      if (err || !data) return res.status(500).send(err);
      else{
        res.status(200).send();
      }
    });
  };

  exports.getListLotteries = function(req, res, next) {
    Product_Lottery.aggregate([
    {
      $group : {
        _id: {
          id: "$id",
          name: "$name",
          slug: "$slug"
        }
      }
    }
    ]).exec(function(err, results) {
      !err ? res.status(200).send(results) : res.status(403).send();
    });
  };

  exports.getListSessionLotteriesByProduct = function(req, res, next) {
    var product_id = req.params.id;
    Product_Lottery.aggregate([
    {
      $match : {
        id: parseInt(product_id),
      }
    }
    ,{
      $project : {
        _id : 0,
        user_win : !0,
        session_id : !0,
        session_number : !0,
      }
    }
    ]).exec(function(err, results) {
      !err ? res.status(200).send(results) : res.status(403).send();
    });
  };

  exports.getNumberCodeUserBuy = function(req, res, next) {
    var product_id = req.query.product_id;
    var session_id = req.query.session_id;
    var user_id = req.query.user_id;
    Product_Lottery.aggregate([
    {
      $match : {
        session_id : parseInt(session_id),
        id : parseInt(product_id)
      }
    },
    {
      $project : {
        _id: 0,
        code: 1
      }
    },
    {
      $unwind : "$code"
    },
    {
      $unwind : "$code.code"
    },
    {
      $match : {
        "code.user._id" : mongoose.Types.ObjectId(user_id)
      }
    },
    {
      $group : {
        _id : { user_id: "$code.user._id"},
        count : { $sum : 1 }
      }
    }
    ]).exec(function(err, results) {
      !err ? res.status(200).send(results) : res.status(403).send();
    });
  };

  exports.getSharingContentBySlug = function(req, res, next) {
    var slug = req.params.slug;
    slug = slug.split('-');
    var id = slug[slug.length -1];
    CustomerSharing.findById(id, function (err, data) {
      if(err || !data) { return res.status(403).send(); }
      return res.status(200).json(data);
    });
  };

  exports.getListSharingByProduct = function(req, res, next) {
    var product_id = req.params.id;
    var queryParameters = null;
    CustomerSharing.count({
     "product.id" : parseInt(product_id)
   }, function(err, count){
    !err && count > 0 ? (
      queryParameters = paginate(req, res, count, 10),
      CustomerSharing.aggregate([
      {
        $unwind : "$product"
      },
      {
        $project : { 
          "name": 1,
          "content": 1,
          "slug": 1,
          "images": 1,
          "image_main": 1,
          "product": 1,
          "user": 1,
          "session": 1,
          "publish": 1,
          "like": 1,
          "comment": 1,
        }
      },
      {
        $match : {
          "product.id" : parseInt(product_id)
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

  exports.getListSharingByUser = function(req, res, next) {
    var user_id = req.params.id;
    CustomerSharing.find({'user._id': user_id, '_id': {$ne:req.query.sharing_id}}, function(err, data){
      if(err || !data) { res.status(403).send(); }
      return res.status(200).json(data);
    });
  };

  exports.UpLikeSharing = function(req, res, next) {
    var sharing_id = req.query.sharing_id;
    var user_id = req.query.user_id;
    CustomerSharing.findById(sharing_id, function(err, sharing){
      if (!err){
        sharing.like = sharing.like.concat(user_id);
        sharing.update(sharing, function(err, result){
          if (err)
            res.status(403).send()
          else {
            res.status(200).send()
          }
        });
      } else {
        res.status(403).send()
      }
    });
  };

  exports.UpViewSharing = function(req, res, next) {
    var slug = req.params.slug;
    slug = slug.split('-');
    var id = slug[slug.length -1];
    CustomerSharing.findById(id, function(err, sharing) {
      if (!err){
        sharing.view += 1;
        sharing.update(sharing, function(err, result){
          if (err)
            res.status(403).send()
          else {
            res.status(200).send(result)
          }
        });
      } else {
        res.status(403).send()
      }
    });
  };

  exports.UpCommentSharing = function(req, res, next) {
    var user_id = req.body._id;
    var sharing_id = req.body.sharing_id;
    delete req.body._id;
    delete req.body.sharing_id;
    CustomerSharing.findById(sharing_id, function(err, sharing){
      if (!err){
        var comment = req.body;
        comment.user_id = user_id;
        comment.comment_date = new Date();
        sharing.comment = sharing.comment.concat(comment);
        sharing.update(sharing, function(err, result){
          if (err)
            res.status(403).send()
          else {
            res.status(200).send(result)
          }
        });
      } else {
        res.status(403).send()
      }
    });
  };

  exports.paginateCommentSharing = function(req, res, next){
    var sharing_id = req.params.id;
    var queryParameters = null;
    CustomerSharing.findById(sharing_id, function(err, result){
      if (!err){
        var count = result ? result.comment.length : 0;
        count > 0 ? (
          queryParameters = paginate(req, res, count, 10),
          CustomerSharing.aggregate([
          {
            $match : {
              "_id" : result._id
            }
          },
          {
            $project : { 
              "comment": 1,
              _id: 0,
            }
          },
          {
            $unwind : "$comment"
          },
          {   
            $sort: {"comment.comment_date":-1} 
          }
          ])
          .skip(queryParameters.skip)
          .limit(queryParameters.limit).exec(function(err, results) {
            !err ? res.send({results: results, count: count}) : res.send({results: [], count: 0});
          })
          ) : (
          res.send({results: [], count: 0})
          )
        } else {
          res.send({results: [], count: 0})
        }
      });
  };

//get list new sharing not by user
exports.getListNewSharing = function(req, res, next) {
  var user_id = req.query.user_id;
  CustomerSharing.find({"user._id": {$ne:user_id}},  function (err, data) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(data);
  }).limit(5).sort({ publish: -1 });
};

//get list win user
exports.getListByUserWinner = function(req, res, next) {
  var user_id = req.query.user_id;
  CustomerSharing.find({"user._id": {$ne:user_id}},  function (err, data) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(data);
  }).sort({ publish: -1 });
};

//get list sharing by product
exports.getListByProduct = function(req, res, next) {
  var product_id = req.query.product_id;
  var sharing_id = req.query.sharing_id;
  var queryParameters = null;
  CustomerSharing.count({
    "product.id": parseInt(product_id),
    _id: { $ne: mongoose.Types.ObjectId(sharing_id) }
  }, function(err, count){
    !err && count > 0 ? (
      queryParameters = paginate(req, res, count, 5),
      CustomerSharing.aggregate([
      {
        $match : {
          "product.id" : parseInt(product_id),
          _id: { $ne: mongoose.Types.ObjectId(sharing_id) }
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

exports.getHistorySharingByUser = function(req, res, next) {
    var user_id = req.params.id;
    CustomerSharing.find({ 'user._id': user_id }, function(err, data){
      if(err || !data) { res.status(403).send(); }
      return res.status(200).json(data);
    }).sort({ publish: -1 });
};

exports.getCountSharing = function(req, res, next) {
    Product_Lottery.distinct(
        'user_win._id', function(err, results){
        err ? res.send({number : 0}) : res.send({number : results.length})
    });
};

function slugify(e) {
  if(e){
    e.split(' ').map(function(wrd){return wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase();}).join(' ');
    var a = e.toLowerCase().trim();
    return a = a
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a")
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e")
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, "i")
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o")
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u").replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y")
    .replace(/đ/gi, "d")
    .replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, "")
    .replace(/ /gi, "-").replace(/\-\-\-\-\-/gi, "-")
    .replace(/\-\-\-\-/gi, "-").replace(/\-\-\-/gi, "-")
    .replace(/\-\-/gi, "-"), a = "@" + a + "@", a = a.replace(/\@\-|\-\@|\@/gi, "")
  }
};