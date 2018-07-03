'use strict';

var State = require('../../../node_amqplib/node_mongodb/res_countries_state/model.res.coutries.state');

function handleError(res, err) {
    return res.status(500).send(err);
}

exports.getCountrystate = function(req, res){
    State
    .find({
        countries_id : 243
    })
    .select ({
        id: !0,
        name : !0
    })
    .exec(function(err, results){
        err ? handleError(res,err) : res.status(200).send(results);
    });
}