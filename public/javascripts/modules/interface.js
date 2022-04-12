import {$, drawAt} from './common.js';
import {Events} from './events.js';
import {Game} from '../main.js';
import {Animations} from './animations.js';
let Interface = {}
let activeSpell;

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
  let terrain = document.createTextNode('terrain: ' + tile.terrain);
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
  info.style.width = '130px';
  info.style.height = '200px';
  info.style.bottom = 30 + 'px';
  info.style.right = 30 +'px';
  info.style.zIndex = '4';

  wrap.appendChild(info);
};

Interface.spellsInterface = function (spells, user) {
  let spellsUi = $('spells-ui');
    let spellCard = document.createElement('div');
    spellCard.setAttribute('class', 'spellCard');
    spellCard.style.height = '200px';
    spellCard.style.width = '130px';
    spellCard.style.top = 100 + 'px';
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
    label.innerHTML = spells[0];
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
    activateBtn.setAttribute('id','spellBtn');
    activateBtn.style.height = '30px';
    activateBtn.style.width = '80%';
    activateBtn.style.color = '#ece271';
    activateBtn.style.backgroundColor = '#4E1717';
    activateBtn.style.border = '1px solid #1C336A';
    activateBtn.style.marginLeft = '12px';
    activateBtn.style.marginTop = '7px';
    activateBtn.style.opacity = '0.8';
    activateBtn.addEventListener('click', function(){
      activateBtn.style.opacity = '1';
      activateBtn.style.border = '1px solid #ece271';
      let tiles = document.getElementsByClassName('blank');
      //Note: when it's a nodelist you must use this loop,
      //and not (let t in tiles) which throws errors
      for (let t = 0; t < tiles.length; t++) {
        tiles[t].setAttribute('stroke','#ece271');
        tiles[t].addEventListener('click', Interface.revealTile, true);
      }
    });
    activateBtn.appendChild(text);
    spellCard.appendChild(activateBtn);
    spellsUi.appendChild(spellCard);
};

Interface.revealTile = function(event){
  event.stopPropagation();
  let tile = event.target || event.srcElement;
  let target = tile.getBoundingClientRect();
  
  let coords = tile.getAttribute('coords');
  console.log("hit! on tile: " + coords);
  let btn = $('spellBtn');
  btn.style.opacity = '0.8';
  btn.style.border = '1px solid #1C336A';
  Events.tileRequest(coords);
  Events.tileResult(function(newTile){
    Game.prepareTile(newTile);
  });
  let tiles = document.getElementsByClassName('blank');
    //Note: when it's a nodelist you must use this loop,
      //and not (let t in tiles) which throws errors
  for (let t= 0; t < tiles.length; t++) {
    tiles[t].setAttribute('stroke','#1C336A');
    tiles[t].removeEventListener('click', Interface.revealTile, true);
  }
  let wrap = $('ui-wrapper');
  let info = $('tileInfo');
    if (info !== null){
      wrap.removeChild(info);
    }
}

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

Interface.renderSVG = function (tile, user, target) {
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
    hex.setAttribute('stroke','rgb(30,30,30, 0.8)');
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
    }  
  }
    //the "points" attribute has to be set last, 
      //otherwise the tiles won't move when the board expands
  if (tile.terrain !== null) {
      hex.setAttribute('class','tile');
      hex.setAttribute('fill', "transparent");
      hex.setAttribute('opacity','1');
      hex.setAttribute('stroke','rgb(30,30,30, 0.8)');
    }  
    if (owner === user) {
      hex.setAttribute('owner', owner);
      hex.setAttribute('fill', "url('#green')");
    } 

    if (owner !== user && owner !== null) {
      hex.setAttribute('owner', owner);
      hex.setAttribute('fill', "url('#blue')"); 
    }
    hex.setAttribute('owner', owner);
    hex.setAttribute('points', points); 
    svg.appendChild(hex);
};

export {Interface};