import {drawAt} from './common.js';

let Renderer = {};


// Renderer.renderCanvas = function (gridArray) {
//   let x, y, z;
//   for (let i = 0; i < gridArray.length; i++) {
//     [x,y,z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];
//     let terrain = gridArray[i].terrain;
//     let target = drawAt(x,y,z);

//     if (terrain !== null){
//       Renderer.drawCanvas(terrain, this.tileAtlas, target.x, target.y);
//       //Game.drawCanvas(terrain, this.buildingsAtlas, target.x, target.y);
//     }
//   }
// };

Renderer.drawCanvas = function (ctx, key, atlas, x, y) {
  ctx.moveTo(x, y);
  ctx.drawImage(
    atlas, //image 
    (key)* 160, // source x
    0,        //source y
    160,      //source width
    140,      //source heigh
    x -79,   //target x
    y - 70, //target y
    160,      //target width
    140       //target height
  );

};

export {Renderer}