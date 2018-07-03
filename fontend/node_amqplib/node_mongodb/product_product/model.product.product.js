'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSchema = new Schema({
  id : { type : Number, require: !0, },

  slug: { type : String, require: !0, trim: !0 },

  name: { type: String, require: !0, trim: !0 },

  price : { type : Number, default : 0 },

  description : { type : String, trim: !0 },

  published : { type: Boolean,  default: false },

  sequence : Number,

  descriptionSale : { type : String, default : '' },

  default_code : String,

  images : { type: Array, default : [] },

  category : { type : Array, default : [] },

  brand : { type : Array, default : [] },

  limited : { type: Boolean,  default: false },
  convert : { type : Array, default : [] },
  session : { type : Array, default : [] },
});

// ProductSchema.post('findOneAndUpdate', function(doc) {
    
//     if('function' == typeof process.socket.emit){
//       process.socket.emit('product:save', doc);
//       process.socket.broadcast.emit('product:save', doc);
//     }
    
    
// });

// ProductSchema.post('findOneAndRemove', function(doc) {
//   if('function' == typeof process.socket.emit){
//      process.socket.emit('product:remove', doc);
//      process.socket.broadcast.emit('product:remove', doc);
//   }
   
// })



module.exports = mongoose.model('rmp_product_product', ProductSchema);

