const mongoose = require('mongoose');
const userModel = require('../models/User');
const mapModel = require('../models/Map');
const tileModel = require('../models/Tiles');
const unitModel = require('../models/Unit');

const maps = require('../controllers/maps');
const init = require('../controllers/init');
const users = require('../controllers/users');
const units = require('../controllers/units');
const moves = require('../controllers/moves');
const actions = require('../controllers/actions');

const availableFunctions = new Map();
//Any controller function that needs to be run dynamically should be registered here

availableFunctions.set('maps.tetherFlare', maps.tetherFlare);
availableFunctions.set('moves.move', moves.move);

exports.handler = async function(userId, data) {
	let action;
	try {
		//look up the unit and look up its abilities to validate that the ability is available
		let obj = JSON.parse(data);
		action = obj.action;
		const regex = /[A-Za-z]/;
		//when we create a abilitiesModel we can change this to check if the ability is available to the unit
		//then find the ability and use the string category and name from there instead
		let filter = {$and: [{_id: obj.unit._id}, {"abilities.name": action.name}, {"abilities.category": action.category} ]};
		let actionExists = await unitModel.exists(filter);

		const functionToCall = availableFunctions.get(`${action.category}.${action.name}`);
		if(regex.test(action.category) && regex.test(action.name) && actionExists ) {
			functionToCall(userId, data);
			}
		else (console.log(action.category + '.' + action.name + ': No such action exists'));

		} catch (err){
			console.log(err);
	}
}