const mongoose = require('mongoose'), Schema = mongoose.Schema;

const terrain = mongoose.Schema({
	key: {
		type: Number,
		required: true
	},
	atlas: {
		type: String,
		required: true
	}
});

const slot = mongoose.Schema({
	size: {
		type: String,
		required: true
	},
	building:{
		type: Object,
		default: null
	} 
});

const resource = mongoose.Schema({
	amount: {
		type: Number,
		required: true
	},
	name: {
		type: String,
		required: true
	}
});

const tiles = mongoose.Schema({
	map: {
		type: Schema.Types.ObjectId,
		ref: "Map",
		required:true
	},
	owner: {
		type: String,
		default: "Unclaimed"
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
	elevation: {
		type: Number,
		required: true
	},
	slots: [slot],
	terrain: terrain,
	resources: [resource],	
	sharedBy: {
		type: Array,
		default: []
	},
	created: {
	type: Date,
	default: Date.now
	}
});

module.exports = mongoose.model('Tiles', tiles);