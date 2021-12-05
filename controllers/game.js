const mongoose = require('mongoose');
const userModel = require('../models/User');
const mapModel = require('../models/Map');


function hexCell (x,y,z){
this._x = x;
this._y = y; 
this._z = z;
}
function tile (hexCell, terrain){
	this.hexCell = hexCell;
	this.terrain = terrain;
}


//Vi kan køre initGrid i backenden, gemme det grid array i databasen og sende gridArray via socketIO

function createGrid (mapSize){
  mapSize = Math.max(1,mapSize);
  let gridArray = [];
  let terrain = "";
  let cnt = 0;
  for(let i = -mapSize; i < mapSize +1; i += 1) {
    for(let j = -mapSize; j < mapSize +1; j += 1) {
      for(let k = -mapSize; k < mapSize +1; k += 1) {
        if (i + j + k == 0) {
        	let terrain = {};
        	if (i == 0 && j == 0 && k == 0 ) {
        		terrain = 0;
        	} else {
        		terrain = Math.floor(Math.random()* 4 + 1);
        	}
          gridArray.push(new tile(new hexCell(i, j, k), terrain));
          cnt += 1;
        }
      }
    }
  }
  return gridArray;
}

exports.getMap = async function(Id) {
	let map;
	try {
		map = await mapModel.findOne({owner: Id});
		} catch (err){
			console.log(err);
	}
	if (map === null) {
		console.log("No map was found for the user. A new map is being generated.");
		map = new mapModel({
			owner: Id,
			capital: "my base",
			tiles: createGrid(1)
		});
		map.save();
	}
	return map;
}


exports.rollNewTile = async function(Id, coords) {
	let user = await userModel.findById({_id: Id});
	let map = await mapModel.findOne({owner: user._id});

	let tile;
	try {
		tile = JSON.parse(coords);
		} catch (err){
			console.log(err);
	}
	let tileExists = await mapModel.exists({$and: [{tiles: tile}, {owner: user._id}]});
	if(!tileExists) {
		tile.terrain = Math.floor(Math.random()* 4 + 1);
		map.tiles.push(tile);
		let newMap = await mapModel.findOneAndUpdate({owner: user._id}, map, {new: true});
		return tile;
	}
	
}

