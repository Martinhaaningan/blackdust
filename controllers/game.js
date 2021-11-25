const mongoose = require('mongoose');
const userModel = require('../models/User');
const mapModel = require('../models/Map');

exports.getEmail = async function(Id) {
	let user = await userModel.findById({_id: Id});
	return user.email;
}

function hexCell (x,y,z){
this._x = x;
this._y = y; 
this._z = z;
}
function tile (hexCell, terrain){
	this.hexCell = hexCell;
	this.terrain = terrain;
}
//https://www.tutorialspoint.com/returning-the-highest-number-from-object-properties-value-javascript
const findHighest = function(obj) {
   const values = Object.values(obj);
   const max = Math.max.apply(Math, values);
   for(key in obj){
      if(obj[key] === max){
         return {
            [key]: max
         };
      };
   };
};

//Vi kan køre initGrid i backenden, gemme det grid array i databasen og sende gridArray via socketIO
function initGrid (mapSize){
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
  console.log(gridArray);
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

exports.rollNewTile = async function(Id, coords) {
	let user = await userModel.findById({_id: Id});
	let map = await mapModel.findOne({owner: user._id});

	let tile = JSON.parse(coords);
	console.log("JSON was parsed ", tile);

	let tileExists = await mapModel.exists({$and: [{tiles: tile}, {owner: user._id}]});
	console.log(tileExists);
	if(!tileExists) {
		// let width;
		// for (let i in map.tiles.hexCell) {
		// 	console.log(map.tiles.hexCell[i]);
		// 	width = findHighest(map.tiles.hexCell[i]);
		// }
		// console.log(width);
		tile.terrain = Math.floor(Math.random()* 4 + 1);
		map.tiles.push(tile);
		console.log(map);

		let newMap = await mapModel.findOneAndUpdate({owner: user._id}, map, {new: true});
		console.log(newMap);
		return newMap;
	}
	
}

