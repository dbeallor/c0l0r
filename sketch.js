var tiling;
var img;
var color_data;
var colors;
var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function preload(){
	img = loadImage('sunset.png');

	color_data = loadStrings('crayola_colors.txt');
}

function setup() {
	pixelDensity(1);
	canv = createCanvas(windowWidth, windowHeight);

	var h = 700;
	var w = h * (img.width / img.height);
	img.resize(w, h);

	colors = [];
	for (var i = 0; i < color_data.length; i++){
		var info = split(color_data[i], ',');
		colors[i] = {color: color(info[1]), id: alphabet[floor(i / 10)] + (i % 10), label: info[0]};
	}

	tiling = new Tiling(img, windowWidth / 2, windowHeight / 2, img.width, img.height);
	tiling.tilize();
}

function draw() {
	clear();
	background(51);

	imageMode(CENTER);
	var h = windowHeight * 0.8;
	var w = h * (img.width / img.height);
	image(img, windowWidth / 2, windowHeight / 2, w, h);

	tiling.show();

	// fill(255);
	// text(mouseX + ", " + mouseY, 50, 50);
}

function keyPressed(){
	if (keyCode == ENTER){
		tiling.tilize();
	}

	if (key == ' '){
		tiling.toggleDisplayMode();
	} 
}
