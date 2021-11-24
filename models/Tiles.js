const mongoose = require('mongoose');

const tiles = mongoose.Schema({
	x: {
		type: Number 
	},
	y: {
		type: Number 
	},
	z: {
		type: Number
	},
	terrain: {
		type: Number
	},
	created: {
	type: Date,
	default: Date.now
	}
});

module.exports = mongoose.model('Tiles', tiles);