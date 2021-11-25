const mongoose = require('mongoose');

const user = mongoose.Schema({
	email: {
		type: String,
		required:true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	profile: {
		type: String,
		enum: ['unverified','verified', 'admin'],
		default: 'admin'
	},
	created: {
	type: Date,
	default: Date.now
	}

});

module.exports = mongoose.model('User', user);