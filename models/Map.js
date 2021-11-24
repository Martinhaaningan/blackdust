const mongoose = require('mongoose');

const map = mongoose.Schema({
	owner: {
		type: Schema.Types.ObjectId, 
        ref: "User",  //ObjectID på brugeren som ejer map
		required:true
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
		type: Array //array med objectIDs på alle tiles tilhørende det pågældende map
	}

});

module.exports = mongoose.model('Map', map);