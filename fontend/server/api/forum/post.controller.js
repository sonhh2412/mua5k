'use strict';

var _ = require('lodash');
var Post = require('../../../node_amqplib/node_mongodb/forum_post/model.forum.post');
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');
var paginate = require('node-paginate-anything');

exports.addNewPost = function(req, res){
  var userId = req.user._id;
  User.findById(userId, function(err, user) {
    if(!err && user){
      var datenow = new Date();
      var slug = slugify(req.body.title);
      req.body.slug = slug;      
      req.body.image = "";
      req.body.publish = datenow;
      req.body.view = 0;
      req.body.featured = 0;
      req.body.comment = [];
      req.body.state = 1;
      //console.log(req.body);
      new Post(req.body)
        .save(function(err, result){
          if(!err){
              res.status(200).send();
          }else{
              res.status(403).send();
          }
        });
    }
  }); 
};

exports.listPostLast = function(req, res){
  Post.aggregate([
    {
        $project : { 
          comment_count: {$size: { "$ifNull": [ "$comment", [] ] } } ,
          "state": 1,
          "image": 1,
          "title": 1,
          "publish": 1,
          "slug": 1,
          "auth": 1,
          "view": 1,
          "comment": 1,
          "cate_slug": 1,
          "inventory_docs": 1
        }
    },
    { $match: { state: 1} },
    {   
        $sort: {"publish":-1} 
    },
    { $limit: 20 }
  ],function(err,data){
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });
};

exports.listPostHot = function(req, res){
  Post.aggregate([
    {
        $project : { 
          comment_count: {$size: { "$ifNull": [ "$comment", [] ] } } ,
          "state": 1,
          "image": 1,
          "title": 1,
          "publish": 1,
          "slug": 1,
          "auth": 1,
          "view": 1,
          "comment": 1,
          "cate_slug": 1,
          "inventory_docs": 1
        }
    },
    { $match: { state: 1} },
    {   
        $sort: {"view":-1} 
    },
    { $limit: 5 }
  ],function(err,data){
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });
};

exports.listUserPostmost = function(req, res){
  Post.aggregate([
    { $group : { _id : "$auth" , count: {$sum:1}, state: { $push: "$state" } } },
    { $match: { $and: [ { _id: { "$exists": true, "$ne": null }  }, { state: 1 } ] } },
    {   
        $sort: {"count":-1} 
    },
    { $limit: 12 }
  ],function(err,data){
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });
};

exports.listPostCommon = function(req, res){
  Post.aggregate([
    {
        $project : { 
          comment_count: {$size: { "$ifNull": [ "$comment", [] ] } } ,
          "state": 1,
          "image": 1,
          "title": 1,
          "publish": 1,
          "slug": 1,
          "auth": 1,
          "view": 1,
          "comment": 1,
          "cate_slug": 1,
          "inventory_docs": 1
        }
    },
    { $match: { state: 1 } },
    {   
        $sort: {"comment_count":-1} 
    },
    { $limit: 20 }
  ],function(err,data){
    if(err || !data) { res.status(403).send(); }
    return res.status(200).json(data);
  });

};

exports.listPostLastbySlug = function(req, res){
  var queryParameters = null;
  var slug = req.params.slug;
  if(slug != ''){
    Post.count({
        state : 1,
        cate_slug : slug
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 20),
        Post.aggregate([
          {
              $project : { 
                comment_count: {$size: { "$ifNull": [ "$comment", [] ] } } ,
                "state": 1,
                "image": 1,
                "title": 1,
                "publish": 1,
                "slug": 1,
                "auth": 1,
                "view": 1,
                "comment": 1,
                "cate_slug": 1,
                "inventory_docs": 1
              }
          },
          { $match: { $and: [ { cate_slug: slug  }, { state: 1 } ] } },
          {   
              $sort: {"publish":-1} 
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send(results) : res.status(403).send();
          })
      ) : (
        res.send([])
      )
    })
  }  
};

exports.listPostCommonbySlug = function(req, res){

  var queryParameters = null;
  var slug = req.params.slug;
  if(slug != ''){
    Post.count({
        state : 1,
        cate_slug : slug
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 20),
        Post.aggregate([
          {
              $project : { 
                comment_count: {$size: { "$ifNull": [ "$comment", [] ] } } ,
                "state": 1,
                "image": 1,
                "title": 1,
                "publish": 1,
                "slug": 1,
                "auth": 1,
                "view": 1,
                "comment": 1,
                "cate_slug": 1,
                "inventory_docs": 1
              }
          },
          { $match: { $and: [ { cate_slug: slug  }, { state: 1 } ] } },
          {   
              $sort: {"comment_count":-1} 
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {           
            !err ? res.send(results) : res.status(403).send();
          })
      ) : (
        res.send([])
      )
    })
  };
  

  // Post.aggregate([
  //   {
  //     $lookup:
  //       {
  //         from: "rpm_customers",
  //         localField: "auth",
  //         foreignField: "_id",
  //         as: "inventory_docs"
  //       }
  //   },
  //   {
  //       $project : { 
  //         comment_count: {$size: { "$ifNull": [ "$comment", [] ] } } ,
  //         "state": 1,
  //         "image": 1,
  //         "title": 1,
  //         "publish": 1,
  //         "slug": 1,
  //         "auth": 1,
  //         "view": 1,
  //         "comment": 1,
  //         "cate_slug": 1,
  //         "inventory_docs": 1
  //       }
  //   },
  //   { $match: { $and: [ { cate_slug: slug  }, { state: 1 } ] } },
  //   {   
  //       $sort: {"comment_count":-1} 
  //   },
  //   { $limit: 50 }
  // ],function(err,data){
  //   if(err) { res.status(403).send(); }
  //   return res.status(200).json(data);
  // });

};

exports.getPostbySlug = function(req, res){
  var slug = req.params.slug;
  slug = slug.split('-');
  var id = slug[slug.length -1];
  //console.log(ObjectId(id));
  Post.findById(id, function (err, data) {
    if(err) { 
      res.status(403).send();
    }else{
      if(data){
        req.body.view = data.view + 1;
        Post.findOneAndUpdate(
          {_id : id},
          {$set : req.body}, 
          function(err, results){
            if(!err){
              return res.status(200).json(data);
            }else{
              res.status(403).send();
            }
          }
        );
      }
    }
  });
};

exports.countListForumbyCate = function(req, res){
  if(req.params.id){
    var id = req.params.id;
    Post.find({cate_id: id}, function (err, data) {
      if(err || !data) { res.status(403).send();}
      return res.status(200).json({count: data.length});
    });
  }
};

exports.addNewComment = function(req, res){
  var userId = req.user._id;
  var datenow = new Date();
  User.findById(userId, function(err, user) {
      if(!err && user){
          var post_id = req.body.post_id;
          var post_item_comment = "";
          var comment_item = [{
              "user_id" : userId,
              "comment_date" : datenow,
              "comment_content" : req.body.comment_content
          }];
         
          Post.findById(post_id, function (err, data) {
            post_item_comment = data.comment.concat(comment_item);

            Post.findOneAndUpdate(
              {_id : post_id},
              {$set : {
                  comment : post_item_comment
              }}, function(err, results){
                  !err ? (
                      res.status(200).send()
                  ) : (
                      res.status(403).send()
                  )
              }
          );
        });          
      }        
  });  
};

exports.paginatePostComment = function(req, res, next){
  var forum_id = req.params.id;
  var queryParameters = null;
  Post.findById(forum_id, function(err, result){
    if (!err){
      var count = result ? result.comment.length : 0;
      count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Post.aggregate([
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