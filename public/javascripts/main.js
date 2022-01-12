'use strict'


const $ = function(foo) {

    return document.getElementById(foo);
}
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
Game.activeSpell = null;
Game.spells = ["spell 1", "Spell 2", "Spell 3", "Spell 4", "Tether flare"];
Game.resources = {tether: 1000, resource1: 0, resource2: 0, resource3: 0, resource4: 0};

//the asset loader
var Loader = {
    images: {}
};

var cloud = [
  { transform: 'rotate(0)', color: '#000' },
  { transform: 'rotate(360deg)', color: '#000' }
];

var cloudTiming = {
  duration: 18000,
  iterations: Infinity
}

socket.on('message', function(msg) {
  console.log(msg);
  let chatFrame = $('chatFrame');
  if (chatFrame === null) {
    openChat();
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
  Game.renderSVG(Game.grid);
  Game.renderCanvas(Game.map.tiles);
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

Game.load = function () {
    return [
        Loader.loadImage('tiles', './images/tiles.png')
    ];
};
 


function hexCell (x,y,z){
this._x = x;
this._y = y; 
this._z = z;
}

function tile (hexCell, terrain){
  this.hexCell = hexCell;
  this.terrain = terrain;
}


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
}

function checkIfExists(tile, tiles){

  for (let l in tiles) {
    if (tiles[l]._x === tile._x && tiles[l]._y === tile._y && tiles[l]._z === tile._z) {
      return true;
     }
   }
}
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
}

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
}
function openChat (){
  let wrap = $('ui-wrapper');
  let chatFrame = $('chatFrame');
  if (chatFrame === null) {
    let chatFrame = document.createElement('div');
    chatFrame.setAttribute('id','chatFrame');
    chatFrame.style.boxShadow = '10px -5px 30px 5px black';
    chatFrame.style.position = 'fixed';
    chatFrame.style.marginLeft = '20px';
    chatFrame.style.width = '300px';
    chatFrame.style.height = '300px';
    chatFrame.style.backgroundColor = 'rgb(42, 41, 56)';
    chatFrame.style.bottom = '20px';
    let chat = document.createElement('form');
    chat.setAttribute('action', "");

    chat.setAttribute('id','chat');
    chat.style.position = 'absolute';
    chat.style.bottom = '0';
    chat.style.float = 'none';
    let input = document.createElement('input');
    let btn = document.createElement('button');
    //input.style.display = 'inline-block';
    input.style.width = '240px';
    input.style.height = '40px';
    input.style.margin = '0';
    btn.style.margin = '0';
    btn.style.width = '50px';
    btn.style.height = '50px';

    let exit = document.createElement('button');
    exit.style.width = "20px";
    exit.style.height = "20px";
    exit.style.float = 'right';
    exit.backgroundColor = 'black';
    exit.innerHTML = 'x';
    exit.addEventListener('click', function(){
      wrap.removeChild(chatFrame);
    });
    chatFrame.appendChild(exit);

    chat.addEventListener('submit', function(e){
      e.preventDefault();
      if (input.value) {
        let msg = Game.user + ': ' + input.value;
        socket.emit('message', msg);
        input.value = '';
      }
    });
    let messages = document.createElement('div');
    messages.style.color = 'white';
    messages.setAttribute('id', 'messages');
    
    
    chat.appendChild(input);
    chat.appendChild(btn);
    chatFrame.appendChild(messages);
    chatFrame.appendChild(chat);
    btn.innerHTML = 'Send';
    wrap.appendChild(chatFrame);

    let mainWrap = $('main-wrapper');
    let info = $('tileInfo');
    if (info !== null){
    mainWrap.removeChild(info);
  }
  } 
}

function tileInfo (tile){
  let wrap = $('main-wrapper');
  let string = tile.getAttribute('coords');
  let coords = JSON.parse(string);
  let pos = Game.drawAt(coords._x, coords._y, coords._z);
  let info = $('tileInfo');
  if (info !== null){
  wrap.removeChild(info);
  }

  info = document.createElement("div");
  info.setAttribute('id','tileInfo');
  let text = document.createTextNode("Tile info");
  info.style.boxShadow = '10px -5px 30px 5px black';
  info.style.position = "absolute";
  info.style.color = '#ece271';
  info.style.backgroundColor = "rgb(42, 41, 56)";
  info.style.width = '200px';
  info.style.height = '200px';
  info.style.top = pos.y + -100+ 'px';
  info.style.left = pos.x + -50+'px';
  info.style.zIndex = '4';
  let owner = tile.getAttribute('owner');
  info.appendChild(text);
  if (owner !== "null" && owner !== Game.user) {
    let convoBTN = document.createElement("button");
    let text = document.createTextNode("Start chat");
    convoBTN.style.height = '30px';
    convoBTN.style.width = '80%';
    convoBTN.style.color = '#ece271';
    convoBTN.style.backgroundColor = '#4E1717';
    convoBTN.style.border = '1px solid #1C336A';
    convoBTN.style.marginLeft = '12px';
    convoBTN.style.marginTop = '7px';
    convoBTN.addEventListener('click', openChat);
    convoBTN.appendChild(text);
    info.appendChild(convoBTN);
  }

  wrap.appendChild(info);
}


function tileClick(event) {
  event.stopPropagation();
  let tile = event.target || event.srcElement;
  let coords = tile.getAttribute('coords');
  console.log("hit! on tile: " + coords);
  //vi kan via en eventlistener sætte en aktiv spell fra vores UI
  if (Game.activeSpell === null) {
    tileInfo(tile);
  } 
  if (Game.activeSpell === 4) {
    socket.emit('tileClicked', coords);
    Game.activeSpell = null;

    let btn = $('spellBtn4');
    btn.style.opacity = '0.8';
    btn.style.border = '1px solid #1C336A';
    let tiles = document.getElementsByClassName('blank');
    //Note: when it's a nodelist you must use this loop,
      //and not (let t in tiles) which throws errors 
    for (let t= 0; t < tiles.length; t++) {              
        tiles[t].setAttribute('stroke','#1C336A');
        tiles[t].style.opacity = '1';
    }
  }
}

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
}

Game.drawAt = function(x,y,z) {
  let edgeLength = 80;
  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  
  let centerX = Game.board.size[0] /2;
  let centerY = Game.board.size[1] /2;
    
  let tx = x* edgeW + centerX;
  let ty = (-y+z) * edgeH + centerY;
  return {x: tx, y: ty, edgeLength};
}

Game.borders = function () {
  let green = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let blue = document.createElementNS("http://www.w3.org/2000/svg", "g");
  blue.setAttribute('id','friendly');
  blue.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  blue.setAttribute('fill', "url('#blue')");
  blue.setAttribute('opacity','0.3');
  svg.appendChild(blue);
  green.setAttribute('id','sov');
  green.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  green.setAttribute('fill', "url('#green')");
  green.setAttribute('opacity','0.3');
  svg.appendChild(green);
}

Game.renderSVG = function (gridArray) {
  let x, y, z;
  let svg = $('svg');
  let green = $('sov');
  let blue = $('friendly');
  let wrap = $('main-wrapper');
  for (let i = 0; i < gridArray.length; i++) {
    let owner = null;
    let terrain = gridArray[i].terrain;
    if(gridArray[i].owner !== undefined) {
      owner = gridArray[i].owner;
    }
    [x,y,z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];

    let target = Game.drawAt(x,y,z);
    
    let points = '';
    for (let j = 1; j <= 6; j++) {
      let x = target.x + Math.cos(j / 6 * (Math.PI *2)) *target.edgeLength;
      let y = target.y + Math.sin(j / 6 * (Math.PI *2)) *target.edgeLength;
      points += ' '+x+','+y+' ';
    }
    
    if (terrain === null) {
      let dust = $('dust'+ x + '.' + y + '.' + z);
      if (dust === null) {

        let dust = document.createElement('IMG');
        dust.setAttribute('class', 'dust');
        dust.setAttribute('id', 'dust'+ x + '.' + y + '.' + z);
        dust.setAttribute('src', 'images/dust.png');
        dust.setAttribute('width', '200');
        dust.setAttribute('height', '200');
        dust.style.zIndex = 2;
        dust.style.position = 'absolute';
        dust.style.opacity = '0.8';
        dust.style.pointerEvents = 'none';
        dust.animate(cloud, cloudTiming);
        dust.style.left = target.x - 100 + "px";
        dust.style.top = target.y - 100 + "px";
        wrap.appendChild(dust);
      } else {
        dust.style.left = target.x - 100 + "px";
        dust.style.top = target.y - 100 + "px";
        wrap.appendChild(dust);
      }
    }
    if (gridArray[i].terrain !== null) {
      let dust = $('dust'+ x + '.' + y + '.' + z);
      if (dust !== null) {
        wrap.removeChild(dust);
      }
    }
    let tile = $(x + '.' + y + '.' + z);
    if (tile === null) {
      
      tile = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');

      let coords = JSON.stringify(gridArray[i]);

      tile.setAttribute('owner', owner);
      tile.setAttribute('stroke-width','2px');
      tile.setAttribute('stroke','#1C336A');
      tile.setAttribute('fill','transparent');
      tile.setAttribute("id", x + '.' + y + '.' + z);
      tile.setAttribute('class','tile');
      tile.setAttribute('opacity','0.7');
      tile.setAttribute('coords', coords);
      tile.style.zIndex = 1;
      tile.addEventListener('click', tileClick, false);
      if (terrain === null) {
        tile.style.zIndex = 3;
        tile.setAttribute('class','blank');
        tile.setAttribute('fill','black');
      }  
    }
    //the "points" attribute has to be set last, 
      //otherwise the tiles won't move when the board expands
    if (terrain !== null) {
        tile.setAttribute('class','tile');
        tile.setAttribute('fill','transparent');
      }  
    if (owner === Game.user) {
        tile.setAttribute('owner', owner);
        tile.setAttribute('fill', "url('#green')");
      } 

    if (owner !== Game.user && owner !== null) {
        tile.setAttribute('owner', owner);
        tile.setAttribute('fill', "url('#blue')"); 
      }
    tile.setAttribute('owner', owner);
    tile.setAttribute('points', points); 
    svg.appendChild(tile);
  }
}
//Når vi skal lave rendering for bygninger osv. kan vi bruge den sammen funktion. 
//Det eneste der ikke er det samme er hvilket atlas der skal bruges, så det kan bruges som parameter
// F.eks: (gridArray, type, src)
Game.renderCanvas = function (gridArray) {
  let x, y, z;
  for (let i = 0; i < gridArray.length; i++) {
    [x,y,z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];
    let terrain = gridArray[i].terrain;
    let target = Game.drawAt(x,y,z);

    this.ctx.moveTo(target.x, target.y);
    
    if (terrain !== null){
      this.ctx.drawImage(
        this.tileAtlas, //image 
        (terrain)* 160, // source x
        0,        //source y
        160,      //source width
        140,      //source heigh
        target.x -79,   //target x
        target.y -69,  //target y
        158,      //target width
        138       //target height
        );
    }
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
    spellCard.style.boxShadow = '10px -5px 30px 5px black';
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
      Game.activeSpell = 4;

      activateBtn.style.opacity = '1';
      activateBtn.style.border = '1px solid #ece271';
      let tiles = document.getElementsByClassName('blank');
      //Note: when it's a nodelist you must use this loop,
      //and not (let t in tiles) which throws errors 
      for (let t = 0; t < tiles.length; t++) {
        tiles[t].setAttribute('stroke','#ece271');
        tiles[t].style.opacity = '1';
      }
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

Game.getMap =  async function(onDone) {
  socket.emit('connected');
  socket.on('getMap', function(map, user, callback){
    console.log("A map has been served for the user.");
    let res = 'map served succesfully';
    callback(res);
    onDone(map, user);
    });

}
Game.initMap =  function(map){
    let grid = Game.initGrid(map.tiles);
    Game.grid = grid;
    Game.setBoard(map.tiles);
    Game.renderSVG(grid);
    Game.renderCanvas(map.tiles);   
    Game.map = map;
}

Game.run = function (context) {
  this.ctx = context;
  var p = this.load();
  Promise.all(p).then(function (loaded) {
    this.tileAtlas = Loader.getImage('tiles');
    Game.getMap(function(map, user){
      Game.user = user;
      Game.initMap(map);
    });
    Game.spellsInterface(Game.spells);
    Game.resourcesInterface(Game.resources);
  }.bind(this));
}
    
window.onload = function () {
  let context = $('board').getContext('2d');
  Game.run(context);

  let wrapper = $('main-wrapper');
  panzoom(wrapper);
}


