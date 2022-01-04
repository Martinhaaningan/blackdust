const mongoose = require('mongoose'), Schema = mongoose.Schema;
//This is the regional location of a players map.

const maplocation = mongoose.Schema({
	map: {
		type: String
	},
	_x: {
		type: Number
	},
	_y: {
		type: Number
	},
	_z: {
		type: Number
	}
});

module.exports = mongoose.model('Maplocation', maplocation);