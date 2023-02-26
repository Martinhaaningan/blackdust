'use strict'
const $ = function(foo) {

    return document.getElementById(foo);
};

function pos(tx, ty, px, py) {
  // pos indicates a position inside a canvas/svg element
  //t values are used for drawing a bitmap from an atlas
  //p values is an array of the points of a hex used for svg or canvas drawing 
  this.tx = tx;
  this.ty = ty;
  this.px = px;
  this.py = py;
}

const drawAt = function(tile, size) {
    
  let edgeLength = 80;
  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  
  let centerX = size[0] /2;
  let centerY = size[1] /2;
    
  let tx = tile._x * edgeW + centerX;
  let ty = (-tile._y + tile._z) * edgeH + centerY;

  let px = [];
  let py = [];
  

  for (let j = 1; j <= 6; j++) {
    let pointX = tx + Math.cos(j / 6 * (Math.PI *2)) * 79;
    let pointY = ty + Math.sin(j / 6 * (Math.PI *2)) * 79;
    px.push(pointX);
    py.push(pointY);
  }
  const points = new pos(tx, ty, px, py);

  return points;
  //return {x: tx, y: ty, edgeLength};
};

export {$, drawAt};