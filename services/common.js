function roll(s) {
	return Math.floor(Math.random()*s);
}

//tiles from the db are allways local, maplocations are always regional
function getRegional (location, tile){
	let regx = location._x + tile._x;
	let regy = location._y + tile._y;
	let regz = location._z + tile._z;
	return {_x: regx, _y: regy, _z: regz}
}

function getLocal (location, tile){
	let localx = (location._x - tile._x) * -1;
	let localy = (location._y - tile._y) * -1;
	let localz = (location._z - tile._z) * -1;
	return {_x: localx, _y: localy, _z: localz}
}
//This is witchcraft! Source: https://stackoverflow.com/questions/43011742/how-to-omit-specific-properties-from-an-object-in-javascript/43011802
function sanitizeTiles (tiles) {
	let cleanTiles = [];
	let filter = ({_x, _y, _z, terrain, owner, elevation, slots, resources}) => ({_x, _y, _z, terrain, owner, elevation, slots, resources})
	for (let t in tiles) {
		let filtered = filter(tiles[t]);
		cleanTiles.push(filtered);
	}
	return cleanTiles;
}

function isMatch(arr, val){
	return arr.some(function(arrVal){
		if (val._x === arrVal._x && val._y === arrVal._y && val._z === arrVal._z){
			return true;
		}
	})
}

function rollCoord(s,umd,nmd,keys){
			
	let coord = nmd[s] + umd[s] + roll(2)+1;

	let n = Boolean(roll(2));
	if (!n) { //Should the coordinate stay positive? True or false?
		coord = -Math.abs(coord);
	}
	let newKey = keys.splice(s,1);
	nmd.splice(s,1);
	umd.splice(s,1);
	return {[newKey]: coord};
}