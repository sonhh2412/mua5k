'use strict';

module.exports = function(socket) {
    setInterval(function() {
    	var dateNow = new Date();
        socket.emit('send:time', {
        		timer: dateNow.toString().split(' ')[4].split(':'),
        		datenow: dateNow.getTime(),
    		}
    	);
    }, 1000);
};