import {drawAt} from './common.js';

let Renderer = {};

function DegToRad(d)  {  
  // Converts degrees to radians  
  return d * 0.01745;  
  } 

Renderer.tiles = function (ctx, atlas, tile, board) {
  let target = drawAt(tile, board, 80);
  ctx.moveTo(target.x, target.y);
  ctx.drawImage(
    atlas, //image 
    (tile.terrain.key)* 160, // source x
    0,        //source y
    160,      //source width
    160,      //source heigh
    target.x -80,   //target x
    target.y - 80, //target y
    160,      //target width
    160       //target height
  );

};

export {Renderer}