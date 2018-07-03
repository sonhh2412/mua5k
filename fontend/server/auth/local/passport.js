var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');

exports.setup = function(User, config) {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password' // this is the virtual field on the model
        },
        function(email, password, done) {
            User.findOne({
                $or : [
                    { email: email.toLowerCase()},
                    { telephone : email.toLowerCase()}
                ]
                
            }, function(err, user) {
                if (err) return done(err);
                
                if (!user) {
                    return done(null, false, { err: 'email', message: 'Email chưa được đăng ký !' });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, { err: 'passwd', message: 'Mật khẩu không chính xác !' });
                }

                return done(null, user);
            });
        }
    ));
};