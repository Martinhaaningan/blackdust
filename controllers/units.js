const mongoose = require('mongoose');
const userModel = require('../models/User');
const unitModel = require('../models/Unit');

exports.createUnit = async function(Id) {
	let user = await userModel.findById({_id: Id});

	let unit = new unitModel({
		key: 1,
		atlas: 'unitAtlas',
		owner: user._id,
		_x: 0,
		_y: 0,
		_z: 0,
		abilities: [{
			type: 'ability',
			category: 'moves',
			name: 'move',
			label: 'Move',
			cost: 5,
			range: 1,
			desc: 'Moves the unit to the targeted tile.'
			},
			{
			type: 'spell',
			category: 'maps',
			name: 'tetherFlare',
			label: 'Tether flare',
			cost: 10,
			range: 2,
			desc: 'Launches a rocket loaded with tether at the targeted tile.'
			}],
		initiative: 20,
		mana: 10
	});

	await unit.save();
};