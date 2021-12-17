const mongoose = require('mongoose'), Schema = mongoose.Schema;
//This is the regional location of a players map.

const maplocation = mongoose.Schema({
	region: {
		type: Schema.Types.ObjectId,
		ref: "Region",
		default: '61bc6470af6fd03fd1fe865c'
	},
	map: {
		type: String
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
	}
});

module.exports = mongoose.model('Maplocation', maplocation);