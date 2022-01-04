const mongoose = require('mongoose'), Schema = mongoose.Schema;

const location = mongoose.Schema({
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
	}
});

const map = mongoose.Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	capital: { //Navn på hovedstad
		type: String,
		required: true
	},
	created: {
	type: Date,
	default: Date.now
	},
	tiles: {
		type: Array,
		default: null
	},
	location: {
		location,
		type: Object,
		default: null
	}

});

module.exports = mongoose.model('Map', map);