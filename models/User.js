const mongoose = require('mongoose'), Schema = mongoose.Schema;

const user = mongoose.Schema({
	name: {
		type: String,
		required:true,
		unique: true
	},
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