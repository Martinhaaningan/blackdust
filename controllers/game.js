const mongoose = require('mongoose');
const userModel = require('../models/User');
const mapModel = require('../models/Map');
const tileModel = require('../models/Tiles')

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

  let cnt = 0;
  for(let i = -mapSize; i < mapSize +1; i += 1) {
    for(let j = -mapSize; j < mapSize +1; j += 1) {
      for(let k = -mapSize; k < mapSize +1; k += 1) {
        if (i + j + k == 0) {
          gridArray.push(new hexCell(i, j, k));
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
		
		//get tile, add to map
		if (map !== null) {
			let tiles = await tileModel.find({map: map._id});
			//problem her
			map.tiles = tiles;
			}
		} catch (err){
			console.log(err);
	}

	return map;
}

exports.createMap = async function (Id) {
		console.log("No map was found for the user. A new map is being generated.");
		let map = new mapModel({
			owner: Id,
			capital: "my base"
		});
		await map.save();

		let newMap = await mapModel.findOne({owner: Id});

		let grid = createGrid(1);
		let tiles = [];

		for (let t in grid) {

			let tile = new tileModel({
			map: newMap._id,
			_x: grid[t]._x,
			_y: grid[t]._y,
			_z: grid[t]._z,
			terrain: Math.floor(Math.random()* 4 + 1)
			});
			await tile.save();
		}
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
	let filter = {$and: [{map: map._id }, {_x: tile._x}, {_y: tile._y}, {_z: tile._z}]};
	let tileExists = await tileModel.exists(filter);
	if(!tileExists) {
		let newTile = new tileModel({
			map: map._id,
			_x: tile._x,
			_y: tile._y,
			_z: tile._z,
			terrain: Math.floor(Math.random()* 4 + 1)
			});
			await newTile.save();
		return newTile;
	}
	
}

