const mongoose = require('mongoose');
const userModel = require('../models/User');
const mapModel = require('../models/Map');

exports.getEmail = async function(Id) {
	let user = await userModel.findById({_id: Id});
	return user.email;
}

function hexCell (x,y,z,terrain){
this._x = x;
this._y = y; 
this._z = z;
this.terrain = terrain;
}

//Vi kan køre initGrid i backenden, gemme det grid array i databasen og sende gridArray via socketIO
function initGrid (mapSize){
  mapSize = Math.max(1,mapSize);
  let gridArray = [];
  let cnt = 0;
  for(let i = -mapSize; i < mapSize +1; i += 1) {
    for(let j = -mapSize; j < mapSize +1; j += 1) {
      for(let k = -mapSize; k < mapSize +1; k += 1) {
        if (i + j + k == 0) {
        	let terrain;
        	if (i == 0 && j == 0 && k == 0 ) {
        		terrain = 0;
        	} else {
        		terrain = Math.floor(Math.random()* 4 + 1);
        	}
        	
          gridArray.push(new hexCell(i, j, k, terrain));
          cnt += 1;
        }
      }
    }
  }
  return gridArray;
}

exports.getMap = async function(Id) {
	let user = await userModel.findById({_id: Id});
	let map = await mapModel.findOne({owner: user._id});

	if (map === null) {
		console.log("No map was found for the user. A new map is being generated.");
		const map = new mapModel({
			owner: user._id,
			capital: "my base",
			tiles: initGrid(1)	
		});
		map.save();
	}
	return map;
}

