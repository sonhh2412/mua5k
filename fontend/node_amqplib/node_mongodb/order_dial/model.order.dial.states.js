'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSessionOrderDialStateSchema = new Schema({
    state_string: { type : String, default : '' },
    description:{ type : String, default : '' },
    state: { type : String, default : '' },
    id: { type : Number, default : 0 },
    name: { type : String, default : '' },
});


module.exports = mongoose.model('rmp_product_order_dial_state', ProductSessionOrderDialStateSchema);

