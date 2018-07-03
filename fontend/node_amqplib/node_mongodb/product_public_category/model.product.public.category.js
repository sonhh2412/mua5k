"use strict";
var mongoose = require("mongoose");

var Schema = mongoose.Schema,

CategorySchema = new Schema({
    name: { type: String, require: !0, trim: !0 },

    slug: { type: String, require: !0, trim: !0 },

    parent_id: { type: Number, default: 0 },

    id: Number,

    product_host_ids : { type : Array, default : [] },

    complete_name : String,
    
    sequence : Number,

});

// CategorySchema.post('findOneAndUpdate', function(doc) {
//     setTimeout(function() {
//         process.socket.emit('category:save', doc);
//         process.socket.broadcast.emit('category:save', doc);
//     }, 1000);
    
// });

// CategorySchema.post('findOneAndRemove', function(doc) {
//     if('function' == typeof process.socket.emit){
//         process.socket.emit('category:remove', doc);
//         process.socket.broadcast.emit('category:remove', doc);
//     }
// });


module.exports = mongoose.model("rmp_product_public_category", CategorySchema);
