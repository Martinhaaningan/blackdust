let Animations = {};
let angle = 0;

Animations.dust = function(ctx, target, img) {

	ctx.save();
	ctx.translate(target.x, target.y);
	ctx.rotate(DegToRad(angle));
	ctx.drawImage(img, -80, -80);
	ctx.restore();
	angle = angle + 0.05;
}

function DegToRad(d)  {  
	// Converts degrees to radians  
	return d * 0.01745;  
	} 

export {Animations}