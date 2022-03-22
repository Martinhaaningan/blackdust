'use strict'
import {Loader} from './modules/loader.js';
import {Renderer} from './modules/renderer.js';
import {Interface} from './modules/interface.js';
import {$, drawAt} from './modules/common.js';

const socket = io('/');

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
var Game = {};
Game.spells = ["Tether flare"];
Game.spells.activeSpell = null;
Game.resources = {tether: 1000, resource1: 0, resource2: 0, resource3: 0, resource4: 0};


Game.load = function () {
    return [
        Loader.loadImage('tiles', './images/tiles.png'),
        Loader.loadImage('buildings', './images/buildings.png')
    ];
};

var cloud = [
  { transform: 'rotate(0)', color: '#000' },
  { transform: 'rotate(360deg)', color: '#000' }
];

var cloudTiming = {
  duration: 18000,
  iterations: Infinity
};

//socketIO logic here
socket.on('message', function(msg) {
  console.log(msg);
  let chatFrame = $('chatFrame');
  if (chatFrame === null) {
    Interface.openChat();
  }
  var item = document.createElement('li');
  item.style.margin = '5px';
  item.style.listStyleType = 'none';
  item.textContent = msg;
  let messages = $('messages');
  messages.appendChild(item);
});

//bør ikke sende hele kortet og generer det forfra da det giver dublering, send den enkelte tile istedet
socket.on('rolledTile', function(newTile) {
  console.log('A tile has been revealed. Rendering...');
  let newGrid = Game.makeNewNeighbors(newTile, Game.grid);
  for (let g in newGrid) {
    Game.grid.push(newGrid[g]);
  }
  Game.map.tiles.push(newTile);
  //Vi er nødt til at udvide både svg og canvas på samme tid, ellers bliver de vist forskubbet
  
  Game.setBoard(Game.map.tiles);
  Interface.renderSVG(Game.grid);
  let target = drawAt(newTile._x, newTile._y, newTile._z, Game.board.size);
  Renderer.drawCanvas(Game.ctx, newTile.terrain, Game.tileAtlas, target.x, target.y);
});
// fra https://github.com/mozdevs/gamedev-js-tiles
//socketIO logic ends here
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

Game.tileClick = function (event) {
  event.stopPropagation();
  let tile = event.target || event.srcElement;
  let coords = tile.getAttribute('coords');
  console.log("hit! on tile: " + coords);
  

  socket.emit('tileClicked', coords);

  // Game.spells.activeSpell = null;

  // let btn = $('spellBtn4');
  // btn.style.opacity = '0.8';
  // btn.style.border = '1px solid #1C336A';
  // let tiles = document.getElementsByClassName('blank');
  //   //Note: when it's a nodelist you must use this loop,
  //     //and not (let t in tiles) which throws errors 
  // for (let t= 0; t < tiles.length; t++) {              
  //   tiles[t].setAttribute('stroke','#1C336A');
  //   tiles[t].style.opacity = '1';
  // }

};

Game.initGrid = function(tiles){

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

Game.getMap =  async function(onDone) {
  socket.emit('connected');
  socket.on('getMap', function(map, user, callback){
    console.log("A map has been served for the user.");
    let res = 'map served succesfully';
    callback(res);
    onDone(map, user);
    });

};

Game.initMap = function(map){
    let grid = Game.initGrid(map.tiles);
    Game.grid = grid;
    Game.setBoard(map.tiles);
    console.log(grid);
    for (let i = 0; i < grid.length; i++) {
      let target = drawAt(grid[i]._x, grid[i]._y, grid[i]._z, Game.board.size);
      Interface.renderSVG(grid[i], Game.user, Game.spells, target.x, target.y, Game.tileClick);

      if (grid[i].terrain !== null) {
        Renderer.drawCanvas(this.ctx, grid[i].terrain, this.tileAtlas, target.x, target.y);
      }
    }
    Game.map = map;
};

Game.run = function (context) {
  this.ctx = context;
  var p = this.load();
  Promise.all(p).then(

    function (loaded) {
    Game.tileAtlas = Loader.getImage('tiles');
    Game.buildingsAtlas = Loader.getImage('buildings');
    
    Game.getMap(function(map, user){
      Game.user = user;
      Game.initMap(map);
      Interface.spellsInterface(Game.spells, Game.user);
      Interface.resourcesInterface(Game.resources);
      }.bind(this))
  });

};

window.onload = function () {
  let context = $('board').getContext('2d');
  Game.run(context);

  let wrapper = $('main-wrapper');
  panzoom(wrapper);
};