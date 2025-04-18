import {$, drawAt} from './common.js';
import {Events} from './events.js';
import {Game} from '../main.js';
import {Animations} from './animations.js';
let Interface = {}

function isMatch(arr, val){
  return arr.some(function(arrVal){
    if (val._x === arrVal._x && val._y === arrVal._y && val._z === arrVal._z){
      return true;
    }
  })
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
};

Interface.getValidTiles = function (entity,range) {

  let tiles = getNeighbors(entity);
  range = range - 1;
  for (range >= 0; range--;) {
    for (let t in tiles) {
      let neighbors = getNeighbors(tiles[t]);
        for (let n in neighbors) {
        let match = isMatch(tiles, neighbors[n]);
        if(!match) {
          tiles.push(neighbors[n]);
        }
      }
    }
  }
  let ids = [];
  for (let t in tiles) {
    let id = '';
    id = id + tiles[t]._x +"."+ tiles[t]._y +"."+ tiles[t]._z;
    ids.push(id);
  }
  return ids;
}

Interface.openChat = function (){
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
        let msg = user + ': ' + input.value;
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
};

Interface.tileInfo = function (tile){
  let wrap = $('ui-wrapper');

  let info = document.createElement("div");
  info.setAttribute('id','tileInfo');

  let img = document.createElement('IMG');
  img.setAttribute('src', '/images/forest.png');
  img.setAttribute('width', '100%');

  let h2 = document.createElement("h2");
  let h2text = document.createTextNode('Placeholder');
  h2.style.margin = '-40px 0 0 10px';
  h2.appendChild(h2text);

  let p1 = document.createElement("p");
  let coord = document.createTextNode(''+ tile._x + '.' + tile._y + '.' + tile._z);
  p1.appendChild(coord);

  let p2 = document.createElement("p");

  let owner = document.createTextNode(tile.owner);
  p2.appendChild(owner);

  let p3 = document.createElement("p");
  let terrain = document.createTextNode('terrain: ' + tile.terrain.key);
  p3.appendChild(terrain);

  info.appendChild(img);
  info.appendChild(h2);
  info.appendChild(p1);
  info.appendChild(p2);
  info.appendChild(p3);
  info.style.boxShadow = '10px -5px 30px 5px black';
  info.style.position = "fixed";
  info.style.color = '#ece271';
  info.style.backgroundColor = "rgb(42, 41, 56)";
  info.style.width = '160px';
  info.style.height = '230px';
  info.style.bottom = 30 + 'px';
  info.style.right = 30 +'px';
  info.style.zIndex = '4';

  wrap.appendChild(info);
};

// Interface.spellsInterface = function (spells, user) {
//   let spellsUi = $('spells-ui');
//     let spellCard = document.createElement('div');
//     spellCard.setAttribute('class', 'spellCard');
//     spellCard.style.height = '200px';
//     spellCard.style.width = '130px';
//     spellCard.style.top = 100 + 'px';
//     spellCard.style.left = '100px';
//     spellCard.style.backgroundColor = '#2a2938';
//     spellCard.style.border = '5px solid black';
//     spellCard.style.outline = '2px solid #1C336A';
//     spellCard.style.boxShadow = '10px -5px 30px 5px black';
//     spellCard.style.position = 'absolute';
//     spellCard.style.borderRadius = '15px';
//     spellCard.addEventListener('mouseenter', function(){
//       spellCard.style.zIndex = 1;
//     });

//     spellCard.addEventListener('mouseleave', function(){
//       spellCard.style.zIndex = 0;
//     });

//     let label = document.createElement('p');
//     label.innerHTML = spells[0];
//     spellCard.appendChild(label);

//     let img = document.createElement('IMG');
//     img.setAttribute('src', '/images/tether.jpg');
//     img.setAttribute('width', '100%');
//     spellCard.appendChild(img);

//     let desc = document.createElement('p');
//     desc.innerHTML = "Launches a rocket loaded with tether at a tile";
//     desc.style.marginTop = '-4px'; 
//     spellCard.appendChild(desc);

//     let activateBtn = document.createElement('button');
//     let text = document.createTextNode("Cast");
//     activateBtn.setAttribute('class','button');
//     activateBtn.setAttribute('id','spellBtn');
//     activateBtn.style.height = '30px';
//     activateBtn.style.width = '80%';
//     activateBtn.style.color = '#ece271';
//     activateBtn.style.backgroundColor = '#4E1717';
//     activateBtn.style.border = '1px solid #1C336A';
//     activateBtn.style.marginLeft = '12px';
//     activateBtn.style.marginTop = '7px';
//     activateBtn.style.opacity = '0.8';
//     activateBtn.addEventListener('click', function(){
//       activateBtn.style.opacity = '1';
//       activateBtn.style.border = '1px solid #ece271';
      
//       let tiles = document.getElementsByClassName('blank');
//       //Note: when it's a nodelist you must use this loop,
//       //and not (let t in tiles) which throws errors
//       for (let t = 0; t < tiles.length; t++) {
//         tiles[t].setAttribute('stroke','#ece271');
//         tiles[t].addEventListener('click', Interface.revealTile, true);
//       }
//     });
//     activateBtn.appendChild(text);
//     spellCard.appendChild(activateBtn);
//     spellsUi.appendChild(spellCard);
// };

Interface.abilities = function(event){

  //Vi skal først have cleared actionbar hvis den er der allerede
  let uiWrapper = $('ui-wrapper');
  let clearBar = $('actionBar');
  let clearActive = $('activeUnit');
  if (clearBar) {
    uiWrapper.removeChild(clearBar);
    clearActive.removeAttribute('id');
  }
  

  event.stopPropagation();
  let unitFrame = event.target || event.srcElement;
  unitFrame.setAttribute('id','activeUnit');
  
  if (!$('actionBar')) {
    let json = unitFrame.getAttribute('entity');
    let unit = JSON.parse(json);

    let actionBar = document.createElement('div');
    actionBar.style.bottom = '70px';
    actionBar.style.left = '0';
    actionBar.style.height = '200px';
    actionBar.style.marginLeft = '10%';
    //actionBar.style.width = unit.abilities.length;
    actionBar.style.position = 'fixed';
    actionBar.setAttribute('id', 'actionBar');

    let exit =  document.createElement('div');
    exit.style.left = '0';
    exit.style.height = '20px';
    exit.style.width = '20px';
    exit.style.backgroundColor = 'red';
    exit.style.borderRadius = '20px';
    exit.style.border = '1px solid #1C336A';
    exit.addEventListener('mouseenter', function(e){
      exit.style.border = '1px solid #ece271';
    });
    exit.addEventListener('mouseleave', function(e){
      exit.style.border = '1px solid #1C336A';
    });


    exit.addEventListener('click', function(){
      location.reload();
      //uiWrapper.removeChild(actionBar);
    });
    actionBar.appendChild(exit);

    for(let a in unit.abilities) {
      let spellCard = document.createElement('div');
      spellCard.setAttribute('class', 'spellCard');
      spellCard.style.height = '230px';
      spellCard.style.width = '160px';
      spellCard.style.left = 20 + 180 * a + 'px';
      spellCard.style.backgroundColor = '#2a2938';
      spellCard.style.border = '5px solid black';
      spellCard.style.outline = '2px solid #1C336A';
      spellCard.style.boxShadow = '10px -5px 30px 5px black';
      spellCard.style.position = 'absolute';
      spellCard.style.borderRadius = '15px';

      let label = document.createElement('p');
      label.innerHTML = unit.abilities[a].label;
      spellCard.appendChild(label);

      let img = document.createElement('IMG');
      img.setAttribute('src', '/images/tether.jpg');
      img.setAttribute('width', '100%');
      spellCard.appendChild(img);

      let desc = document.createElement('p');
      desc.innerHTML = unit.abilities[a].desc;
      desc.style.marginTop = '-4px'; 
      spellCard.appendChild(desc);

      let activateBtn = document.createElement('button');
      let text = document.createTextNode("Cast");
      activateBtn.setAttribute('class','actionBtn');
      activateBtn.style.height = '30px';
      activateBtn.style.width = '80%';
      activateBtn.style.color = '#ece271';
      activateBtn.style.backgroundColor = '#4E1717';
      activateBtn.style.border = '1px solid #1C336A';
      activateBtn.style.marginLeft = '12px';
      activateBtn.style.marginTop = '7px';

      activateBtn.addEventListener('mouseenter', function(e){
        activateBtn.style.border = '1px solid #ece271';
      });
      activateBtn.addEventListener('mouseleave', function(e){
        activateBtn.style.border = '1px solid #1C336A';
      });

      activateBtn.addEventListener('click', function eventHandler(){
        //activateBtn.removeEventListener('click', eventHandler, true);

        let buttons = document.getElementsByClassName('actionBtn');
        for (let b = 0; b < buttons.length; b++) {
          buttons[b].removeEventListener('click', eventHandler, true);
          buttons[b].style.display = "none";
        }

        activateBtn.setAttribute('id','activeSpell');
        activateBtn.style.opacity = '1';
        activateBtn.style.border = '1px solid #ece271';
        let json = JSON.stringify(unit.abilities[a]);
        activateBtn.setAttribute('action', json);
        let tiles = Interface.getValidTiles(unit, unit.abilities[a].range);
        for (let t in tiles) {
          let tile = $(tiles[t]);
          if (tile != null) {
          tile.setAttribute('stroke','#ece271');
          tile.addEventListener('click', Interface.action, true);
          //we need to set a rule for which tiles are valid targets for a given ability
          }
        }
        //need function that returns array of valid tiles
        //let tiles = document.getElementsByClassName('blank');
        //Note: when it's a nodelist you must use this loop,
        //and not (let t in tiles) which throws errors
        // // for (let t = 0; t < tiles.length; t++) {
        // //   tiles[t].setAttribute('stroke','#ece271');
        // //   tiles[t].addEventListener('click', Interface.revealTile, true);
        // }
      });

      uiWrapper.appendChild(actionBar);
      
      activateBtn.appendChild(text);
      spellCard.appendChild(activateBtn);
      actionBar.appendChild(spellCard);
      }
    }
  }

Interface.removeAction = function() {

  }

 Interface.action = function(event) {
  event.stopPropagation();
  let tile = event.target || event.srcElement;
  

  let json = tile.getAttribute('coords');
  let coordsOBJ = JSON.parse(json);

  let action = $('activeSpell');
  let json2 = action.getAttribute('action');
  let actionOBJ = JSON.parse(json2);

  let unit = $('activeUnit');
  let json3 = unit.getAttribute('entity');
  let unitOBJ = JSON.parse(json3);

  let obj = {};
  obj.coords = coordsOBJ;
  obj.action = actionOBJ;
  obj.unit = unitOBJ;
  let data = JSON.stringify(obj);
  Events.actionRequest(data);
  Events.refresh();
 }


// Interface.revealTile = function(event){
//   event.stopPropagation();
//   let tile = event.target || event.srcElement;
//   let target = tile.getBoundingClientRect();
  
//   let coords = tile.getAttribute('coords');
//   //do the same but with an action that has been set to attribute or id "active" 
//   console.log("hit! on tile: " + coords);
//   let btn = $('activated');
//   btn.style.opacity = '0.8';
//   btn.style.border = '1px solid #1C336A';
//   Events.tileRequest(coords);
//   Events.tileResult(function(newTile){
//     Game.prepareTile(newTile);
//   });
//   let tiles = document.getElementsByClassName('blank');
//     //Note: when it's a nodelist you must use this loop,
//       //and not (let t in tiles) which throws errors
//   for (let t= 0; t < tiles.length; t++) {
//     tiles[t].setAttribute('stroke','#1C336A');
//     tiles[t].removeEventListener('click', Interface.revealTile, true);
//   }
//   let wrap = $('ui-wrapper');
//   let info = $('tileInfo');
//     if (info !== null){
//       wrap.removeChild(info);
//     }
// }

Interface.resourcesInterface = function(resources){
  let resUi = $('resources-ui');
  let resField = document.createElement('div');
  resField.style.margin = 'auto';
  let resKeys = Object.keys(resources);
  let resVals = Object.values(resources);
  for (let r in resKeys) {
    let p = document.createElement('p');
    p.innerHTML = resKeys[r] + ': ' + resVals[r];
    p.style.float = 'left';
    resField.appendChild(p);
  }
  resUi.appendChild(resField);
};

Interface.tileSVG = function (tile, user, target) {
  let svg = $('svg');
  let wrap = $('main-wrapper');
  let owner = null;

  if(tile.owner !== undefined) {
    owner = tile.owner;
  }
  let points = '';
  for (let j = 1; j <= 6; j++) {
    let pointX = target.x + Math.cos(j / 6 * (Math.PI *2)) * 79;
    let pointY = target.y + Math.sin(j / 6 * (Math.PI *2)) * 79;
    points += ' '+pointX+','+pointY+' ';
  }
  let hex = $(tile._x + '.' + tile._y + '.' + tile._z);
  if (hex === null) {
    hex = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    let coords = JSON.stringify(tile);
    hex.setAttribute('owner', owner);
    hex.setAttribute('stroke-width','2px');
    hex.setAttribute('stroke','rgb(30,30,30, 0.1)');
    hex.setAttribute("id", tile._x + '.' + tile._y + '.' + tile._z);
    hex.setAttribute('class','tile');
    hex.setAttribute('coords', coords);
    hex.addEventListener('mouseenter', function(){
      Interface.tileInfo(tile);
    });
    hex.addEventListener('mouseleave', function(e){
      let tile = e.target || e.srcElement;
      let wrap = $('ui-wrapper');
      let info = $('tileInfo');
        if (info !== null){
        wrap.removeChild(info);
        }
    });
    if (tile.terrain === null) {
      hex.setAttribute('stroke','#1C336A');
      hex.setAttribute('class','blank');
      hex.setAttribute('fill', "url('#dust')");
      hex.setAttribute('opacity','1');
      let blanks = $('blanks');
      blanks.appendChild(hex);
    }  
  }
    //the "points" attribute has to be set last, 
      //otherwise the tiles won't move when the board expands
  if (tile.terrain !== null) {
      hex.setAttribute('class','tile');
      hex.setAttribute('fill', "transparent");
      hex.setAttribute('opacity','1');
      hex.setAttribute('stroke','rgb(30,30,30, 0.8)');
      let tiles = $('tiles');
      tiles.appendChild(hex);
    }  
    if (owner === user) {
      hex.setAttribute('owner', owner);
      hex.setAttribute('fill', "url('#green')");
      hex.setAttribute('stroke','rgb(0,255,0, 0.6)');
    } 
    
    if (owner !== user && owner !== "Unclaimed" && owner !== null) {
      hex.setAttribute('owner', owner);
      hex.setAttribute('fill', "url('#blue')"); 
    }
    hex.setAttribute('owner', owner);
    hex.setAttribute('points', points); 
};

Interface.unitSVG = function (unit, user, target) {
  let svg = $('svg');
  let wrap = $('main-wrapper');
  let unitFrame = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  let entity = JSON.stringify(unit);
  let owner = null;
  if(unit.owner !== undefined) {
    owner = unit.owner;
  }
  
  unitFrame.setAttribute('entity', entity);
  unitFrame.setAttribute('class','unit');
  let center = drawAt(unit, Game.board.size);
  unitFrame.setAttribute('cx', center.x );
  unitFrame.setAttribute('cy', center.y );
  unitFrame.setAttribute('r', 45);
  unitFrame.setAttribute('stroke-width','2px');
  unitFrame.setAttribute('stroke','rgb(0,255,0, 0.6)');
  //unitFrame.setAttribute('fill', "url('#green')");
    if (owner === user) {
      unitFrame.setAttribute('owner', owner);
      unitFrame.setAttribute('fill', "url('#green')");
    } 

  unitFrame.addEventListener('mouseenter', function(e){
    });
  unitFrame.addEventListener('mouseleave', function(e){
    });
  unitFrame.addEventListener('click', Interface.abilities);
  svg.appendChild(unitFrame);
  }

export {Interface};