const mongoose = require('mongoose');

const map = mongoose.Schema({
	owner: {
		type: String
	},
	capital: { //Navn på hovedstad
		type: String,
		required: true
	},
	region: { 
		type: String,
		default: null
	},
	created: {
	type: Date,
	default: Date.now
	},
	tiles: {
		type: Object //array med objectIDs på alle tiles tilhørende det pågældende map
	},
	width: {
		type: Number,
		default: 1
	}

});

module.exports = mongoose.model('Map', map);