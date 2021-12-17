const mongoose = require('mongoose'), Schema = mongoose.Schema;

const map = mongoose.Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	capital: { //Navn på hovedstad
		type: String,
		required: true
	},
	region: { 
		type: Schema.Types.ObjectId,
		ref: "Region",
		default: '61bc6470af6fd03fd1fe865c'
	},
	created: {
	type: Date,
	default: Date.now
	},
	tiles: {
		type: Array,
		default: null
	}

});

module.exports = mongoose.model('Map', map);