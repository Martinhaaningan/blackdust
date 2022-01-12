const bcrypt = require('bcrypt');
const passport = require('passport');
const mongoose = require('mongoose');
const saltRounds = 10;
const formidable = require('formidable');
const userModel = require('../models/User');

exports.postRegister = async function (req, res, next) {

	let form = new formidable.IncomingForm();
    form.parse(req, async function(err, fields, files) {
        if (err) {console.error(err);}

	    let {name, email, password, passwordr } = fields;
	    let errors = [];

	    if (!name || !email || !password || !passwordr) {
	        errors.push({ msg: 'Please enter all fields' });
	    }

	    if (password != passwordr) {
	        errors.push({ msg: 'Passwords do not match' });
	    }

	    if (password.length < 6 ) {
	        errors.push({ msg: 'Password must be at least 6 characters' });
	    }

	    let userExists = await userModel.exists({$or: [{email: email}, {name: name}]});

	    if (userExists) {
	    	errors.push({ msg: 'The name or email is already claimed' });
	    } 

	    if (errors.length > 0) {
	        res.render('register', {
	            errors,
	            name,
	            email,
	            password,
	            passwordr
	        });
	    } else {
			const newUser = new userModel({
				name,
				email,
				password
			});

			bcrypt.hash(newUser.password, saltRounds, 
				async function(err, hash){
				if (err) throw err;
				newUser.password = hash;
				newUser.save().then(success => {
					req.flash('success_msg','You are now registered.');
					res.redirect('/');
				}).catch(err => console.log(err));

			});
		}
	});
}

exports.postLogin = async function (req, res, next) {
    let user = await userModel.findOne({email: req.body.email});
    passport.authenticate('local', {
        successRedirect: '/', 
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next); 
};

exports.logout = function (req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
};
