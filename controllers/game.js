const mongoose = require('mongoose');
const userModel = require('../models/User');
const mapModel = require('../models/Map');
const tileModel = require('../models/Tiles');

function hexCell (x,y,z){
this._x = x;
this._y = y; 
this._z = z;
}
function tile (hexCell, terrain){
	this.hexCell = hexCell;
	this.terrain = terrain;
}

function roll(s) {
	return Math.floor(Math.random()*s);
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
//tiles from the db are allways local, maplocations are always regional
function getRegional (location, tile){
	let regx = location._x + tile._x;
	let regy = location._y + tile._y;
	let regz = location._z + tile._z;
	return {_x: regx, _y: regy, _z: regz}
}

function getLocal (location, tile){
	let localx = (location._x - tile._x) * -1;
	let localy = (location._y - tile._y) * -1;
	let localz = (location._z - tile._z) * -1;
	return {_x: localx, _y: localy, _z: localz}
}

exports.getMap = async function(Id) {
	let map;
	try {
		map = await mapModel.findOne({owner: Id});
		
		//get tile, add to map
		if (map !== null) {
			let localTiles = await tileModel.find({map: map._id});
			let sharedTiles = await tileModel.find({sharedBy: [map._id]});

			for (let t in sharedTiles){
				let sharedMap = await mapModel.findOne({map: sharedTiles[t].map._id});
				let regional = getRegional(sharedMap, sharedTiles[t]);
				let local = getLocal(map.location, regional);
				sharedTiles[t]._x = local._x;
				sharedTiles[t]._y = local._y;
				sharedTiles[t]._z = local._z;
			}
			let tiles = []; 
			map.tiles = tiles.concat(localTiles, sharedTiles);
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
			terrain: roll(4) +1
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
	//the map.location has a key set of coordinates, 
		//that point to the location of a players map in the region 
	
	//with the map.location we can find regional coordinates for a tile
	let regional = getRegional(map.location, tile);

	//find the tile in other maps by getting all maplocations excluding players map
	let maps = await mapModel.find({map: {$nin: map._id}}); 
		//Note: this filter needs to be refined as more maps are added

	//and then finding the local coodinate for the given tile at each maps location
	for (let m in maps) {
		let local = getLocal(maps[m].location, regional);

		//we now check if a tile with the local coordinates exists in that map 
		let filter = {$and: [{map: maps[m]._id }, {_x: local._x}, {_y: local._y}, {_z: local._z}]};
		let tileExists = await tileModel.exists(filter);

		//if the tile is found then we need to add it to the sharedBy array in DB  
			//so that when we getMap for that user we can send it to the client
			//we then return the tile so that it can be received by the client
		let update = {sharedBy: map._id};
		if (tileExists) {
			let sharedTile = await tileModel.findOneAndUpdate(filter, update);
			let newLocal = getLocal(map.location, regional);

			sharedTile._x = newLocal._x;
			sharedTile._y = newLocal._y;
			sharedTile._z = newLocal._z;
			return sharedTile;
		}
	}
	

	//find a tile from your own map
	filter = {$and: [{map: map._id }, {_x: tile._x}, {_y: tile._y}, {_z: tile._z}]};
	tileExists = await tileModel.exists(filter);

	//if all of the above checked out then we will create and save a new tile
	if(!tileExists) {
		let newTile = new tileModel({
			map: map._id,
			_x: tile._x,
			_y: tile._y,
			_z: tile._z,
			terrain: roll(4) +1
			});
		await newTile.save();
		return newTile;
	}
	
}

function getMapSize(gridArray) {
  let xs = [];
  let ys = [];
  let zs = [];
  for(let t in gridArray) {
   xs.push(Math.abs(gridArray[t]._x)*100/100);
   ys.push(Math.abs(gridArray[t]._y)*100/100);
   zs.push(Math.abs(gridArray[t]._z)*100/100);
  }

  let size = [];
  size.push(xs.reduce(function(a, b) {
    return Math.max(a, b); 
  }, 0));
	size.push(ys.reduce(function(a, b) {
    return Math.max(a, b);
	}, 0));
	size.push(zs.reduce(function(a, b) {
    return Math.max(a, b);
	}, 0));
  return size; 
}



function rollCoord(s,umd,nmd,keys){
			
			let coord = nmd[s] + umd[s] + roll(2)+1;

			let n = Boolean(roll(2));
			if (!n) { //Should the coordinate stay positive? True or false?
				coord = -Math.abs(coord);
			}
			let newKey = keys.splice(s,1);
			nmd.splice(s,1);
			umd.splice(s,1);
			return {[newKey]: coord};
}

async function rollLocation(uTiles, locations) {
	let umd = getMapSize(uTiles); //The max distance of [x,y,z] for the users map
	let neighbor = locations[roll(locations.length)]; //Roll a neighbor that exists in the region

	let nTiles =  await tileModel.find({map: neighbor._id}); 

	let nmd = getMapSize(nTiles); //The max distance of [x,y,z] for the neighbors map
	let keys = ['_x','_y','_z'];

	let newCoords = {};
	Object.assign(newCoords, rollCoord(roll(3),umd,nmd,keys));

	Object.assign(newCoords, rollCoord(roll(2),umd,nmd,keys));
		 	
	let last = Object.values(newCoords);
	Object.assign(newCoords, {[keys]: (last[0]+last[1]) * -1});
	return newCoords;
}

async function buildRegion(maps){

	let region = [];
	for (let m in maps) {
		maps[m].tiles = await tileModel.find({map: maps[m]._id});

		for (let t in maps[m].tiles) {
			let regional = getRegional(maps[m].location, maps[m].tiles[t]);
			region.push(regional);
		}
	}
	return region;
}

function isMatch(arr, val){
	return arr.some(function(arrVal){
		if (val._x === arrVal._x && val._y === arrVal._y && val._z === arrVal._z){
			return true;
		}
	})
}

function checkLocation (newCoords,uTiles,region){
	let isValid;
	for (let t in uTiles) {
		let regional = getRegional(newCoords, uTiles[t]);
		
		if (isMatch(region, regional)){
			isValid = false;
			break
		} else {
			isValid = true;
		}

		//if this is true the tile exists in the region 
			//and we should therefore return false
	}
	return isValid;
}

exports.addToRegion = async function (Id) {
	let user = await userModel.findById({_id: Id});
	let map = await mapModel.findOne({owner: user._id});
	

	if (map.location === null){
		
 		let maps = await mapModel.find({location: {$ne: null}});
 		let region = await buildRegion(maps); //here

	 	if (maps.length < 1) {
	 		
	 		await mapModel.updateOne({owner: user._id}, {location: {_x: 0, _y: 0, _z: 0}});
	 	}

		if (maps.length >= 1) {
			let newCoords;
			let uTiles = await tileModel.find({map: map._id});
		 	//here check newCoords for distance to other maps
		 	let isValid = false;
		 	while (!isValid) {
		 		newCoords = await rollLocation(uTiles, maps);
		 		//newCoords = {_x:-3, _y:7, _z:-4};
		 		isValid = checkLocation(newCoords, uTiles, region);
		 	}
			
			let update = {location: {
				_x: newCoords._x,
				_y: newCoords._y,
				_z: newCoords._z}
			};

			await mapModel.updateOne({owner: user._id}, update);

		}
	}
}
