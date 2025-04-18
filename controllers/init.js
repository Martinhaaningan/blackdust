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

exports.createMap = async function (Id) {
    console.log("No map was found for the user. A new map is being generated.");
    let user = await userModel.findById({_id: Id});
    let map = new mapModel({
      owner: Id,
      capital: "my base"
    });
    await map.save();

    let newMap = await mapModel.findOne({owner: Id});

    let grid = createGrid(1);
    for (let t in grid) {

      let tile = new tileModel({
      map: newMap._id,
      _x: grid[t]._x,
      _y: grid[t]._y,
      _z: grid[t]._z,
      owner: user.name,
      elevation: roll(3),
      terrain: {
        key: roll(5),
        atlas: "tileAtlas"
      },
      resources: [],
      slots: []
      });
      await tile.save();
    }
}