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
    let body = $("body");
    let width = body.clientWidth;  
    this.board.setAttribute("width", width);
    let realWidth = this.board.clientWidth;
    let height = (realWidth / 19) * 10;
    this.board.setAttribute("height", height + '%');
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
    cols: 9,
    rows: 9,
    twidth: 160, // Tile height og width i pixels
    theight: 140,
    tiles: [
        1, 3, 3, 3, 1, 1, 3, 1, 2,
        1, 1, 1, 1, 1, 1, 1, 1, 5,
        1, 1, 1, 1, 1, 2, 1, 1, 2,
        1, 1, 1, 1, 1, 1, 1, 1, 2,
        1, 1, 1, 2, 4, 1, 1, 1, 5,
        1, 1, 1, 1, 2, 1, 1, 1, 1,
        1, 1, 1, 1, 2, 1, 1, 1, 5,
        1, 1, 1, 1, 2, 1, 1, 1, 2,
        1, 2, 5, 2, 1, 1, 2, 1, 5
    ],
    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
    }
};

Game.render = function () {

    for (var c = 0; c < map.cols; c++) {
        for (var r = 0; r < map.rows; r++) {

            var tile = map.getTile(c, r);
            if (tile !== 0) { // 0 => empty tile
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    (tile - 1) * map.twidth, // source x
                    0, // source y
                    map.twidth, // source width
                    map.theight, // source height
                    
                    c * map.twidth,  // target x
                    r * map.theight, // target y
                    map.twidth, // target width
                    map.theight // target height
                );
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


