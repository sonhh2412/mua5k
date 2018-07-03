'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Product_History_Schema = new Schema({

  product_slug: { type : String, require: !0, trim: !0 },

  product_name: { type: String, require: !0, trim: !0 },
  product_image :  { type: String, require: !0, trim: !0 },

  time : { type: String, require: !0, trim: !0 },

  user_id : { type: String, require: !0, trim: !0 },
  user_name : { type: String, require: !0, trim: !0 },
  date_add : { type: Date, default: Date.now },
  user_avatar : { type: String, require: !0, trim: !0 },
  session_id : Number,
  k_number : Number,
  code : Number,
  session_number : Number
});

// ProductSchema.post('findOneAndUpdate', function(doc) {
    
//     if('function' == typeof process.socket.emit){
//       process.socket.emit('product:save', doc);
//       process.socket.broadcast.emit('product:save', doc);
//     }
    
    
// });

// Product_History_Schema.post('findOneAndRemove', function(doc) {
//   if('function' == typeof process.socket.emit){
//      process.socket.emit('product:remove', doc);
//      process.socket.broadcast.emit('product:remove', doc);
//   }
   
// })



module.exports = mongoose.model('rmp_product_product_history_selled', Product_History_Schema);

