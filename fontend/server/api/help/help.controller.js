'use strict';

var _ = require('lodash');
var HelpContent = require('../../../node_amqplib/node_mongodb/help_content/model.help.content');
var paginate = require('node-paginate-anything');

exports.addHelpContent = function(req, res){
    var slug = slugify(req.body.title);
	  if(req.body._id == null){
	    delete req.body._id;
      	req.body.slug = slug;
	    new HelpContent(req.body)
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
      req.body.slug = slug;
	    HelpContent.findOneAndUpdate(
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
}

exports.getHelpPostbySlug = function(req, res){
  var slug = req.params.slug;
  HelpContent.findOne({slug : slug}, function (err, data) {
    if(err) { res.status(403).send(); }
    return res.status(200).json(data);
  });
}
exports.listHelpContents = function(req, res){
    var queryParameters = null;
    HelpContent.count({

    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 10),
        HelpContent.aggregate([
          {   
              $sort: {
                  state: -1,
                  title: 1
              }
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

exports.removeHelpContent = function(req, res){
	HelpContent.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) return res.status(500).send(err);
    else{
      res.status(200).send();
    }
  });
}

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