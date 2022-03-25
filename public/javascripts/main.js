'use strict'
import {Loader} from './modules/loader.js';
import {Renderer} from './modules/renderer.js';
import {Interface} from './modules/interface.js';
import {Events} from './modules/events.js';
import {$, drawAt} from './modules/common.js';
import {Animations} from './modules/animations.js';
var Game = {};

let svg = $('svg');
svg.addEventListener('click', function(event){
  if (event.target !== event.currentTarget) {
    return};
    let wrap = $('main-wrapper');
    let info = $('tileInfo');
    if (info !== null){
    wrap.removeChild(info);
  }
});

//the game object

Game.spells = ["Tether flare"];
Game.spells.activeSpell = null;
Game.resources = {tether: 1000, resource1: 0, resource2: 0, resource3: 0, resource4: 0};

Game.load = function () {
    return [
        Loader.loadImage('tiles', './images/tiles.png'),
        Loader.loadImage('buildings', './images/buildings.png'),
        Loader.loadImage('dust', './images/dust.png')
    ];
};
Game.animate = function () {
  setInterval(function(){
    Game.update();
  }, 1000/30);
};

Game.update = function () {
  Game.ctx.clearRect(0,0,Game.board.size[0],Game.board.size[1]);
  for (let i in Game.map.tiles) {
    let target = drawAt(Game.map.tiles[i]._x, Game.map.tiles[i]._y, Game.map.tiles[i]._z, Game.board.size);
    if (Game.map.tiles[i].terrain !== null) {
      Renderer.drawCanvas(Game.ctx, Game.map.tiles[i].terrain, Game.tileAtlas, target);
    }
    if (Game.map.tiles[i].terrain === null) {
      Animations.dust(Game.ctx, target, Game.dust);
    }
  }
}

Game.setBoard = function (gridArray) {
    let mapSize = Game.getMapSize(gridArray);

    this.board = $('board');
    this.svg = $('svg');
    this.ui = $('ui-wrapper');

    let mapWidth = mapSize[0] * 2 * 200; 
    let mapHeight = mapSize[1] * 2 * 200;

    let body = $("body");
    let width = body.clientWidth;
    let height = body.clientHeight;

    if (mapWidth > width ) {
      width = mapWidth + 160;
    }
    if (mapHeight > height ) {
      height = mapHeight + 160;
    }
    this.board.setAttribute("width", width);
    this.board.setAttribute("height", height);
    this.board.style.backgroundColor = "black";
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);

    Game.board.size = [width,height];
};

function getNeighbors(tile) {
  var vectors = [
    {x: 1,y: 0,z: -1}, {x: 1,y: -1,z: 0}, 
    {x: 0,y: -1,z: 1}, {x: -1,y: 0,z: 1}, 
    {x: -1,y: 1,z: 0}, {x: 0,y: +1,z: -1} 
    ];
  let neighbors = [];
  for (let i in vectors) {
    let vector = Object.values(vectors[i]);
    let val = Object.values(tile);
    let neighbor = {_x: tile._x + vector[0], _y: tile._y + 
      vector[1], _z: tile._z + vector[2]};
    neighbors.push(neighbor); 
  }
  return neighbors;
};

function checkIfExists(tile, tiles){

  for (let l in tiles) {
    if (tiles[l]._x === tile._x && tiles[l]._y === tile._y && tiles[l]._z === tile._z) {
      return true;
     }
   }
};
//tag kun naboer med og check på dem. Tilføj det pågældende tile bagefter

function initGrid (tiles){

  for (let t in tiles) {
    let neighbors = getNeighbors(tiles[t]);
      for (let n in neighbors) {
        let found = checkIfExists(neighbors[n], tiles);
        if (!found) {
          neighbors[n].terrain = null;
          tiles.push(neighbors[n]);
        }
      }
  }
  return tiles;
};

Game.makeNewNeighbors = function(newTile, tiles){
  let neighbors = getNeighbors(newTile);
  let newTiles = [];
    for (let n in neighbors) {
      let found = checkIfExists(neighbors[n], tiles);
        if (!found) {
          neighbors[n].terrain = null;
          newTiles.push(neighbors[n]);
        }
      }
  return newTiles;
};





Game.getMapSize = function(gridArray) {
  let size = [0,0];
  for(let t in gridArray) {
   let y = Math.abs(gridArray[t]._y)*100/100;
   let x = Math.abs(gridArray[t]._x)*100/100;
     if (y > size[1]) {
     size[1] = y;
    }
    if (x > size[0])
      size[0] = x;
  }
  return size; 
};

function selectCard(){
  let card = event.target || event.srcElement;
  let id = card.getAttribute('id');
  card.style.zIndex = 1;
};

Game.prepareTile = function(newTile){

  for (let l in Game.map.tiles) {
    if (Game.map.tiles[l]._x === newTile._x 
      && Game.map.tiles[l]._y === newTile._y 
      && Game.map.tiles[l]._z === newTile._z) {
      Game.map.tiles[l].terrain = newTile.terrain;
      Game.map.tiles[l].owner = newTile.owner;
     }
   }
  //når vi tilføjer den nye tile er der stadig en tile med samme coords og null terrain
  let SVGtile = $(newTile._x + '.' + newTile._y + '.' + newTile._z);
  SVGtile.setAttribute('class', "tile");
  let newGrid = Game.makeNewNeighbors(newTile, Game.map.tiles);
  Game.map.tiles.push(newTile);
  for (let g in newGrid) {
     Game.map.tiles.push(newGrid[g]);
  }
  Game.setBoard(Game.map.tiles);
  //Vi er nødt til at udvide både svg og canvas på samme tid, ellers bliver de vist forskubbet
  for (let t in Game.grid) {
    let target = drawAt(Game.map.tiles[t]._x, Game.map.tiles[t]._y, Game.map.tiles[t]._z, Game.board.size);
    Interface.renderSVG(Game.map.tiles[t], Game.user, target);
  }
  let target = drawAt(newTile._x, newTile._y, newTile._z, Game.board.size);
  Interface.renderSVG(newTile, Game.user, target);
}



Game.initMap = function(map){
    let grid = initGrid(map.tiles);
    Game.grid = grid;
    Game.setBoard(map.tiles);

    for (let i = 0; i < grid.length; i++) {
      let target = drawAt(grid[i]._x, grid[i]._y, grid[i]._z, Game.board.size);
      Interface.renderSVG(grid[i], Game.user, target);
    }
};

Game.run = function (context) {
  this.ctx = context;
  var p = this.load();
  Promise.all(p).then(

    function (loaded) {
    Game.tileAtlas = Loader.getImage('tiles');
    Game.buildingsAtlas = Loader.getImage('buildings');
    Game.dust = Loader.getImage('dust');
    
    Events.getMap(function(map, user){
      Game.map = map;
      Game.user = user;
      Game.initMap(map);
      Game.animate();
      Interface.spellsInterface(Game.spells, Game.user);
      Interface.resourcesInterface(Game.resources);
      }.bind(this));
      
  });
  
};

window.onload = function () {
  let context = $('board').getContext('2d');
  Game.run(context);

  let wrapper = $('main-wrapper');
  panzoom(wrapper);
};

export {Game}