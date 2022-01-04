const mongoose = require('mongoose'), Schema = mongoose.Schema;

const tiles = mongoose.Schema({
	sharedBy: {
		type: Array,
		default: []
	},
	map: {
		type: Schema.Types.ObjectId,
		ref: "Map",
		required:true
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
		required:true
	},
	created: {
	type: Date,
	default: Date.now
	}
});

module.exports = mongoose.model('Tiles', tiles);