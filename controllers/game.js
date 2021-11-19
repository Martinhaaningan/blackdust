const mongoose = require('mongoose');
const userModel = require('../models/User');

exports.getEmail = async function(Id) {
	let user = await userModel.findById({_id: Id});
	return user.email;
}