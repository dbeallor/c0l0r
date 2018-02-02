function Tiling(x, y){
	this.display_mode = 1;
	this.tilized = false;
	this.pos = createVector(x, y);
	this.width;
	this.height;
	this.image;
	this.area_threshold;
	this.graphic;
	this.shapes;
	this.workers = [];
	this.chunks = [];

	this.show = function(){
		slides[2].resetMatrix();
		slides[2].imageMode(CENTER);
		var h = windowHeight * 0.8;
		var w = h * (this.image.width / this.image.height);
		if (w > 0.8 * windowWidth){
			w = 0.8 * windowWidth;
			h = w * (this.image.height / this.image.width);
		}
		slides[2].image(this.graphic, this.pos.x, this.pos.y - windowHeight/28, w, h);
	}

	this.initialize = function(){
		this.width = this.image.width;
		this.height = this.image.height;
		this.area_threshold = this.image.width * this.image.height / 15000;
		this.graphic = createGraphics(this.width, this.height);

		for (var i = 0; i < navigator.hardwareConcurrency; i++){
			this.workers[i] = new Worker('c0l0rworker.js');
			this.workers[i].addEventListener('message', function(e){
				tiling.sectionColored(e.data.work, e.data.chunk);
			}, false);
		}

		// Start with one rectangular shape with the same dimensions and position as the image to tile
		var v1 = createVector(0, 0);
		var v2 = createVector(this.width, 0);
		var v3 = createVector(this.width, this.height);
		var v4 = createVector(0, this.height);
		this.shapes = [new p5Shape([v1, v2, v3, v4], this.graphic)];
	}

	this.tilize = function(){
		var divisions;
		var fail_counter = 0;
		var dir = 0;
		this.graphic.image(this.image, 0, 0);
		while (fail_counter < 3){
			divisions = this.subdivide(dir);
			dir = (dir + 1) % 2;
			print(divisions);
			if (divisions > 0)
				fail_counter = 0;
			else
				fail_counter++;
		}
		// print(this.shapes.length);
		this.setColors();
	}

	this.subdivide = function(dir){
		var divisions = 0;
		for (var i = this.shapes.length - 1; i >= 0; i--){
			// If the shape can be divided in three and still be above the threshold
			if (this.shapes[i].area() / 3 > this.area_threshold){
				// Subdivide the shape
				var new_shapes = this.shapes[i].subdivide(dir);
				// If both subdivided halves are above the threshold, replace the shape with them
				if (new_shapes[0].area() >= this.area_threshold && new_shapes[1].area() >= this.area_threshold && new_shapes[0].wellProportioned() && new_shapes[1].wellProportioned()){
					// new_shapes[0].breadth() >= this.breadth_threshold && new_shapes[1].breadth() >= this.breadth_threshold){
					this.shapes.splice(i, 1);
					this.shapes = splice(this.shapes, new_shapes, i);
					divisions++;
				}
				// Otherwise try again
				else{
					// Subdivide the shape
					var new_shapes = this.shapes[i].subdivide(dir);
					// If both subdivided halves are above the threshold, replace the shape with them
					if (new_shapes[0].area() >= this.area_threshold && new_shapes[1].area() >= this.area_threshold && new_shapes[0].wellProportioned() && new_shapes[1].wellProportioned()){
						// new_shapes[0].breadth() >= this.breadth_threshold && new_shapes[1].breadth() >= this.breadth_threshold){
						this.shapes.splice(i, 1);
						this.shapes = splice(this.shapes, new_shapes, i);
						divisions++;
					}
				}
			}
		}
		return divisions;
	}

	this.refresh = function(){
		this.graphic.clear();
		for (var i = 0; i < this.shapes.length; i++)
			this.shapes[i].show(this.display_mode);
	}

	this.setColors = function(){
		var img_pixels = [];
		this.image.loadPixels();
		for (var i = 0; i < this.image.pixels.length; i++)
			img_pixels[i] = this.image.pixels[i];

		var centroids = [];
		for (var i = 0; i < this.shapes.length; i++)
			centroids[i] = [this.shapes[i].centroid.x, this.shapes[i].centroid.y];

		var start, stop;
		for (var i = 0; i < this.workers.length; i++){
			start = i * floor(this.shapes.length / this.workers.length);
			stop = (i == this.workers.length - 1) ? this.shapes.length : (i + 1) * floor(this.shapes.length / this.workers.length);
			// print(start + ', ' + stop)
			var w = this.image.width;
			var h = this.image.height;
			this.workers[i].postMessage({
				pixels: img_pixels,
				start: start,
				stop: stop,
				colors: colors,
				width: w,
				height: h,
				chunk: i,
				centroids: centroids
			});
		}
	}

	this.sectionColored = function(colors, chunk){
		this.chunks[chunk] = colors;
		this.doneColoring();
	}

	this.doneColoring = function(){
		for (var i = 0; i < this.workers.length; i++)
			if (typeof(this.chunks[i]) == 'undefined')
				return false;

		var shape_idx = 0;
		for (var i = 0; i < this.chunks.length; i++){
			for (var j = 0; j < this.chunks[i].length; j++){
				this.shapes[shape_idx].setFill(this.chunks[i][j]);
				shape_idx++;
			}
		}

		this.tilized = true;
		this.refresh();
	}

	this.toggleDisplayMode = function(){
		this.display_mode = (this.display_mode + 1) % 2;
		this.refresh();
	}

}