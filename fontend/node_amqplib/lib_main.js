"use strict";

var amqp = require('amqplib/callback_api');
var workers = require('./lib_worker');
var publisher = require('./lib_publisher');
var _ = require('lodash');
var colors = require('colors/safe');
//config

var objworkers = {
    product_public_category: 'product_public_category',
    product_product: 'product_product',
    product_brand: 'product_brand',
    country: 'country',
    inventory: 'inventory',
    product_price: 'product_price',
    state: 'state',
    product_hot: 'product_hot',
    product_session : 'product_session',
    customer : 'customer',
    product_convert : 'product_convert',
    odoo_change_Knumber : 'odoo_change_Knumber',
    odoo_order_dial : 'odoo_order_dial',
    odoo_order_state : 'odoo_order_state',
    give_k : 'give_k',
    notify_content: 'notify_content',
    send_notify: 'send_notify',

}

process.host_amqp = 'amqp://10k:admin123!@localhost/mua68';

function start() {
    amqp.connect(process.host_amqp, function(err, conn) {
        if (err) {
            // if the connection is closed or fails to be established at all, we will reconnect
            console.error("[AMQP]", err.message);
            return setTimeout(start, 1000);
        }
        conn.on("error", function(err) {

            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        });
        conn.on("close", function() {
            // if the connection is closed or fails to be established at all, we will reconnect
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 1000);
        });
        console.log("[AMQP] connected");

        _.each(objworkers, function(key, value) {
            objworkers.hasOwnProperty(key) && workers.startWorker(key, conn);
        });
    });
};

//cal method start

start();