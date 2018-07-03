'use strict';

var NewsContent = require('../../../node_amqplib/node_mongodb/news_manage/model.news.manage');
var paginate = require('node-paginate-anything');
/**
*	Create New News
*/
exports.addNews = function (req, res, next) {
	var data_tmp = req.body;
	data_tmp.slug = slugify(data_tmp.title);
	NewsContent.create(data_tmp, function (err, data) {
	    if(err || !data) { return handleError(res, err); }
	    return res.status(201).json(data);
  	});
};

/**
*   Get List News
*/
exports.getListNews = function (req, res, next) {
    var queryParameters = null;
    NewsContent.count({
 
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        NewsContent.aggregate([
          {   
              $sort: { state: -1, sequence: 1, publish: -1 }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: count}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};

/**
*   Remove News
*/
exports.removeNews = function(req, res, next) {
    NewsContent.findByIdAndRemove(req.params.id, function(err, data) {
        if (err || !data) return res.status(500).send(err);
        else{
          res.status(200).send();
        }
    });
};

/**
*   Edit news content
*/
exports.editNews = function(req, res, next) {
    var id = req.body._id;
    delete req.body._id;
    req.body.slug = slugify(req.body.title);
    NewsContent.findOneAndUpdate(
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
};

/**
*   Get news content by slug
*/
exports.getNewsbySlug = function(req, res, next) {
    var slug = req.params.slug;
    slug = slug.split('-');
    var id = slug[slug.length -1];
    NewsContent.findById(id, function (err, data) {
        if(err || !data) { res.status(403).send(); }
        return res.status(200).json(data);
    });
};

/**
*   Get List News has Active
*/
exports.getListNewsActive = function (req, res, next) {
    NewsContent.find({state: 1}, function (err, data) {
        if(err || !data) { return handleError(res, err); }
        return res.status(201).json(data);
    }).sort({ sequence: 1, publish: -1 }).limit(3);
};

/**
*   Get Top 10 News
*/
exports.getTopNews = function (req, res, next) {
    NewsContent.find({state: 1}, function (err, data) {
        if (err || !data) { return handleError(res, err); }
        return res.status(201).json(data);
    }).sort({ publish: -1 }).limit(10);
};

exports.listNewsActived = function(req, res){
    var queryParameters = null;
    NewsContent.count({
 
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        NewsContent.aggregate([
          {
              $project : { 
                "state": 1,
                "title": 1,
                "slug": 1,
                "publish": 1,
              }
          },
          { $match: { state: 1} },
          {   
              $sort: { publish: -1 } 
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: count}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
}

/**
*	Return Slug for params
*/
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

function handleError(res, err) {
  return res.status(500).send(err);
};