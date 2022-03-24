import {drawAt} from './common.js';

let Renderer = {};

Renderer.drawCanvas = function (ctx, key, atlas, target) {
  ctx.moveTo(target.x, target.y);
  ctx.drawImage(
    atlas, //image 
    (key)* 160, // source x
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