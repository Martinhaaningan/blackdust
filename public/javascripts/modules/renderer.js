import {drawAt, drawEle} from './common.js';

let Renderer = {};

function DegToRad(d)  {  
  // Converts degrees to radians  
  return d * 0.01745;  
  } 

function shadeColor(color, percent) {
  color = color.substr(1);
  var num = parseInt(color, 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}




Renderer.tiles = function (ctx, tile, board) {
  //drawAt
  let color = "#89ca56";
  let elevation = tile.elevation * 20;
  let bigtarget = drawAt(tile, board, 80);

  let target = drawEle(tile, board, 80);
  
  //draw a base
  ctx.moveTo(target.px[0], target.py[0]);
  for (let i in target.px) {
    ctx.lineTo(target.px[i], target.py[i]);
  }
  
  ctx.fillStyle = color;
  ctx.fill();

  //draw a new smaller top base and use it to draw the sides
  let side1 = new Path2D();
  side1.moveTo(target.px[2], target.py[2]);
  side1.lineTo(bigtarget.px[2], bigtarget.py[2]);
  side1.lineTo(bigtarget.px[1], bigtarget.py[1]);
  side1.lineTo(target.px[1], target.py[1]);
  side1.closePath();
  ctx.fillStyle = shadeColor(color, -40);
  ctx.fill(side1);

  let side2 = new Path2D();
  side2.moveTo(target.px[1], target.py[1]);
  side2.lineTo(bigtarget.px[1], bigtarget.py[1]);
  side2.lineTo(bigtarget.px[0], bigtarget.py[0]);
  side2.lineTo(target.px[0], target.py[0]);
  side2.closePath();
  ctx.fillStyle = shadeColor(color, -20);
  ctx.fill(side2);

  let side3 = new Path2D();
  side3.moveTo(target.px[0], target.py[0]);
  side3.lineTo(bigtarget.px[0], bigtarget.py[0]);
  side3.lineTo(bigtarget.px[5], bigtarget.py[5]);
  side3.lineTo(target.px[5], target.py[5]);
  side3.closePath();
  ctx.fillStyle = shadeColor(color, -10);
  ctx.fill(side3);


  // ctx.moveTo(target.tx, target.ty);
  // ctx.drawImage(
  //   atlas, //image 
  //   160, // source x
  //   0,        //source y
  //   160,      //source width
  //   160,      //source heigh
  //   target.tx -80,   //target x
  //   target.ty - 80 - (tile.elevation * 10), //target y
  //   160,      //target width
  //   160       //target height
  // );

};

let angle = 0;

Renderer.dust = function(ctx, tile, board, img) {
  let target = drawAt(tile, board, 80);
  ctx.save();
  ctx.translate(target.tx, target.ty);
  ctx.rotate(DegToRad(angle));
  ctx.drawImage(img, -80, -80);
  ctx.restore();
  angle = angle + 0.008;
}

Renderer.dustLifting = function() {

  let ctx = Game.ctx; 
  for (let i = 0; i < 20; i++) {
    ctx.save(); 
    ctx.translate(Game.currentEvent.x, Game.currentEvent.y);
    ctx.rotate(DegToRad(angle));
    ctx.drawImage(Game.dust, -80, -80);
    ctx.restore();
    angle = angle + 0.008;
  }

  //console.log(Game.initAnimations);
  Game.initAnimations.splice(-1,1);
}

//new drawCanvas function here

export {Renderer}