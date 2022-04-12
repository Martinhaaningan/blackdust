import {Game} from '../main.js';

let Animations = {};
let angle = 0;

Animations.dust = function(ctx, target, img) {

	ctx.save();
	ctx.translate(target.x, target.y);
	ctx.rotate(DegToRad(angle));
	ctx.drawImage(img, -80, -80);
	ctx.restore();
	angle = angle + 0.008;
}

Animations.dustLifting = function() {
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

function DegToRad(d)  {  
	// Converts degrees to radians  
	return d * 0.01745;  
	} 

export {Animations}