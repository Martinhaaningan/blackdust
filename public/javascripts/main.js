'use strict'


const $ = function(foo) {

    return document.getElementById(foo);
}
const socket = io('/');
socket.emit('hello');

//the game object
var Game = {};

Game.spells = ["spell 1", "Spell 2", "Spell 3", "Spell 4", "Tether flare"];
Game.resources = {tether: 1000, resource1: 0, resource2: 0, resource3: 0, resource4: 0};

//the asset loader
var Loader = {
    images: {}
};

Game.initMap =  function(){
  
  socket.on('handshake', function(map){
    console.log("A map has been served for the user.");
 
    map  =  Game.initGrid(map);
    let mapSize = Game.getMapSize(map.tiles);
    map.size = mapSize;
    
    Game.setBoard(mapSize);
    Game.render(map.tiles);

    return map;
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
    this.ui = $('ui-wrapper');

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


    Game.spellsInterface(Game.spells);
    Game.resourcesInterface(Game.resources);
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
    this.map = Game.initMap();
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
  if (Game.activeSpell === 4) {
    socket.emit('tileClicked', coords);
    Game.activeSpell = null;
    console.log(Game.activeSpell);
    let btn = $('spellBtn4');
    btn.style.opacity = '0.8';
    btn.style.border = '1px solid #1C336A';
  }
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


function cycleUp() {
console.log('click..');
}


function cycleDown() {
 console.log('click..'); 
}

Game.spellsInterface = function (spells) {

  let spellsUi = $('spells-ui');
  spellsUi.style.float = 'right';
  spellsUi.style.margin = '40px';
  spellsUi.style.position = 'fixed';
  spellsUi.style.right = '0';
  spellsUi.style.width = '250px';

  // let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  // spellsUi.appendChild(svg);
  // let btnUp = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
  // let btnDown = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
  
  // svg.style.height = '200px';
  // svg.style.width = '60px';
  // svg.style.position = 'absolute';
  // svg.style.top = '150px';
  // svg.style.left = '20px';

  // btnUp.setAttribute('points','4,50 50,50 25,0');
  // btnUp.setAttribute('fill', '#4E1717');
  // btnUp.setAttribute('stroke-width','1px');
  // btnUp.setAttribute('stroke','#ece271');
  // btnUp.addEventListener('click', cycleUp);

  // btnDown.setAttribute('points','4,80 50,80 25,130');
  // btnDown.setAttribute('fill', '#4E1717');
  // btnDown.setAttribute('stroke-width','1px');
  // btnDown.setAttribute('stroke','#ece271');
  // btnDown.addEventListener('click', cycleDown);


  // svg.appendChild(btnUp);
  // svg.appendChild(btnDown);
  

  for (let i in Game.spells) {

    let spellCard = document.createElement('div');
    spellCard.setAttribute('id', i);
    spellCard.setAttribute('class', 'spellCard');
    spellCard.style.height = '200px';
    spellCard.style.width = '130px';
    spellCard.style.top = 50 + 50 * i + 'px';
    spellCard.style.left = '100px';
    spellCard.style.backgroundColor = '#2a2938';
    spellCard.style.border = '5px solid black';
    spellCard.style.outline = '2px solid #1C336A';
    spellCard.style.boxShadow = '10px -5px 30px 5px black'
    spellCard.style.position = 'absolute';
    spellCard.style.borderRadius = '15px';
    spellCard.addEventListener('mouseenter', function(){
      spellCard.style.zIndex = 1;
    });

    spellCard.addEventListener('mouseleave', function(){
      spellCard.style.zIndex = 0;
    });

    let label = document.createElement('p');
    label.innerHTML = Game.spells[i];
    spellCard.appendChild(label);

    let img = document.createElement('IMG');
    img.setAttribute('src', '/images/tether.jpg');
    img.setAttribute('width', '100%');
    spellCard.appendChild(img);

    let desc = document.createElement('p');
    desc.innerHTML = "Launches a rocket loaded with tether at a tile";
    desc.style.marginTop = '-4px'; 
    spellCard.appendChild(desc);

    let activateBtn = document.createElement('button');
    let text = document.createTextNode("Cast");
    activateBtn.setAttribute('class','button');
    activateBtn.setAttribute('id','spellBtn' + i);
    activateBtn.style.height = '30px';
    activateBtn.style.width = '80%';
    activateBtn.style.color = '#ece271';
    activateBtn.style.backgroundColor = '#4E1717';
    activateBtn.style.border = '1px solid #1C336A';
    activateBtn.style.marginLeft = '12px';
    activateBtn.style.marginTop = '7px';
    activateBtn.style.opacity = '0.8';

    activateBtn.addEventListener('click', function(){
      console.log('clicked button');
      Game.activeSpell = 4;
      console.log(Game.activeSpell);
      activateBtn.style.opacity = '1';
      activateBtn.style.border = '1px solid #ece271';
    });
    activateBtn.appendChild(text);
    spellCard.appendChild(activateBtn);

    spellsUi.appendChild(spellCard);
    }
}

Game.resourcesInterface = function(){
  let resUi = $('resources-ui');
  resUi.style.position = 'fixed';
  resUi.style.top = '0';
  resUi.style.left = '0';
  resUi.style.width = '100%'
  resUi.style.height = '50px';
  resUi.style.backgroundColor = '#2a2938';

  let resources = document.createElement('div');
  resources.style.margin = 'auto';
  let resKeys = Object.keys(Game.resources);
  let resVals = Object.values(Game.resources);
  for (let r in resKeys) {

    let p = document.createElement('p');
    p.innerHTML = resKeys[r] + ': ' + resVals[r];
    p.style.float = 'left';
    resources.appendChild(p);
  }
  resUi.appendChild(resources);
}

function selectCard(){
  let card = event.target || event.srcElement;
  let id = card.getAttribute('id');
  console.log(id);
  card.style.zIndex = 1;
}
    
window.onload = function () {

  let context = $('board').getContext('2d');
  Game.run(context);

  let wrapper = $('main-wrapper');
  panzoom(wrapper);
}


