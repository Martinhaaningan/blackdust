'use strict'

const socket = io('/');

const $ = function(foo) {

    return document.getElementById(foo);
}

//the game object
var Game = {};

socket.emit('handshake');

//
// Asset loader
//

var Loader = {
    images: {}
};

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
    let body = $("body");
    let width = body.clientWidth;
    let height = body.clientHeight;
    this.board.setAttribute("width", width);
    this.board.setAttribute("height", height);
    this.board.style.backgroundColor ="black";
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
    let hexGrid  = Game.initGrid(4);
    Game.render(hexGrid);
    Game.clicks(this.ctx);
    Game.mouseOver(this.ctx);
  }.bind(this));
}




socket.on('hello', function(map){
  console.log("A map has been served for the user.");
  console.log(map);
  Game.render(map.tiles);
});

Game.HexCell = function (x,y,z, terrain){
this._x = x;
this._y = y; 
this._z = z;
this.terrain = terrain;
}

//Vi kan køre initGrid i backenden, gemme det grid array i databasen og sende gridArray via socketIO
Game.initGrid = function(mapSize){
  mapSize = Math.max(1,mapSize);
  let gridArray = [];
  let cnt = 0;
  for(let i = -mapSize; i < mapSize +1; i += 1) {
    for(let j = -mapSize; j < mapSize +1; j += 1) {
      for(let k = -mapSize; k < mapSize +1; k += 1) {
        if (i + j + k == 0) {
          let terrain = null;
          gridArray.push(new Game.HexCell(i, j, k, terrain));
          cnt += 1;
        }
      }
    }
  }
  return gridArray;
}

Game.render = function (gridArray) {

  let edgeLength = 80;
  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  let x, y, z;
  let posX, posY;
  let centerX = Game.board.size[0] /2;
  let centerY = Game.board.size[1] /2;

  for (let i = 0; i < gridArray.length; i++) {
    [x,y,z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];
    let terrain = gridArray[i].terrain;
    posX = x* edgeW + centerX;
    posY = (-y+z) * edgeH + centerY;
    //console.log(posX,posY);
    let tx = posX + Math.cos(0) * edgeLength;
    let ty = posY + Math.sin(0) * edgeLength;
    this.ctx.moveTo(tx, ty);
    gridArray[i].points = [];
    if (terrain !== null){
      this.ctx.drawImage(
        this.tileAtlas, //image 
        (terrain)* 160, // source x
        0,  //source y
        160, //source width
        160, //source heigh
        tx -159, //target x
        ty - 69,//target y
        154, //target width
        137 //target height
        );
    }
    if (terrain == null) {
    for (let j = 1; j <= 6; j++) {
      let x = posX + Math.cos(j / 6 * (Math.PI *2)) *edgeLength;
      let y = posY + Math.sin(j / 6 * (Math.PI *2)) *edgeLength;
      let points = {x,y};
      this.ctx.lineTo(x, y);
      gridArray[i].points.push(points);
    }
    this.ctx.fill();
    this.ctx.strokeStyle = "#113f67";
    this.ctx.stroke();
    Game.grid = gridArray;
    }
  }
};

Game.clicks = function(ctx) {
  $('board').addEventListener('mousedown', function(evt){
    evt.preventDefault();
    let mouse = {
    x: evt.clientX,
    y: evt.clientY
    }

    if (ctx.isPointInPath(mouse.x, mouse.y)) {
      console.log("hi!", mouse.x, mouse.y);
    }
  });
}

//virker ikke
Game.mouseOver = function(ctx) {
  $('board').addEventListener('mousedown', function(evt){
    evt.preventDefault();
    let mouse = {
    x: evt.clientX,
    y: evt.clientY
    }

    if (ctx.isPointInPath(mouse.x, mouse.y)) {
      ctx.strokeStyle = "#ffffff";
    }
  });
}

    
window.onload = function () {

    Game.setBoard();
    let context = $('board').getContext('2d');
    Game.run(context);

}


