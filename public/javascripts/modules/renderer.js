import {drawAt} from './common.js';

let Renderer = {};

Renderer.drawCanvas = function (ctx, atlas, tile, target) {
  ctx.moveTo(target.tx, target.ty);
  ctx.drawImage(
    atlas, //image 
    (tile.terrain.key)* 160, // source x
    0,        //source y
    160,      //source width
    160,      //source heigh
    target.tx -80,   //target x
    target.ty - 80 - (tile.elevation * 10), //target y
    160,      //target width
    160       //target height
  );

};

//new drawCanvas function here

export {Renderer}