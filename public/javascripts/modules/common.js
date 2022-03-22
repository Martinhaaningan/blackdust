'use strict'
const $ = function(foo) {

    return document.getElementById(foo);
};

const drawAt = function(x,y,z, size) {
    
  let edgeLength = 80;
  let edgeW = edgeLength * 3/2;
  let edgeH = edgeLength * Math.sqrt(3) / 2;
  
  let centerX = size[0] /2;
  let centerY = size[1] /2;
    
  let tx = x* edgeW + centerX;
  let ty = (-y+z) * edgeH + centerY;
  return {x: tx, y: ty, edgeLength};
};

export {$, drawAt};