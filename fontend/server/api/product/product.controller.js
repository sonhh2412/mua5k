'use strict';

var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');
var Product_Lottery = require('../../../node_amqplib/node_mongodb/product_session_lottery/model.product.session.lottery');
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');
var Category = require('../../../node_amqplib/node_mongodb/product_public_category/model.product.public.category');
var strftime = require('strftime');
var _ = require('lodash');
var paginate = require('node-paginate-anything');

var mongoose = require('mongoose');

function handleError(res, err) {
    return res.status(500).send(err);
}

exports.getSearchLikeNameAll = function(req, res){
	res.send([])
};

exports.getListBuyFast = function(req, res){
   
    var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0
    };
     Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "id" : 1,
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
        var list_id_tmp = [];
        // var product_ids = _.filter(result, function(product){
            // if(product.session.selled >= ( product.session.total - product.session.selled  ) && list_id_tmp.indexOf(product.id) == -1){
            //     list_id_tmp.push(product.id);
                // return product;
            // }
        // });

        var product_ids = result;

         product_ids = product_ids.sort(function(a,b) {
            if (( a.session.total - a.session.selled) < ( b.session.total - b.session.selled) ) return 1;
            if (( a.session.total - a.session.selled) > ( b.session.total - b.session.selled) ) return -1;
            return 0;
        });

        product_ids = _.map(product_ids, function(product){
            return product.id
        });
       

        var match = {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "session.finish" : false,
            "convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            'id' : {$in : product_ids}            
        };
        require('./query.product.category').getproductcategoryHomeBuyFast(req, res, match, function(callback){
            return res.send(callback);
        });


           
    })  
}


exports.getSearchLikeNameArea = function(req, res){
	var match = {
        "published": true,
        "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
		"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
        'name' : new RegExp(req.params.name, "i"),
        "limited" : true
    };

	require('./query.product.category').getproductcategory(req, res, match, function(callback){
		return res.send(callback);
	});
};


exports.getSearchLikeNameNew = function(req, res){
	var match = {
        "published": true,
        "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
		"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
        'name' : new RegExp(req.params.name, "i")

    };

	require('./query.product.category').getproductcategory(req, res, match, function(callback){
		return res.send(callback);
	});
};

exports.getSearchLikeNameWattingPeople = function(req, res){

    var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0


    };
     Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "id": 1,
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
        var list_id_tmp = [];
        var product_ids = _.filter(result, function(product){
            if(product.session.selled < ( product.session.total - product.session.selled  ) && list_id_tmp.indexOf(product.id) == -1){
                return product;
            } else {
                list_id_tmp.push(product.id);
            }
        });

        product_ids = _.map(product_ids, function(product){
            return product.id
        });

        var match = {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            'name' : new RegExp(req.params.name, "i"),
            'id' : {$in : product_ids} 
        };

        require('./query.product.category').getproductcategory(req, res, match, function(callback){

            return res.send(callback);
        });
    });
};

exports.getSearchLikeNameWatting = function(req, res){

    var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0


    };
     Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "id": 1,
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
        var list_id_tmp = [];
        var product_ids = _.filter(result, function(product){
            if(product.session.selled >= ( product.session.total - product.session.selled  ) && list_id_tmp.indexOf(product.id) == -1){
                return product;
            } else {
                list_id_tmp.push(product.id);
            }
        });

        product_ids = _.map(product_ids, function(product){
            return product.id
        });

        var match = {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            'name' : new RegExp(req.params.name, "i"),
            'id' : {$in : product_ids} 
        };

        require('./query.product.category').getproductcategory(req, res, match, function(callback){

            return res.send(callback);
        });
    });
};

exports.getSearchLikeNameHot = function(req, res){

	Category.aggregate ( [{
	    $unwind: '$product_host_ids'
	},
	{ 	$group: { _id: { '_id': '$product_host_ids._id' } }
	}])
	.exec(function(err, _ids) {
	
		var match = {
        	"published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
		    "session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            'name' : new RegExp(req.params.name, "i"),
            "_id" : { $in : _.map(_ids, function(value, key){ return value._id._id; }) }
    	}
		err ? res.send({results: [] , count: 0}) : (
			require('./query.product.category').getproductcategory(req, res, match, function(callback){
				res.send(callback);
			})
		);
	} )

};

exports.getProductRestrictedArea = function(req, res){

	var match = {
        "published": true,
        "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
		"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
        "limited" : true
    };

	require('./query.product.category').getproductcategory(req, res, match, function(callback){
		return res.send(callback);
	});

};

exports.getSlug = function(req, res){

    var project = {
    	name : !0,
    		images : !0,
    		description : !0,
    		price : !0,
    		id: !0,
    		published : !0,
        	convert: !0,
            slug: !0,
            limited : !0,
    };
	var match = {
		"slug" : req.params.slug,
        "published": true,
  //       "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
		// "session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
    };
    Product.aggregate([
		{ $match: match } ,
        {
            $project: project
        }
    ])
    .exec(function(err, results) {

    	err || _.size(results) <= 0 ? handleError( res, err ) : res.send(results[0])
    });

};
    
var countSecond = function(date_db, callback){
    callback(parseInt((date_db - new Date()) / 1000))
};

var updateFnLottery = function(req, callback){
    Product_Lottery.findOneAndUpdate({
        "slug" : req.params.slug,
        "session_id" : parseInt(req.params.session_id),
        "lottery" : false
    } , {
        $set: {
            lottery : true
        }
    }, function(err, results){
        callback(err === null ? parseInt(req.params.session_id) : -1);
    });
}

exports.getProductLottery = function(req, res){

    Product_Lottery.findOne({
        "slug" : req.params.slug,
        "session_id" : parseInt(req.params.session_id)
    }, function(err, result){
        err || _.size(result) <= 0 ? handleError( res, err ) : ( countSecond(result.date, function(second){

            res.send({result : result, second : second});

        }));
    })
};


exports.setLotteryPoductSession = function(req, res){
    updateFnLottery(req, function(callback){
        res.send({session : req.params.session_id});
    });
};

exports.getProductNewHomePage = function(req, res){
	
    return require('./query.products.new.home.page').getProductNewHomePage(req, res);



};

exports.getProductHostHomePage = function(req, res){

	Category.aggregate ( [{
	    $unwind: '$product_host_ids'
	},
    {
        $sort: { _id: 1, 'product_host_ids.id': -1 }
    },
	{ 	
        $group: { 
            _id: '$_id',
            'product_id': { $first: '$product_host_ids._id'}
            // { '_id': '$product_host_ids._id' 
            // }
        }
	}])
	.exec(function(err, _ids) {
        // console.log(_ids);
		var match = {
        	"published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "_id" : { $in : _.map(_ids, function(value, key){ return value.product_id; }) }
    	}
		err ? res.send({results: [] , count: 0}) : (
			require('./query.product.category').getproducthothomepage(req, res, match, function(callback){
	           
				res.send(callback);
			})
		);
	} )

	
};

exports.getproductcategorynew = function(req, res){

	if(req.params.id % 1 === 0){
		var match = parseInt(req.params.id) === 0 ? {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false

        } : {
        	"published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } }
        }
		require('./query.product.category').getproductcategory(req, res, match, function(callback){

			return res.send(callback);
		});
	}
};

exports.getproductcategorynewHasBrand = function(req, res){

	if(req.params.id % 1 === 0 && req.params.brand_id % 1 === 0){
		var match = parseInt(req.params.id) === 0 ? {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "brand.id" : parseInt(req.params.brand_id)

        } : {
        	"published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } },
            "brand.id" : parseInt(req.params.brand_id)
        }
		require('./query.product.category').getproductcategory(req, res, match, function(callback){

			return res.send(callback);
		});
	}
};




exports.getproductcategoryArea = function(req, res){
	if(req.params.id % 1 === 0){
		var match = parseInt(req.params.id) === 0 ? {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "limited" : true

        } : {
        	"published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "limited" : true,
            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } }
        }
		require('./query.product.category').getproductcategory(req, res, match, function(callback){
            
			return res.send(callback);
		});
	}
};

exports.getproductcategoryAreaHasBrand = function(req, res){
	if(req.params.id % 1 === 0 && req.params.brand_id % 1 === 0 ){
		var match = parseInt(req.params.id) === 0 ? {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "limited" : true,
            "brand.id" : parseInt(req.params.brand_id)
        } : {
        	"published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "limited" : true,
            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } },
            "brand.id" : parseInt(req.params.brand_id)
        }
		require('./query.product.category').getproductcategory(req, res, match, function(callback){
			return res.send(callback);
		});
	}
};


exports.getproductcategoryWattingPeople = function(req, res){

	var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0


    };
	 Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "id": 1,
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
        var list_id_tmp = [];
        var product_ids = _.filter(result, function(product){
    		if(product.session.selled < ( product.session.total - product.session.selled  ) && list_id_tmp.indexOf(product.id) == -1){
    			return product;
    		} else {
                list_id_tmp.push(product.id);
            }
    	});

    	product_ids = _.map(product_ids, function(product){
    		return product.id
    	});

        

    	if(req.params.id % 1 === 0){
		var match = parseInt(req.params.id) === 0 ? {
            "published": true,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,
			"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			'id' : {$in : product_ids}            
        } : {
        	'id' : {$in : product_ids},
        	"published": true,
        	"limited" : false,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } }
        }
		require('./query.product.category').getproductcategory(req, res, match, function(callback){

			return res.send(callback);
		});
	}

           
    })	
};


exports.getproductcategory = function(req, res){
	var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0


    };
	 Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
    	var product_ids = _.filter(result, function(product){
    		if(product.session.selled >= ( product.session.total - product.session.selled  )){
    			return product;
    		}
    	});
    	product_ids = _.map(product_ids, function(product){
    		return product.id
    	});

    	if(req.params.id % 1 === 0){
		var match = parseInt(req.params.id) === 0 ? {
            "published": true,
            "limited" : false,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,
			"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			'id' : {$in : product_ids}            
        } : {
        	'id' : {$in : product_ids},
        	"published": true,
        	"limited" : false,
            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } }
        }
		require('./query.product.category').getproductcategory(req, res, match, function(callback){

			return res.send(callback);
		});
	}

           
    })	
};

exports.getproductcategoryHasBrand = function(req, res){

	var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0
    };
	 Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
    	
    	var product_ids = _.filter(result, function(product){
    		if(product.session.selled >= ( product.session.total - product.session.selled  )){
    			return product;
    		}
    	});
    	product_ids = _.map(product_ids, function(product){
    		return product.id
    	});			  

    	if(req.params.id % 1 === 0 && req.params.brand_id % 1 === 0){
			var match = parseInt(req.params.id) === 0 ? {
	            "published": true,
	            "limited" : false,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "brand.id" : parseInt(req.params.brand_id),
	            'id' : {$in : product_ids} 

	        } : {
	        	"published": true,
	        	"limited" : false,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "brand.id" : parseInt(req.params.brand_id),
	            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } },
	            'id' : {$in : product_ids} 
	        }
			require('./query.product.category').getproductcategory(req, res, match, function(callback){
				return res.send(callback);
			});
		}
    });
};




exports.getproductcategoryWattingPeopleHasBrand = function(req, res){

	var project = {
        'session.selled' : !0,
        'session.total' : !0,
        '_id' : 0,
        'id' : !0
    };
	 Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        }
        ,{
            $sort : {
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
    	
    	var product_ids = _.filter(result, function(product){

    		if(product.session.selled < ( product.session.total - product.session.selled  )){
    			return product;
    		}
    	});
    	product_ids = _.map(product_ids, function(product){
    		return product.id
    	});			  

    	if(req.params.id % 1 === 0 && req.params.brand_id % 1 === 0){
			var match = parseInt(req.params.id) === 0 ? {
	            "published": true,
	            "limited" : false,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "brand.id" : parseInt(req.params.brand_id),
	            'id' : {$in : product_ids} 

	        } : {
	        	"published": true,
	        	"limited" : false,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "brand.id" : parseInt(req.params.brand_id),
	            "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } },
	            'id' : {$in : product_ids} 
	        }
			require('./query.product.category').getproductcategory(req, res, match, function(callback){
				return res.send(callback);
			});
		}
    });
};

exports.getproductcategoryhot = function(req, res){

	var queryParameters = null;

    req.params.id % 1 === 0 && parseInt(req.params.id) === 0 && (
    	Category.aggregate ( [{
		    $unwind: '$product_host_ids'
		},
		{ 	$group: { _id: { '_id': '$product_host_ids._id' } }
		}])
		.exec(function(err, _ids) {
			var match = {
	        	"published": true,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "_id" : { $in : _.map(_ids, function(value, key){ return value._id._id; }) }
        	}
			err ? res.send({results: [] , count: 0}) : (
				require('./query.product.category').getproductcategory(req, res, match, function(callback){
					res.send(callback);
				})
			);
		} )
	) ;

	req.params.id % 1 === 0 && parseInt(req.params.id) !== 0 && ( Category.aggregate ( [{
		    $unwind: '$product_host_ids'
		},{
			$match : { id : {$eq : parseInt(req.params.id)} }
		},
		{ 	$group: { _id: { '_id': '$product_host_ids._id' } }
		}])

		.exec(function(err, _ids) {
		
			var match = {
	        	"published": true,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "_id" : { $in : _.map(_ids, function(value, key){ return value._id._id; }) }
        	}
			err ? res.send({results: [] , count: 0}) : (
				require('./query.product.category').getproductcategory(req, res, match, function(callback){
					res.send(callback);
				})
			);
		} )
	)
};


exports.getproductcategoryhotHasBrand = function(req, res){

	var queryParameters = null;

    req.params.id % 1 === 0 && req.params.brand_id % 1 === 0 && parseInt(req.params.id) === 0 && (
    	Category.aggregate ( [{
		    $unwind: '$product_host_ids'
		},
		{ 	$group: { _id: { '_id': '$product_host_ids._id' } }
		}])
		.exec(function(err, _ids) {
			var match = {
	        	"published": true,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "brand.id" : parseInt(req.params.brand_id),
	            "_id" : { $in : _.map(_ids, function(value, key){ return value._id._id; }) }
        	}
			err ? res.send({results: [] , count: 0}) : (
				require('./query.product.category').getproductcategory(req, res, match, function(callback){
					res.send(callback);
				})
			);
		} )
	); 

	req.params.id % 1 === 0 && req.params.brand_id % 1 === 0 && parseInt(req.params.id) !== 0 && ( Category.aggregate ( [{
		    $unwind: '$product_host_ids'
		},{
			$match : { id : {$eq : parseInt(req.params.id)} }
		},
		{ 	$group: { _id: { '_id': '$product_host_ids._id' } }
		}])

		.exec(function(err, _ids) {
		
			var match = {
	        	"published": true,
	            "session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
	            "brand.id" : parseInt(req.params.brand_id),
	            "_id" : { $in : _.map(_ids, function(value, key){ return value._id._id; }) }
        	}
			err ? res.send({results: [] , count: 0}) : (
				require('./query.product.category').getproductcategory(req, res, match, function(callback){
					res.send(callback);
				})
			);
		} )
	)
};



exports.getProductWiget = function(req, res){

	Product.findById(
		req.params._id
	)
	.select({
		name : !0,
		slug : !0,
		images : !0,
		price : !0,
		published : !0
	})
	.limit(30)
    .exec(function(err, results) {
    	!err ? res.status(200).send(results) : handleError( res, err );    	
    })
};


exports.getSessionSelling = function(req, res){
	var project = {
        'session.number' : !0,
        'session.selled' : !0,
        'session.total' : !0,
        'session.code' : !0,
        '_id' : 0
    };
	!_.isUndefined(req.params.id) && _.isNumber(parseInt(req.params.id)) ? (
		require('./product.session.selling').sessionSelling(req.params.id, project, function(session){

			_.size(session) > 0 ? (
				// session[0].session.code = _.filter(session[0].session.code , function(value){
				// 	console.log(value);
				// 	return value.user_id
				// }),
                // console.log(session[0].session),
				res.send(session[0].session)
			) : (
				res.status(403).send("Forbidden")
			)
		})
	) : (
		res.status(403).send("Forbidden")
	)
};

exports.getCountCode = function(req, res){

	var project = {
        'session.number' : !0,
        'session.selled' : !0,
        'session.total' : !0,
        'session.code' : !0,
        '_id' : 0
    };
	!_.isUndefined(req.params._id) ? (
		require('./product.session.selling').sessionCartSelling(req.params._id, project, function(session){

			_.size(session) > 0 ? (
				res.send([session[0].session.total - session[0].session.selled])
			) : (
                res.send([0])
			)
		})
	) : (
		res.status(403).send("Forbidden")
	)
};

exports.getCodeAll = function(req, res){

	var project = {
        'session.number' : !0,
        'session.selled' : !0,
        'session.total' : !0,
        'session.code' : !0,
        '_id' : 0
    };
	!_.isUndefined(req.params._id) ? (
		require('./product.session.selling').sessionCartSelling(req.params._id, project, function(session){
			_.size(session) > 0 ? (

				res.send([session[0].session.total , session[0].session.selled])
			) : (
				res.status(403).send("Forbidden")
			)
		})
	) : (
		res.status(403).send("Forbidden")
	)
};

exports.getSessionSelled = function(req, res){

	var product_id = req.params.id;
	var project = {
        'session.number' : !0,
        'session.session_id': !0,
        '_id' : 0
    };

    !_.isUndefined(req.params.id) && _.isNumber(parseInt(req.params.id)) ? (
    	require('./product.session.selling').sessionCartSelled(req.params.id, project, function(session){
    		res.send(session);
		})
    ) : (
    	res.status(403).send("Forbidden")
    )
};

exports.getListProducts = function(req, res, next) {
    Product.find({}, function (err, data) {
        if(err || !data) { return handleError(res, err); }
        return res.status(201).json(data);
    });
};

exports.sessionSelectSharing = function(req, res, next) {
    var product_id = req.params.id;
    var project = {
        'session.number' : !0,
        'session.session_id': !0,
        '_id' : 0
    };

    !_.isUndefined(product_id) && _.isNumber(parseInt(product_id)) ? (
        require('./product.session.selling').sessionSelectSharing(product_id, project, function(session){
            res.send(session);
        })
    ) : (
        res.status(403).send("Forbidden")
    )
};

exports.getCustomerSharingbySession = function(req, res, next) {
    var product_id = req.params.id;
    var session_id = req.params.session_id;
    var session_number = req.params.session_number;

    !_.isUndefined(product_id) && _.isNumber(parseInt(product_id)) ? (
        require('./product.session.selling').CustomerSharingbySession(product_id, session_id, session_number, function(session){
            res.send(session);
        })
    ) : (
        res.status(403).send("Forbidden")
    )
};

var countSecondList = function(products){
    var arrayNewProduct = [];
    for (var i = 0 ; i < products.length; i++) {
       
        arrayNewProduct.push({
            second_product : (products[i].date - new Date()) / 1000 > 0 ? (products[i].date - new Date()) / 1000 : 0,
            product : products[i]
        });
    };
    return arrayNewProduct;
    
};

exports.getCountLottery = function(req, res){
    Product_Lottery.count({
        user_win : { $ne : [] },
        lottery : true 
    }, function(err, number){
        err ? res.send({number : 0}) : res.send({number : number})
    });
};

exports.getCountLotteryCategory = function(req, res){
    var product_ids = [];
    var categ_id = req.params.slug.split('-');
    for (var i = categ_id.length - 1; i >= 0; i--) {
         categ_id = categ_id[i];
         break;
    };
    if(categ_id % 1 === 0 && _.isNumber(parseInt(categ_id))) {

        var match =  {
            "published" : true,
            "category" : { "$elemMatch": { $eq: parseInt(categ_id) } }
        }
        Product.aggregate([
            { $match: match },
            {
                $project: {_id : 0, id : !0}
            },
        ])
        .exec(function(err, results) {
            err ? (
                res.send([])
            ) : (
                product_ids = _.map(results, function(value) {return value.id;}),
                Product_Lottery.count({
                    id : {'$in' :  product_ids},
                    user_win : { $ne : [] },
                    lottery : true
                },function(err, count){
                    err ? res.send({number : 0}) : res.send({number : count})
                })
            )
            
        })
    }else{
        res.status(403).send();
    }
};

exports.getListProductLottery = function(req, res){
    Product_Lottery.find({
        // user_win : { $ne : [] } 
    }).
    sort({
        date : -1
    }).
    limit(6).
    select({
        _id : 0,
        id : !0,
        images : !0,
        session_id : !0,
        price : !0,
        slug : !0,
        name : !0,
        date : !0,
        convert : !0,
        limit : !0,
    }).
    exec(function(err, results){
        !err ?(
            res.send(countSecondList(results)) 
        ): res.send([])
    })
};

exports.getListWinProductByUser = function(req, res, next) {
  
  var user_id = req.params.id;
  Product_Lottery.aggregate([
    {
        $match : {
            lottery : true,
            'user_win._id' : mongoose.Types.ObjectId(user_id)
        }
    },
    {
        $project : {
            _id: 0,
            code: 1,
            user_win : 1,
            session_id : !0,
            session_number : !0,
            lottery : !0,
            slug : !0,
            name : !0,
            images : !0,
            price : !0,
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
            _id : { 
                user_id: "$code.user._id", 
                session_id: "$session_id"
            },
            data: {
                $first : "$$ROOT" 
            },
            count : { $sum : 1 }
        }
    }
  ]).exec(function(err, results) {
    // console.log(results);
      !err ? res.status(200).json(results) : res.status(403).send();
  });
}

exports.getProductsBySlug_Session = function(req, res){

    var project = {
        'session.selled' : !0,
        'session.total' : !0,
        'price' : !0,
        'images' : !0,
        '_id' : 0,
    };
    Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'slug': req.params.slug,
                'session.session_id' : parseInt(req.params.session_id),
            }
        }
        ,{
            $sort : {
                "session.session_id" : 1
            }
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
       
        !err && _.size(result) > 0 ? (
            res.send(result[0])
        ) : (
            res.status(403).send("Forbidden")
        )
    })
};

exports.getPeopleBySessionLottery = function(req, res, next) {
    var product_id = req.query.product_id;
    var session_id = req.query.session_id;
    // var session_number = req.query.session_number;
    Product_Lottery.aggregate([
        {
        $match : {
            id: parseInt(product_id),
            session_id: parseInt(session_id),
            // session_number: parseInt(session_number)
        }
        },
        {
            $project : {
                _id : 0,
                code : 1,
                session_id :1
            }
        },
        {
            $unwind : "$code"
        },
        {
            $group : {
                _id : { user_id : '$code.user._id', session_id : '$session_id' }
            }
        },
        {
            $group : {
                _id : { session_id : '$_id.session_id' },
                count : { $sum : 1 }
            }   
        }
    ]).exec(function(err, results) {
      !err ? res.status(200).json(results) : res.status(403).send();
    });
};

exports.getProductLotteryResult = function(req, res){
    var pagination = {
        skip : 0,
        limit : 0
    };
    var product_ids = [];
    var categ_id = req.params.slug.split('-');
    for (var i = categ_id.length - 1; i >= 0; i--) {
         categ_id = categ_id[i];
         break;
    };

    if(categ_id % 1 === 0 && _.isNumber(parseInt(categ_id))) {

        var match =  {
            "published" : true,
            "category" : { "$elemMatch": { $eq: parseInt(categ_id) } }
        }
        Product.aggregate([
            { $match: match },
            {
                $project: {_id : 0, id : !0}
            },
        ])
        .exec(function(err, results) {
            var products = null, products_ccb = null, products_dcb = null;
            err ? (
                res.send([])
            ) : (
                product_ids = _.map(results, function(value) {return value.id;}),
                Product_Lottery.count({
                    id : {'$in' :  product_ids}
                },function(err, count){

                    !err && count > 0 ? (
                        pagination = paginate(req, res, count, 24),
                        Product_Lottery.find({
                            id : {'$in' : product_ids },
                        })
                        .skip(pagination.skip)
                        .limit(pagination.limit)
                        .select({
                            _id : 0,
                            description : 0,
                            __v : 0,
                            default_code : 0,
                            total : 0,
                            code : 0,
                            descriptionSale : 0,
                            session_number : 0
                        })
                        .sort({date : -1})
                        .exec(function(err, results){
                            err ? (
                                res.send([])
                            ) : (
                                res.send(countSecondList(results))
                            )
                        })
                    ) : (
                        res.send([])
                    );
                })
            )
            
        })
    }else{
        res.status(403).send();
    }
};



exports.getProductLotteryResultAll = function(req, res){
    var pagination = null;
    Product_Lottery.count(function(err, count){
        err || count === 0 ? ( 
            res.send([])
        ) : (
            pagination = paginate(req, res, count, 24),
            Product_Lottery.find()
            .select({
                _id : 0,
                description : 0,
                __v : 0,
                default_code : 0,
                total : 0,
                code : 0,
                descriptionSale : 0,
                session_number : 0
            })
            .sort({date : -1})
            .skip(pagination.skip)
            .limit(pagination.limit)
            .exec(function(err, results){
                err ? (
                    res.send([])
                ) : (
                    res.send(countSecondList(results))
                )
            })
        );
    });

    
};



exports.getProductsById = function(req, res, next) {
    var product_id = req.params.id
    Product.find({ id:parseInt(product_id) }, function (err, data) {
        if(err || !data) { return handleError(res, err); }
        return res.status(201).json(data);
    });
}


exports.getSessionBySearch = function(req, res){
    var project = {
        'session.number' : !0,
        'session.session_id' : !0,
        'session.finish': !0,
        '_id' : 0
    };
    !_.isUndefined(req.params.id) && _.isNumber(parseInt(req.params.id)) && !_.isUndefined(req.params.number) && _.isNumber(parseInt(req.params.number)) ? (
        require('./product.session.selling').searchSessionSelledByNumber(req.params.id, req.params.number, project, function(session){

            _.size(session) > 0 ? (
                session[0].session.finish ? (
                    res.send(session[0].session)
                ) : (
                    require('./product.session.selling').getSessionSelling(req.params.id, project, function(session_2) {
                        _.size(session_2) > 0 ? (
                            session[0].session.session_id == session_2[0].session.session_id ? (
                                res.send(session[0].session)
                            ) : (
                                res.status(403).send("Forbidden")
                            )
                        ) : (
                            res.status(403).send("Forbidden")
                        )
                    })
                )
            ) : (
                res.status(403).send("Forbidden")
            )
        })
    ) : (
        res.status(403).send("Forbidden")
    )
};

exports.getTopProductHeader = function(req, res){

    Product_Lottery.aggregate([
    { $match : {
            lottery : true,
        }
    },
    {
        $group: {
            _id: '$id',
            count: { $sum: 1 }
        }
    },
    {
        $sort : {
            count : -1
        }
    },

  ]).exec(function(err, results) {
        var project = {
            _id : !0,
            name : !0,
            images : !0,
            convert: !0,
            slug: !0,
            id: !0
        };
        var match = null;

        !err ? (
            match = {
                "id" :  { $in: _.map( results, function(value) {return value._id}) },
                "published" : true,
                'session.finish' : false
            },
            Product.aggregate([
                { $match: match } 
                ,{
                    $project: project
                },
                {
                    $sort : {
                        _id : -1
                    }
                }
                ,{
                    $limit : 2
                }
            ])
            .exec(function(err, results) {
                err ? res.send([]) : (
                    res.send(results)
                )
            })
        ) : (
            res.send([])
        )
  });
}