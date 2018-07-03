'use strict';

var Banner = require('../../../node_amqplib/node_mongodb/banner_manage/model.banner.manage');
var paginate = require('node-paginate-anything');

/**
*	Create New Banner
*/
exports.addBanner = function (req, res, next) {
	var data_tmp = req.body;
	data_tmp.slug = slugify(data_tmp.name);
	Banner.create(data_tmp, function (err, data) {
	    if(err) { return handleError(res, err); }
	    return res.status(201).json(data);
  	});
};
/**
*	Create Edit Banner
*/
exports.editBanner = function(req, res, next) {
	var id = req.body._id;
    delete req.body._id;
    Banner.findOneAndUpdate(
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
*	Delete Banner
*/
exports.removeBanner = function(req, res, next) {
	Banner.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) return res.status(500).send(err);
    else{
      res.status(200).send(user);
    }
  });
};
/**
*	Get List Banners Slice - Homepage
*/
exports.getListSliceBanners = function (req, res, next) {
    var queryParameters = null;
    Banner.count({
        type: 'slice'
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Banner.aggregate([
          {
              $match: {
                  type: 'slice'
              }
          } ,
          {   
              $sort: {
                  state: -1,
                  sequence: 1
              }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: 0}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};
/**
*	Get List Banners Slice Active - Homepage
*/
exports.getListSliceBannersActive = function (req, res, next) {
    Banner.find({type:'slice', 'state':1 }, function (err, data) {
	     if(err) { return handleError(res, err); }
	      return res.status(200).json(data);
	  }).sort({sequence: 1});
};
/**
*	Get List Banner Right - Homepage
*/
exports.getListBannerRights = function (req, res, next) {
    var queryParameters = null;
    Banner.count({
        type: 'right'
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Banner.aggregate([
          {
              $match: {
                  type: 'right'
              }
          } ,
          {   
              $sort: {
                  state: -1,
                  sequence: 1
              }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: 0}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};
/**
*	Get List Banner Right Active - Homepage
*/
exports.getListBannerRightsActive = function (req, res, next) {
	Banner.find({type:'right', 'state':1 }, function (err, data) {
	    if(err) { return handleError(res, err); }
	    return res.status(200).json(data);
	  }).sort({sequence: 1}).limit(1);
};
/**
*	Get List Banner Item - Homepage
*/
exports.getListBannerItems = function (req, res, next) {
    var queryParameters = null;
    Banner.count({
        type: 'item'
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Banner.aggregate([
          {
              $match: {
                  type: 'item'
              }
          } ,
          {   
              $sort: {
                  state: -1,
                  sequence: 1
              }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: 0}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};
/**
*	Get List Banner Item Active - Homepage
*/
exports.getListBannerItemsActive = function (req, res, next) {
	Banner.find({type:'item', 'state':1 }, function (err, data) {
	    if(err) { return handleError(res, err); }
	    return res.status(200).json(data);
	  }).sort({sequence: 1}).limit(6);
};
/**
* Get List Banner Limited - Product Limited Page
*/
exports.getListBannerLimited = function (req, res, next) {
    var queryParameters = null;
    Banner.count({
        type: 'limited'
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Banner.aggregate([
          {
              $match: {
                  type: 'limited'
              }
          } ,
          {   
              $sort: {
                  state: -1,
                  sequence: 1
              }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: 0}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};
/**
* Get List Banner Limited Active - Product Limited Page
*/
exports.getListBannerLimitedActive = function (req, res, next) {
  Banner.find({type:'limited', 'state':1 }, function (err, data) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(data);
    }).sort({sequence: 1}).limit(1);
};
/**
*	Get Banner by Id
*/
exports.getBannerbySlug = function(req, res){
  var slug = req.params.slug;
  slug = slug.split('-');
  var id = slug[slug.length -1];
  Banner.findById(id, function (err, data) {
    if(err) { res.status(403).send(); }
    return res.status(200).json(data);
  });
}

/**
* Get List Guide
*/
exports.getListGuideBanners = function (req, res, next) {
    var queryParameters = null;
    Banner.count({
        type: 'guide'
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Banner.aggregate([
          {
              $match: {
                  type: 'guide'
              }
          } ,
          {   
              $sort: {
                  state: -1,
                  sequence: 1
              }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: 0}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};
/**
* Get List Guide Active
*/
exports.getListGuideBannersActive = function (req, res, next) {
    Banner.find({type:'guide', 'state':1 }, function (err, data) {
       if(err) { return handleError(res, err); }
        return res.status(200).json(data);
    }).sort({sequence: 1});
};


/**
* Get List Guide
*/
exports.getListGuideMobileBanners = function (req, res, next) {
    var queryParameters = null;
    Banner.count({
        type: 'guidemobile'
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        Banner.aggregate([
          {
              $match: {
                  type: 'guidemobile'
              }
          } ,
          {   
              $sort: {
                  state: -1,
                  sequence: 1
              }
          }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send({results: results , count: 0}) : res.send({results: [] , count: 0});
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
};
/**
* Get List Guide Active
*/
exports.getListGuideMobileBannersActive = function (req, res, next) {
    Banner.find({type:'guidemobile', 'state':1 }, function (err, data) {
       if(err) { return handleError(res, err); }
        return res.status(200).json(data);
    }).sort({sequence: 1});
};

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
}

function handleError(res, err) {
  return res.status(500).send(err);
}