const mongoose = require('mongoose'), Schema = mongoose.Schema;

const tiles = mongoose.Schema({
	map: {
		type: Schema.Types.ObjectId,
		ref: "Map",
		required:true
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
	terrain: {
		type: Number,
		required:true,
		default: null
	},	
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