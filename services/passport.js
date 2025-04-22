//fra Example A.279. Passport Config, config/passport.js

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Load User model
const User = require('../models/User');

module.exports = async function(passport) {
    await passport.use(
        new  LocalStrategy({
            usernameField: 'uid'
        }, async function (uid, password, done) {
        // Match user
        await User.findOne({ email: uid })
            .then(function (user) {
                if (!user) {
                    return done(null, false, { message: 'Incorrect user or password' });
                }
                // Match password
                    bcrypt.compare(password, user.password, function (err, isMatch) {
                        if (err) throw err;
                            if (isMatch) {
                                return done(null, user);
                            } else {
                                return done(null, false, { message: 'Incorrect user or password' });
                            }
                        });

            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id, user.role);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};