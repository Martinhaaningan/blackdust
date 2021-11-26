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


Game.initPlayer = function(){
  
  socket.emit('handshake');
  socket.on('hello', function(map){
    console.log("A map has been served for the user.");
    Game.map = map;  
    map  = Game.initGrid(map);
    console.log(map);
    Game.render(map.tiles);
    });
}


//bør ikke sende hele kortet og generer det forfra da det giver dublering, send den enkelte tile istedet
socket.on('rolledTile', function(newTile) {
  console.log('A tile has been revealed. Reloading the map');

  //let hexGrid = Game.initGrid(newMap.size, newMap);
  let newTiles = Game.makeNewNeighbors(newTile, Game.map);
  newTiles.push(newTile);
  console.log(newTiles);
  Game.render(newTiles);
});


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



Game.setBoard = function () {
    this.board = $('board');
    this.svg = $('svg');
    let body = $("body");
    let width = body.clientWidth;
    let height = body.clientHeight;
    this.board.setAttribute("width", width);
    this.board.setAttribute("height", height);
    this.board.style.backgroundColor ="black";
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

    //Game.clicks(this.ctx);
    //Game.mouseOver(this.ctx);
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

function checkIfExists(hex, mapTiles){
  // console.log(hex);
  // console.log(mapTiles);
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
  console.log("n",newTile);
    for (let n in neighbors) {
      let found = checkIfExists(neighbors[n], map.tiles);
        console.log("--",neighbors[n], found);
        if (!found) {
          let terrain = null;
          //console.log(neighbors[n]);
          //Uncaught TypeError: tile is not a constructor
          newTiles.push(new tile(neighbors[n], terrain));
        }
      }
  
  return newTiles;
}

Game.initGrid = function(map){
  for (let t in map.tiles) {
    let neighbors = getNeighbors(map.tiles[t].hexCell);
    //console.log("n",neighbors);
      for (let n in neighbors) {
        let found = checkIfExists(neighbors[n], map.tiles);
        console.log("--",neighbors[n], found);
        if (!found) {
          let terrain = null;
          //console.log(neighbors[n]);
          map.tiles.push(new tile(neighbors[n], terrain));
        }
      }
  }
  return map;
}

//Vi kan køre initGrid i backenden, gemme det grid array i databasen og sende gridArray via socketIO
// Game.initGrid = function(mapSize, map){
//   mapSize = Math.max(1,mapSize);
//   if (map === null) {
//     location.reload();
//   }
//   let gridArray = map.tiles;
//   let cnt = 0;
//   for(let i = -mapSize; i < mapSize +1; i += 1) {
//     for(let j = -mapSize; j < mapSize +1; j += 1) {
//       for(let k = -mapSize; k < mapSize +1; k += 1) {
//         if (i + j + k == 0) {       

//           //checker de generede tiles om de allerede er tilføjet fra map.tiles
//           let found;
//           for (let l in map.tiles) {
//             if (map.tiles[l].hexCell._x === i && map.tiles[l].hexCell._y === j && map.tiles[l].hexCell._z === k) {
//               found = true;
//             }
//           }
//           //hvis en tile ikke er fundet oprettes en ny blank tile
//           if (!found) {
//             let terrain = null;
//             gridArray.push(new tile(new hexCell(i, j, k), terrain));
//             cnt += 1;      
//           }
//         }
//       }
//     }
//   }
//   console.log(gridArray);
//   return gridArray; 
// }



function tileClick() {

  let tile = event.target || event.srcElement;
  let coords = tile.getAttribute('coords');
  console.log("hit! on tile: " + coords);
  //vi kan via en eventlistener sætte en aktiv spell fra vores UI
  //if (Game.activeSpell === tetherRockets) {
  socket.emit('tileClicked', coords);
  //}
}


Game.render = function (gridArray) {
  let height = 160;
  let width = 160;
  let edgeLength = 80;
  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  let x, y, z;
  let posX, posY;
  let centerX = Game.board.size[0] /2;
  let centerY = Game.board.size[1] /2;
  this.ctx.clearRect(0,0, this.ctx.width,this.ctx.height);
  for (let i = 0; i < gridArray.length; i++) {
    [x,y,z] = [gridArray[i].hexCell._x, gridArray[i].hexCell._y, gridArray[i].hexCell._z];
    let terrain = gridArray[i].terrain;
    posX = x* edgeW + centerX;
    posY = (-y+z) * edgeH + centerY;
    //console.log(posX,posY);
    let tx = posX + Math.cos(0) * edgeLength;
    let ty = posY + Math.sin(0) * edgeLength;
    this.ctx.moveTo(tx, ty);

    let coords = JSON.stringify(gridArray[i]);

    if (terrain !== null){
      this.ctx.drawImage(
        this.tileAtlas, //image 
        (terrain)* 160, // source x
        0,  //source y
        160, //source width
        160, //source heigh
        tx -158, //target x
        ty - 68,//target y
        158, //target width
        138 //target height
        );
    }

    let tile = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    tile.setAttribute('width', width);
    tile.setAttribute('height', height);
    tile.setAttribute('stroke-width','2px');
    tile.setAttribute('stroke','#1C336A');
    tile.setAttribute('fill','transparent');
    tile.setAttribute("id", x + '.' + y + '.' + z);
    tile.setAttribute('class','tile');
    tile.setAttribute('opacity','0.5');
    tile.setAttribute('coords', coords);
    tile.addEventListener('click', tileClick);
    let points = '';
    for (let j = 1; j <= 6; j++) {
      let x = posX + Math.cos(j / 6 * (Math.PI *2)) *edgeLength;
      let y = posY + Math.sin(j / 6 * (Math.PI *2)) *edgeLength;
      points += ' '+x+','+y+' ';
    }
    tile.setAttribute('points', points);
    let svg = $('svg');

    svg.appendChild(tile);

    Game.grid = gridArray;
  }
};
    
window.onload = function () {
  Game.initPlayer();
  
  Game.setBoard();
  let context = $('board').getContext('2d');

  Game.run(context);

}


