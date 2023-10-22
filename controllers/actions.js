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

exports.handler = async function(userID, data) {
	let action;
	try {
		//look up the unit and look up its abilities to validate that the ability is available
		let obj = JSON.parse(data);
		action = obj.action;
		const regex = /[A-Za-z]/;

		if(regex.test(action.category) && regex.test(action.name)) {
		
			let func = action.category + '.' + action.name + '( userID, data )';
			eval(func);
			}
		} catch (err){
			console.log(err);
	}
}