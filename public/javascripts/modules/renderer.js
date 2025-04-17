import {drawAt} from './common.js';

let Renderer = {};

const drawTileAt = function(tile, size, edgeLength) {

  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  
  let centerX = size[0] /2;
  let centerY = size[1] /2;
    
  let tx = tile._x * edgeW + centerX;
  let ty = (-tile._y + tile._z) * edgeH + centerY -  20;

  let px = [];
  let py = [];
  

  for (let j = 1; j <= 6; j++) {
    let pointX = tx + Math.cos(j / 6 * (Math.PI *2)) * edgeLength;
    let pointY = ty + Math.sin(j / 6 * (Math.PI *2)) * edgeLength;
    px.push(pointX);
    py.push(pointY);
  }
  
  const points = new pos(tx, ty, px, py);

  return points;
  //return {x: tx, y: ty, edgeLength};
};



Renderer.tiles = function (ctx, atlas, tile, board) {
  let target = drawTileAt(tile, board, 80);
  
  ctx.moveTo(target.px[0], target.py[0]);
  for (let i in target.px) {
    ctx.lineTo(target.px[i], target.py[i]);
  }
  
  ctx.fillStyle = "#a0b35a";
  ctx.fill();
  ctx.moveTo(target.x, target.y);

/*  ctx.drawImage(
    atlas, //image 
    0, // source x
    0,        //source y
    160,      //source width
    160,      //source heigh
    target.x -80,   //target x
    target.y - 80, //target y
    160,      //target width
    160       //target height
  );
*/
};

export {Renderer}