const mongoose = require('mongoose');

const userModel = require('../models/User');
const mapModel = require('../models/Map');
const tileModel = require('../models/Tiles');
const unitModel = require('../models/Unit');

exports.move = async function(userId, data) {
	let user = await userModel.findById({_id: userId});

	let unit;
	try {
		let obj = JSON.parse(data);	

		let filter = {$and: [{owner: user._id}, {unit: obj.unit._id }, {_x: obj.unit._x}, {_y: obj.unit._y}, {_z: obj.unit._z}]};
		let unit = await unitModel.findOne(filter);
		console.log(unit);
		let map = await mapModel.findOne({owner: user._id});
		//check if the obj.coords targeted tile exists and is valid 
		
		filter = {$and: [{map: map._id }, {_x: obj.coords._x}, {_y: obj.coords._y}, {_z: obj.coords._z}]};
		let tileExists = await tileModel.exists(filter);
		if (unit && tileExists) {
			let update = {_x: obj.coords._x, _y: obj.coords._y, _z: obj.coords._z};
			unit = await unitModel.findByIdAndUpdate(unit._id, update);
			return unit;
			}

		} catch (err){
			console.log(err);
		}

	}