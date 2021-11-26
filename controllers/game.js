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
   for(let key in obj){
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
			tiles: initGrid(1),
			size: 2	
		});
		map.save();
	}
	return map;
}

function getNeighbors(hex) {
  var vectors = [
    {x: 1,y: 0,z: -1}, {x: 1,y: -1,z: 0}, {x: 0,y: -1,z: 1},
    {x: -1,y: 0,z: 1}, {x: -1,y: 1,z: 0}, {x: 0,y: +1,z: -1} 
    ];
  let neighbors = [];
  for (let i in vectors) {
  	let vector = Object.values(vectors[i]);
  	let val = Object.values(hex);
  	let neighbor = {_x: val[0] + vector[0], _y: val[1] + vector[1], _z: val[2] + vector[2]};

    neighbors.push(neighbor); 
  }
  return neighbors;
}

function checkIfExists(hex, map){

  for (let l in map) {
  	console.log(hex);
  	console.log(map);
    if (map._x === hex._x && map._y === hex._y && map._z === hex._z) {
      return true;
     }
   }
}

exports.rollNewTile = async function(Id, coords) {
	let user = await userModel.findById({_id: Id});
	let map = await mapModel.findOne({owner: user._id});

	let tile = JSON.parse(coords);

	let tileExists = await mapModel.exists({$and: [{tiles: tile}, {owner: user._id}]});

	if(!tileExists) {

		// for (let i in map.tiles) {
		// 	console.log(Object.values(findHighest(map.tiles[i].hexCell)));
		// 	 map.size = Object.values(findHighest(map.tiles[i].hexCell))[0] + 1;
		// }
		tile.terrain = Math.floor(Math.random()* 4 + 1);
		map.tiles.push(tile);

		let newMap = await mapModel.findOneAndUpdate({owner: user._id}, map, {new: true});

		return tile;
	}
	
}

