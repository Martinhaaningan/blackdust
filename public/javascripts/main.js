'use strict'

const socket = io('/');

const $ = function(foo) {

    return document.getElementById(foo);
}

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


//the game object
var Game = {};

Game.setBoard = function () {
    this.board = $('board');
    this.svg = $('svg');
    let body = $("body");
    let width = body.clientWidth;  
    this.board.setAttribute("width", width);
    this.svg.setAttribute("width", width);
    let realWidth = this.board.clientWidth;
    let height = 770;
    this.board.setAttribute("height", height + '%');
    this.svg.setAttribute("height", height + '%');
    this.board.style.backgroundColor ="black";
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
        Game.render();
      }.bind(this));
}

var map = {
    cols: 5,
    rows: 5,
    twidth: 160, // Tile height og width i pixels
    theight: 140,
    tx: 120,
    ty: 140,
    tiles: [
        0, 0, 0, 0, 0,  
        0, 1, 2, 2, 0,  
        0, 3, 4, 1, 0,
        0, 0, 5, 0, 0,
        0, 0, 0, 0, 0
    ],
    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
    }
};

function tileClickable (x, y, width, height, c, r) {
  let tile = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
  tile.setAttribute('width', width);
  tile.setAttribute('height', height);
  tile.setAttribute('points', "40,1 120,1 159,69 119,139 41,139 1,69");
  tile.setAttribute("transform", "translate("+ x +","+ y +")");
  tile.setAttribute("stroke-width", "2px");
  tile.setAttribute("stroke", "#1C336A");
  tile.setAttribute("fill","transparent");
  tile.setAttribute("id", c+","+r);
  tile.setAttribute("class", "tile");
  let svg = $('svg');
  svg.appendChild(tile);
}

Game.render = function () {
    for (var c = 0; c < map.cols; c++) {
        for (var r = 0; r < map.rows; r++) {
            
            var tile = map.getTile(c, r);
            let tx = map.tx*c;
            let ty = map.ty*r;
            if (c % 2 == 1) {
                ty = ty + 70;
              }

            if (tile == 0) {
              tileClickable(tx,ty, map.twidth, map.theight, c, r);
            }

            if (tile !== 0) { // 0 => empty tile

                this.ctx.drawImage(
                    this.tileAtlas, // image
                    (tile - 1) * map.twidth, // source x
                    0, // source y
                    map.twidth, // source width
                    map.theight, // source height
                    tx,  // target x
                    ty, // target y
                    map.twidth, // target width
                    map.theight // target height
                );
                tileClickable(tx,ty, map.twidth, map.theight, c, r);
            }
        }
    }
};




/*function init(){
  setBoard();

  socket.emit('loggedIn');
  socket.on('hello', function(email){
    console.log('hello user! Your email is:' + email);
  });
}
*/
window.onload = function () {
    Game.setBoard();
    let context = $('board').getContext('2d');
    Game.run(context);

}


