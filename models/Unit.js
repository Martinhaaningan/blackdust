const mongoose = require('mongoose'), Schema = mongoose.Schema;

const unit = mongoose.Schema({
	key: {
		type: Number,
		required: true
	},
	atlas: {
		type: String,
		required: true
	},
	owner: {
		type: String,
		default: null
	},
	_x: {
		type: Number,
		required:true
	},
	_y: {
		type: Number,
		required:true
	},
	_z: {
		type: Number,
		required:true
	},

});

module.exports = mongoose.model('Unit', unit);