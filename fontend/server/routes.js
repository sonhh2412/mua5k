/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

    // Insert routes below
    
    app.use('/api/category', require('./api/category'));

    app.use('/api/products', require('./api/product'));

    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));

    app.use('/api/address', require('./api/address'));

    app.use('/api/brand', require('./api/brand'));

    app.use('/api/forum', require('./api/forum'));
    
    app.use('/api/help', require('./api/help'));

    app.use('/api/banner', require('./api/banner'));

    app.use('/api/news', require('./api/news'));
    
    app.use('/api/checkount', require('./api/checkount'));

    app.use('/api/hook', require('./api/hook'));

    app.use('/api/sharing', require('./api/sharing'));

    app.use('/api/order', require('./api/order'));

    app.use('/api/system_parameter', require('./api/system_parameter'));

    
    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    
    app.route('/*').get(function(req, res) {
        res.sendFile(path.resolve(app.get('appPath') + '/template/index.html'));
    });

    // app.route('/nganluong_865e32c80e30a725ccd069f66eeaa2eb.html').get(function(req, res) {
    //     res.sendFile(path.resolve(app.get('appPath') + '/template/verify.html'));
    // })


};