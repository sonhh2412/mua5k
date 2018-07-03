/**
 * Socket.io configuration
 */
'use strict';

var config = require('./environment');

// When the user disconnects.. perform this
function onDisconnect(socket) {}

// When the user connects.. perform this
function onConnect(socket) {
    socket = socket;
    // When the client emits 'info', this listens and executes
    socket.on('info', function(data) {
        // console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
    });

    process.socket = socket;
    require('../api/sever_time/sever.time.socket')(socket);
    require('../../node_amqplib/node_mongodb/product_history_selled/socket.product.history.selled')(socket);
    require('../../node_amqplib/node_mongodb/product_session_lottery/socket.product_session.lottery')(socket);

}



module.exports = function(socketio) {

    socketio.on('connection', function(socket) {

        socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

        socket.connectedAt = new Date();

        // Call onDisconnect.
        socket.on('disconnect', function() {
            onDisconnect(socket);

        });

        // Call onConnect.
        onConnect(socket);
        // console.log(socket[0]);
        // console.info('[%s] CONNECTED', socket.address);
    });
};