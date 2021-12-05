'use strict'


const $ = function(foo) {

    return document.getElementById(foo);
}

const socket = io('/');

//the game object
var Game = {};

//the asset loader
var Loader = {
    images: {}
};

Game.initMap =  function(){
  socket.emit('hello');

  socket.on('handshake', function(map){
    console.log("A map has been served for the user.");
 
    map  =  Game.initGrid(map);
    let mapSize = Game.getMapSize(map.tiles);
    map.size = mapSize;
    
    Game.setBoard(mapSize);
    Game.render(map.tiles);

    Game.map = map;
    });

}

//bør ikke sende hele kortet og generer det forfra da det giver dublering, send den enkelte tile istedet
socket.on('rolledTile', function(newTile) {
  console.log('A tile has been revealed. Rendering...');

  let newTiles = Game.makeNewNeighbors(newTile, Game.map);
  newTiles.push(newTile);
  console.log(newTiles);
  Game.render(newTiles);
});

// fra https://github.com/mozdevs/gamedev-js-tiles
Loader.loadImage = function (key, src) {
    var img = new Image();  
    var d = new Promise(function (resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        };
    }.bind(this));

    img.src = src;
    return d;
};

Loader.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
};


Game.setBoard = function (mapSize) {

    this.board = $('board');
    this.svg = $('svg');

    let mapWidth = mapSize[0] * 2 * 130; 
    let mapHeight = mapSize[1] * 2 * 140;

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

Game.load = function () {
    return [
        Loader.loadImage('tiles', './images/tiles.png')
    ];
};
 
Game.run = function (context) {
  this.ctx = context;
  var p = this.load();
  Promise.all(p).then(function (loaded) {
    this.tileAtlas = Loader.getImage('tiles');
  }.bind(this));

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


function getNeighbors(hex) {
  var vectors = [
    {x: 1,y: 0,z: -1}, {x: 1,y: -1,z: 0}, 
    {x: 0,y: -1,z: 1}, {x: -1,y: 0,z: 1}, 
    {x: -1,y: 1,z: 0}, {x: 0,y: +1,z: -1} 
    ];
  let neighbors = [];
  for (let i in vectors) {
    let vector = Object.values(vectors[i]);
    let val = Object.values(hex);
    let neighbor = {_x: val[0] + vector[0], _y: val[1] + 
      vector[1], _z: val[2] + vector[2]};
    neighbors.push(neighbor); 
  }
  return neighbors;
}

function checkIfExists(hex, mapTiles){
  for (let l in mapTiles) {
    if (mapTiles[l].hexCell._x === hex._x && mapTiles[l].hexCell._y === hex._y && mapTiles[l].hexCell._z === hex._z) {
      return true;
     }
   }
}
//tag kun naboer med og check på dem. Tilføj det pågældende tile bagefter

Game.makeNewNeighbors = function(newTile, map){
  let neighbors = getNeighbors(newTile.hexCell);
  let newTiles = [];
    for (let n in neighbors) {
      let found = checkIfExists(neighbors[n], map.tiles);
        if (!found) {
          let terrain = null;
          Game.map.tiles.push(new tile(neighbors[n], terrain));
          newTiles.push(new tile(neighbors[n], terrain));
        }
      }
  
  return newTiles;
}

Game.initGrid = function(map){
  for (let t in map.tiles) {
    let neighbors = getNeighbors(map.tiles[t].hexCell);
      for (let n in neighbors) {
        let found = checkIfExists(neighbors[n], map.tiles);
        if (!found) {
          let terrain = null;
          map.tiles.push(new tile(neighbors[n], terrain));
        }
      }
  }
  return map;
}


function tileClick() {

  let tile = event.target || event.srcElement;
  let coords = tile.getAttribute('coords');
  console.log("hit! on tile: " + coords);
  //vi kan via en eventlistener sætte en aktiv spell fra vores UI
  //if (Game.activeSpell === tetherRockets) {
  socket.emit('tileClicked', coords);
  //}
}

Game.getMapSize = function(gridArray) {
  let size = [0,0];
  for(let t in gridArray) {
   let y = Math.abs(gridArray[t].hexCell._y)*100/100;
   let x = Math.abs(gridArray[t].hexCell._x)*100/100;
     if (y > size[1]) {
     size[1] = y;
    }
    if (x > size[0])
      size[0] = x;
  }
  return size; 
}



Game.render = function (gridArray) {

  let edgeLength = 80;
  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  let x, y, z;
  
  let centerX = Game.board.size[0] /2;
  let centerY = Game.board.size[1] /2;


  for (let i = 0; i < gridArray.length; i++) {
    [x,y,z] = [gridArray[i].hexCell._x, gridArray[i].hexCell._y, gridArray[i].hexCell._z];
    let terrain = gridArray[i].terrain;
    
    let tx = x* edgeW + centerX;
    let ty = (-y+z) * edgeH + centerY;

    this.ctx.moveTo(tx, ty);
    
    if (terrain !== null){
      this.ctx.drawImage(
        this.tileAtlas, //image 
        (terrain)* 160, // source x
        0,        //source y
        160,      //source width
        140,      //source heigh
        tx -79,   //target x
        ty -69,  //target y
        158,      //target width
        138       //target height
        );
    }


    let tile = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    let coords = JSON.stringify(gridArray[i]);
    
    tile.setAttribute('stroke-width','2px');
    tile.setAttribute('stroke','#1C336A');
    tile.setAttribute('fill','transparent');
    tile.setAttribute("id", x + '.' + y + '.' + z);
    tile.setAttribute('class','tile');
    tile.setAttribute('opacity','0.7');
    tile.setAttribute('coords', coords);
    tile.addEventListener('mouseup', tileClick);

    let points = '';
    for (let j = 1; j <= 6; j++) {
      let x = tx + Math.cos(j / 6 * (Math.PI *2)) *edgeLength;
      let y = ty + Math.sin(j / 6 * (Math.PI *2)) *edgeLength;
      points += ' '+x+','+y+' ';
    }
    tile.setAttribute('points', points);
    let svg = $('svg');

    svg.appendChild(tile);
    
  }

};
    
window.onload = function () {
  Game.initMap();

  let context = $('board').getContext('2d');
  Game.run(context);

  let wrapper = $('main-wrapper');
  panzoom(wrapper);
}


