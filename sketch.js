var tiling;
var img;
var color_data;
var colors;
var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var finished_loading = false;
var upload_button;
var upload_button_graphics;
var slides;
var current_slide;
var transition;
var transition_bound;
var save_button;
var restart_button;
var color_map_button;

function setup() {
	pixelDensity(1);

	start_time = millis();

	var x = windowWidth / 2;
	var y = windowHeight / 2 + windowHeight / 5.5;
	var w = windowWidth * .15;
	var h = windowHeight * .15;

	upload_button = createFileInput(handleFile);
	upload_button.style("opacity", "0");
	upload_button.style("cursor", "pointer")
	upload_button.position(x - w/2, y - h/2);
	upload_button.size(w, h);
	upload_button.show();

	canv = createCanvas(windowWidth, windowHeight);

	upload_button_graphics = new UploadButtonGraphics();
	save_button = new SaveButton();
	restart_button = new RestartButton();
	color_map_button = new ColorMapButton();

	slides = [];
	for (var i = 0; i < 3; i++){
		slides[i] = createGraphics(windowWidth, windowHeight);
		slides[i].pixelDensity(1);
	}
	current_slide = 0;

	transition = false;

	tiling = new Tiling(windowWidth / 2, windowHeight / 2);

	loadData();
}

function loadData(){
	loadImage('background.png', function(img) {background_image = img; doneLoading();});
	loadStrings('crayola_colors.txt', function(txt) {color_data = txt; doneLoading();});
	loadFont('lane.ttf', function(font) {myFont = font; doneLoading();});
}

function doneLoading(){
	if (typeof(background_image) == 'undefined')
		return false;

	if (typeof(color_data) == 'undefined')
		return false;

	if (typeof(myFont) == 'undefined')
		return false;

	colors = [];
	for (var i = 0; i < color_data.length; i++){
		var info = split(color_data[i], ',');
		colors[i] = {color: color(info[1]), id: alphabet[floor(i / 10)] + (i % 10), label: info[0]};
	}
	finished_loading = true;
}

function draw() {
	clear();
	if (finished_loading){
		if (current_slide == 0){
			slides[0].push();
			backgroundImage(0);	
			slides[0].fill(255);
			slides[0].stroke(100);
			slides[0].textAlign(CENTER, CENTER);
			slides[0].textSize(140);
			slides[0].textFont("Lane");
			slides[0].text("c0l0r.me", windowWidth / 2, windowHeight / 2 - windowHeight / 5.5);

			slides[0].textSize(40);
			// textFont("Arial")
			slides[0].text("Turn any image into a color by numbers", windowWidth / 2, windowHeight / 2);
			slides[0].pop();	

			upload_button_graphics.show();
		}

		if (current_slide == 1 || (current_slide == 0 && transition)){
			canvas.style.cursor = 'wait';
			slides[1].push();
			backgroundImage(1);
			var h = windowHeight * 0.8;
			var w = h * (tiling.image.width / tiling.image.height);
			if (w > 0.8 * windowWidth){
				w = 0.8 * windowWidth;
				h = w * (tiling.image.height / tiling.image.width);
			}
			var x = windowWidth / 2;
			var y = windowHeight / 2;
			slides[1].imageMode(CENTER);
			slides[1].image(tiling.image, x, y - windowHeight/28, w, h);
			slides[1].fill(255);
			slides[1].noStroke();
			slides[1].textAlign(CENTER, CENTER);
			slides[1].textFont(myFont);
			slides[1].textSize(30);
			slides[1].text("Drawing your custom color by numbers...", windowWidth / 2, windowHeight - windowHeight / 10);
			slides[1].textSize(20);
			slides[1].text("(this may take a minute or two)", windowWidth / 2, windowHeight - windowHeight / 20);
			slides[1].pop();

		}

		if (current_slide == 2){
			canvas.style.cursor = 'auto';
			slides[2].push();
				backgroundImage(2);
				tiling.show();
			slides[2].pop();
			save_button.show();
			restart_button.show();
			color_map_button.show();
		}

		if (transition){
			if (transition_bound <= 0){
				transition = false;
				current_slide++;
				image(slides[current_slide], 0, 0, windowWidth, windowHeight);
				setTimeout(function() {tiling.tilize();}, 2000);
			}
			else {
				image(slides[current_slide], 0, transition_bound - windowHeight, windowWidth, windowHeight);
				image(slides[current_slide + 1], 0, transition_bound, windowWidth, windowHeight);
				transition_bound -= 60;
			}
		}
		else {
			image(slides[current_slide], 0, 0, windowWidth, windowHeight);
		}

		if (tiling.tilized && current_slide == 1){
			current_slide++;
		}
	}
	else
		background(0);

	

	// fill(255);
	// text(windowWidth + ", " + windowHeight, 50, 50);
	
	// tiling.show();
}

function backgroundImage(i){
	slides[i].resetMatrix();
	slides[i].clear();
	if (i >= 1){
		slides[i].translate(windowWidth / 2, windowHeight / 2);
		slides[i].rotate(Math.PI);
		slides[i].translate(-windowWidth / 2, -windowHeight / 2);
	}
	slides[i].imageMode(CENTER);
	var ratio = (background_image.width / background_image.height);
	var w, h;
	if (windowWidth / windowHeight < ratio){
		h = windowHeight;
		w = h * ratio;
		slides[i].image(background_image, windowWidth / 2, windowHeight / 2, w, h);
	}
	else {
		w = windowWidth;
		h = w * (1/ratio);
		slides[current_slide].image(background_image, windowWidth / 2, windowHeight / 2, w, h);
	}
	slides[i].fill(0, 100);
	slides[i].rect(0, 0, windowWidth, windowHeight);
	slides[i].resetMatrix();
}

function mousePressed(){
	save_button.onClick();
	restart_button.onClick();
	color_map_button.onClick();
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	for (var i = 0; i < 3; i++){
		delete slides[i];
		slides[i] = createGraphics(windowWidth, windowHeight);
		slides[i].pixelDensity(1);
	}

	var x = windowWidth / 2;
	var y = windowHeight / 2 + windowHeight / 5.5;
	var w = windowWidth * .15;
	var h = windowHeight * .15;
	upload_button.position(x - w/2, y - h/2);
	upload_button.size(w, h);

	tiling.position(windowWidth / 2, windowHeight / 2);
}

function handleFile(file){
	loadImage(file.data, function(img){
		tiling.image = img;
		var h = 2000;
		var w = h * (tiling.image.width / tiling.image.height);
		tiling.image.resize(w, h);
		tiling.initialize();
		transition = true;
		transition_bound = windowHeight;
		upload_button.hide();
	});
	
}

function UploadButtonGraphics(){
	this.show = function(){
		var x = windowWidth / 2;
		var y = windowHeight / 2 + windowHeight / 5.5;
		var w = windowWidth * .15;
		var h = windowHeight * .15;
		slides[0].push();
			canvas.style.cursor = this.mouseOver() ? 'pointer' : 'auto';
			slides[0].fill(this.mouseOver() ? [184, 225, 255] : 255);
			slides[0].noStroke();
			slides[0].rectMode(CENTER);
			slides[0].rect(x, y, w, h, 20);
			slides[0].textFont(myFont);
			windowWidth < 1200 ? slides[0].textSize(34) : slides[0].textSize(40);
			windowWidth < 1000 ? slides[0].textSize(24) : slides[0].textSize(34);
			slides[0].textAlign(CENTER, CENTER);
			slides[0].fill(100);
			slides[0].text("UPLOAD", windowWidth / 2, windowHeight / 2 + windowHeight / 5.5 - 5);
		slides[0].pop();
	}

	this.mouseOver = function(){
		return (withinBounds(mouseX, mouseY, this.bounds()));
	}

	this.bounds = function(){
		var x = windowWidth / 2;
		var y = windowHeight / 2 + windowHeight / 5.5;
		var w = windowWidth * .15;
		var h = windowHeight * .15;	
		return [x - w / 2, x + w / 2, y - h / 2, y + h / 2];
	}
}

function SaveButton(){
	this.show = function(){
		var x = windowWidth / 2 - windowWidth / 6;
		var y = windowHeight - windowHeight / 13;
		var w = windowWidth * .2;
		var h = windowHeight * .065;

		slides[2].push();
			this.mouseOver() ? canvas.style.cursor = 'pointer' : null;
			slides[2].fill(this.mouseOver() ? [184, 225, 255] : 255);
			slides[2].textFont(myFont);
			slides[2].noStroke();
			slides[2].rectMode(CENTER);
			slides[2].rect(x, y, w, h, 10);
			slides[2].textSize(windowWidth < 1200 ? 16 : 20);
			slides[2].textAlign(CENTER, CENTER);
			slides[2].fill(100);
			slides[2].text("Download Colorable Version", x, y - 3);
		slides[2].pop();
	}

	this.mouseOver = function(){
		return (withinBounds(mouseX, mouseY, this.bounds()));
	}

	this.bounds = function(){
		var x = windowWidth / 2 - windowWidth / 6;
		var y = windowHeight - windowHeight / 13;
		var w = windowWidth * .2;
		var h = windowHeight * .065;
		return [x - w / 2, x + w / 2, y - h / 2, y + h / 2];
	}

	this.onClick = function(){
		if (this.mouseOver() && current_slide == 2)
			tiling.save();
	}
}

function RestartButton(){
	this.show = function(){
		var x = windowWidth / 2 + windowWidth / 35;
		var y = windowHeight - windowHeight / 13;
		var w = windowWidth * .12;
		var h = windowHeight * .065;

		slides[2].push();
			this.mouseOver() ? canvas.style.cursor = 'pointer' : null;
			slides[2].fill(this.mouseOver() ? [184, 225, 255] : 255);
			slides[2].textFont(myFont);
			slides[2].noStroke();
			slides[2].rectMode(CENTER);
			slides[2].rect(x, y, w, h, 10);
			slides[2].textSize(windowWidth < 1200 ? 16 : 20);
			slides[2].textAlign(CENTER, CENTER);
			slides[2].fill(100);
			slides[2].text("Start Over", x, y - 3);
		slides[2].pop();
	}

	this.mouseOver = function(){
		return (withinBounds(mouseX, mouseY, this.bounds()));
	}

	this.bounds = function(){
		var x = windowWidth / 2 + windowWidth / 35;
		var y = windowHeight - windowHeight / 13;
		var w = windowWidth * .12;
		var h = windowHeight * .065;
		return [x - w / 2, x + w / 2, y - h / 2, y + h / 2];
	}

	this.onClick = function(){
		if (this.mouseOver() && current_slide == 2)
			window.location.href = 'http://c0l0r.me';
	}
}

function ColorMapButton(){
	this.graphics = createGraphics(1200 * (11 / 8.5), 1200);
	this.graphics.pixelDensity(1);
	this.initialized = false;

	this.show = function(){
		var x = windowWidth / 2 + windowWidth / 5;
		var y = windowHeight - windowHeight / 13;
		var w = windowWidth * .14;
		var h = windowHeight * .065;

		slides[2].push();
			this.mouseOver() ? canvas.style.cursor = 'pointer' : null;
			slides[2].fill(this.mouseOver() ? [184, 225, 255] : 255);
			slides[2].textFont(myFont);
			slides[2].noStroke();
			slides[2].rectMode(CENTER);
			slides[2].rect(x, y, w, h, 10);
			slides[2].textSize(windowWidth < 1200 ? 16 : 20);
			slides[2].textAlign(CENTER, CENTER);
			slides[2].fill(100);
			slides[2].text("Printable Color Map", x, y - 3);
		slides[2].pop();
	}

	this.initialize = function(){
		var g = this.graphics;
		var h = g.height * 0.9;
		var w = 100;

		var columns = 4;
		var rect_height = h / ceil(colors.length / columns);
		// print(colors)
		g.push();
		g.background(255);
		for (var j = 0; j < columns; j++){
			for (var i = 0; i < ceil(colors.length / columns); i++){
				if (typeof(colors[i + j * ceil(colors.length / columns)]) != 'undefined'){
					g.fill(colors[i + j * ceil(colors.length / columns)].color.levels);
					g.noStroke();
					g.rect(g.width / 2 + (j-1.5) * g.width / 4 - 20, g.height / 2 - h / 2 + i * rect_height, w, rect_height);
					g.fill(0);
					g.textFont("Courier New");
					g.textSize(18);
					g.textAlign(LEFT, CENTER);
					g.text(colors[i + j * ceil(colors.length / columns)].id, g.width / 2 + (j-1.5) * g.width / 4 - 60, g.height / 2 - h / 2 + i * rect_height + 13);
				}
			}
		}
		g.pop();

		this.initialized = true;
	}

	this.onClick = function(){
		if (this.mouseOver() && current_slide == 2){
			if (!this.initialized)
				this.initialize();
			saveCanvas(this.graphics, "c0l0rmap", 'jpg');
		}
	}

	this.mouseOver = function(){
		return (withinBounds(mouseX, mouseY, this.bounds()));
	}

	this.bounds = function(){
		var x = windowWidth / 2 + windowWidth / 5;
		var y = windowHeight - windowHeight / 13;
		var w = windowWidth * .14;
		var h = windowHeight * .065;
		return [x - w / 2, x + w / 2, y - h / 2, y + h / 2];
	}
}

// function 

// function keyPressed(){
// 	if (keyCode == ENTER){
// 		tiling.tilize();
// 	}

// 	if (key == ' '){
// 		tiling.toggleDisplayMode();
// 	} 
// }
