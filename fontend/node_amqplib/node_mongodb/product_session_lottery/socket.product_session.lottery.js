'use strict';

var Product_Lottery = require('./model.product.session.lottery');

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

module.exports = function(socket) {
    Product_Lottery.schema.post('save', function(doc) {
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
	        convert : !0
	    }).
	    exec(function(err, results){
	        !err && (
	            socket.emit('product:hook_list_result', countSecondList(results)),
	            socket.broadcast.emit('product:hook_list_result', countSecondList(results))
	        );
	    });
	});
};