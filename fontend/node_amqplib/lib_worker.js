"use strict";

var mogno_categories = require('./node_mongodb/product_public_category/controller.product.public.category');

var mongo_product_product = require('./node_mongodb/product_product/controller.product.product');

var mongo_product_brand = require('./node_mongodb/product_brand/controller.product.brand');

var mongo_country = require('./node_mongodb/res_country/controller.res.country');

var mongo_state = require('./node_mongodb/res_countries_state/controller.res.countries.state');

var mongo_product_hots = require('./node_mongodb/product_hots_category/controller.product.hots.category');

var mongo_product_session = require('./node_mongodb/product_session/controller.product.session');

var mongo_res_user = require('./node_mongodb/res_user/controller.res.user');

var colors = require('colors/safe');

var product_convert = require('./node_mongodb/product_convert/controller.product.convert');

var order_dital = require('./node_mongodb/order_dial/controller.order.dial');

var order_dital_state = require('./node_mongodb/order_dial/controller.order.dial.states');

var K_Even = require('./node_mongodb/k_event/controller.k.event');

var notify_content = require('./node_mongodb/notify_content/controller.notify.content');

var ControlUser = require('./node_mongodb/res_user/controller.res.user');

exports.startWorker = function(jobs, connection) {

    connection.createChannel(function(err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function() {
            console.log("[AMQP] channel closed");
        });

        //limit mq
        ch.prefetch(1);

        ch.assertQueue(jobs, {
            durable: true
        }, function(err, _ok) {
            if (closeOnErr(err)) return;
            ch.consume(jobs, processMsg, {
                noAck: false
            });
            console.log("Worker " + colors.green(jobs) + " is started");
        });

        var processMsg = function(msg) {

            getQueues(jobs, msg, ch, connection);
        }
    });
}

var setAckRequest = function(err, msg, ch, connection) {
    try {

        err ? ch.ack(msg) :  ch.reject(msg, true);

    } catch (e) {
        closeOnErr(e, connection);
    };
}

var getQueues = function(jobs, msg, ch, connection) {

    var results = JSON.parse(msg.content.toString()).jdata;
    switch (jobs) {
        case 'odoo_order_state':
    
                order_dital_state.mongoSave(results, function(err){
                    !err ? console.log('Error update order dial state -- odoo id: ' + colors.red(results.id) )
                    : console.log('Success update order dial state -- odoo id: ' + colors.green(results.id)) ;
                    setAckRequest(err, msg, ch, connection);
                })
            break;
        case 'odoo_order_dial':
                order_dital.mongoSave(results, function(err){
                    !err ? console.log('Error save order dial -- odoo id: ' + colors.red(results.id) )
                    : console.log('Success save order dial -- odoo id: ' + colors.green(results.id)) ;
                    setAckRequest(err, msg, ch, connection);
                })
            break;

        case 'odoo_change_Knumber':

                mongo_res_user.updateKNumber(results, function(err){
                    !err ? console.log('Error update K number res user -- user login: ' + colors.red(results[0].login) )
                    : console.log('Success update K number -- user login: ' + colors.green(results[0].login)) ;
                    setAckRequest(err, msg, ch, connection);
                })
            break;

        case 'product_convert':
                product_convert.mongoSave(results, function(err){
                    !err ? console.log('Error product convert -- product type: ' + colors.red(results.name) )
                    : console.log('Success product convert -- product type: ' + colors.green(results.name)) ;
                    setAckRequest(err, msg, ch, connection);
                })
            break;

        case 'customer':

                if (results.type == 'deleteMQ') {
                    mongo_res_user.mongoDelete(results, function(err){
                        !err ? console.log('Error delete res user -- user id: ' + colors.red(results.id[0]) )
                        : console.log('Success delete res user -- user id: ' + colors.green(results.id[0])) ;
                        setAckRequest(err, msg, ch, connection);
                    })
                }else{
                    mongo_res_user.mongoSave(results, function(err){
                        !err ? console.log('Error update res user -- user email: ' + colors.red(results.email) )
                        : console.log('Success update res user -- user email: ' + colors.green(results.email)) ;
                        setAckRequest(err, msg, ch, connection);
                    })
                }
                
            break;

        case 'product_session':
            if (results.type == 'deleteMQ') {
                mongo_product_session.mongoDelete(results, function(err) {
                    !err ? console.log('Delete error product session -- ids: ' + colors.red(results))
                    : console.log('Delete success product session -- ids: ' + colors.green(results.id)) ;
                    setAckRequest(err, msg, ch, connection);
                });
            } else {
                mongo_product_session.mongoSave(results, function(err, product_id){
                    !err ? console.log('Error product session -- product id: ' + colors.red(product_id))
                    : console.log('Success product session -- product id: ' + colors.green(product_id)) ;
                    setAckRequest(err, msg, ch, connection);
                })
            }
            break;

        case 'product_hot':
                mongo_product_hots.mongoCategoryProductIds(results, function(err){
                    !err ? console.log('Error product hots category -- category_id: ' + colors.red(results.category_id) +' , product_ids: ' + colors.red(results.hots))
                    : console.log('Success product hots category -- category_id: ' + colors.green(results.category_id) +' , product_ids: ' + colors.green(results.hots)) ;
                    setAckRequest(err, msg, ch, connection);
                })
            break;
        case 'product_public_category':
                if (results.type == 'deleteMQ') {
                    mogno_categories.mongoDelete(results.id[0], function(err) {
                        !err ? console.log('Delete error product public category  -- id: ' + colors.red(results.id[0]))
                        : console.log('Delete success product public category  -- id: ' + colors.green(results.id[0])) ;
                        setAckRequest(err, msg, ch, connection);
                    });
                } else {
                    mogno_categories.mongoSave(results, function(err) {
                        !err ? console.log('Error product public category -- id: ' + colors.red(results.id) +' , name: ' + colors.red(results.name))
                        : console.log('Success product public category -- id: ' + colors.green(results.id) +' , name: ' + colors.green(results.name)) ;
                        setAckRequest(err, msg, ch, connection);
                    });
                }
            break;

        case 'product_product':
                if (results.type == 'deleteMQ') {
                    mongo_product_product.mongoDelete(results.id[0], function(err) {
                        if (err) {
                            !err ? console.log('Delete error product product -- id: ' + colors.red(results.id[0]))
                            : console.log('Delete success product product -- id: ' + colors.green(results.id[0])) ;
                            setAckRequest(err, msg, ch, connection);
                        } else setAckRequest(false, msg, ch, connection);
                    });
                } else {
                    mongo_product_product.mongoSave(results, function(err) {
                        !err ? console.log('Error product product -- id: ' + colors.red(results.id) +' , name: ' + colors.red(results.name))
                        : console.log('Success product product -- id: ' + colors.green(results.id) +' , name: ' + colors.green(results.name)) ;
                        setAckRequest(err, msg, ch, connection);
                    });
                }
            break;
        case 'product_brand':

            if (results.type == 'deleteMQ') {
                mongo_product_brand.mongoDelete(results.id[0], function(err) {
                    !err ? console.log('Delete error product brand -- id: ' + colors.red(results.id[0]))
                    : console.log('Delete success product brand -- id: ' + colors.green(results.id[0])) ;
                    setAckRequest(err, msg, ch, connection);
                });
            } else {
                mongo_product_brand.mongoSave(results, function(err) {
                    !err ? console.log('Error product brand -- id: ' + colors.red(results.id) +' , name: ' + colors.red(results.name))
                    : console.log('Success product brand -- id: ' + colors.green(results.id) +' , name: ' + colors.green(results.name)) ;
                    setAckRequest(err, msg, ch, connection);
                });
            }
            break;

        case 'country':
            if (results.type == 'deleteMQ') {
                mongo_country.mongoDelete(results.id[0], function(err) {
                    !err ? console.log('Delete error country -- id: ' + colors.red(results.id[0]))
                    : console.log('Delete success country -- id: ' + colors.green(results.id[0])) ;
                    setAckRequest(err, msg, ch, connection);
                });
            } else {
                mongo_country.mongoSave(results, function(err) {
                    !err ? console.log('Error country -- id: ' + colors.red(results.id) +' , name: ' + colors.red(results.name))
                    : console.log('Success country -- id: ' + colors.green(results.id) +' , name: ' + colors.green(results.name)) ;
                    setAckRequest(err, msg, ch, connection);
                    
                });
            }
            break;

        case 'state':
            if (results.type == 'deleteMQ') {
                mongo_state.mongoDelete(results.id[0], function(err) {
                    !err ? console.log('Delete error state -- id: ' + colors.red(results.id[0]))
                    : console.log('Delete success state -- id: ' + colors.green(results.id[0])) ;
                    setAckRequest(err, msg, ch, connection);
                });
            } else {
                mongo_state.mongoSave(results, function(err) {
                    !err ? console.log('Error state -- id: ' + colors.red(results.id) +' , name: ' + colors.red(results.name))
                    : console.log('Success state -- id: ' + colors.green(results.id) +' , name: ' + colors.green(results.name)) ;
                    setAckRequest(err, msg, ch, connection);
                });
            }
            break;
            
        case 'give_k':
        	if (results.type == 'deleteMQ') {
        		K_Even.mongoDelete(results.id[0], function(err) {
                    !err ? console.log('Delete error k event -- id: ' + colors.red(results.id[0]))
                    : console.log('Delete success k event -- id: ' + colors.green(results.id[0])) ;
                    setAckRequest(err, msg, ch, connection);
                });
            } else {
            	K_Even.mongoSave(results, function(err) {
                    !err ? console.log('Error k event -- id: ' + colors.red(results.id))
                    : console.log('Success k event -- id: ' + colors.green(results.id)) ;
                    setAckRequest(err, msg, ch, connection);
                });
            }
            break;

        case 'notify_content':
            notify_content.mongoSave(results, function(err) {
                !err ? console.log('Error notify content -- id: ' + colors.red(results.id))
                : console.log('Success notify content -- id: ' + colors.green(results.id)) ;
                setAckRequest(err, msg, ch, connection);
            })
            break;

        case 'send_notify':
            ControlUser.updateNotifyMessFromRabbit(results, function(err) {
                !err ? console.log('Error send notify customer -- id: ' + colors.red(results.notify_id))
                : console.log('Success send notify customer -- id: ' + colors.green(results.notify_id)) ;
                setAckRequest(err, msg, ch, connection);
                });
            break;
    }

}

var closeOnErr = function(err, connection) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    connection.close();
    return true;
}
