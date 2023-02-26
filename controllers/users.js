const userModel = require('../models/User');

exports.getUser = async function(Id) {
	let user = await userModel.findById(Id);
	return {name: user.name};
}