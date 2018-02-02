function p5Shape(vertices, graphic){
	this.vertices = vertices;
	this.graphic = graphic;
	this.fill = 255;
	this.id = 'A1';

	var average = createVector(0, 0);
	for (var i = 0; i < this.vertices.length; i++){
		average.add(this.vertices[i]);
	}
	average.mult(1/this.vertices.length)
	this.centroid = createVector(average.x, average.y);

	this.show = function(mode){
		this.graphic.push();
			if (mode == 1){
				this.graphic.fill(this.fill);
				this.graphic.stroke(this.fill);
			}
			else {
				this.graphic.fill(255);
				this.graphic.stroke(230);
				this.graphic.strokeWeight(0.5);
			}
			// this.graphic.noStroke();
			this.graphic.beginShape();
			for (var i = 0; i < this.vertices.length; i++){
				this.graphic.vertex(this.vertices[i].x, this.vertices[i].y);
			}
			this.graphic.endShape(CLOSE);
		
			if (mode == 0){
				this.graphic.fill(230);
				this.graphic.textSize(8);
				this.graphic.textFont("Courier New");
				this.graphic.noStroke();
				this.graphic.textAlign(CENTER, CENTER);
				this.graphic.text(this.id, this.centroid.x, this.centroid.y);
			}
		this.graphic.pop();
	}

	this.area = function(){
		var area = 0;
		var v1, v2, vn;
		for (var i = 1; i < this.vertices.length; i++){
			v1 = this.vertices[i-1];
			v2 = this.vertices[i];
			area += v1.x * v2.y - v1.y * v2.x;
		}
		v1 = this.vertices[0];
		vn = this.vertices[this.vertices.length - 1];
		area += vn.x * v1.y - vn.y * v1.x;
		return Math.abs(area / 2);
	}

	this.subdivide = function(dir){
		var new_shapes = [];

		// print(this.vertices);

		var v1 = this.vertices[0];
		var v2 = this.vertices[1];
		var v3 = this.vertices[2];
		var v4 = this.vertices[3];

		var start1 = dir == 0 ? createVector(v1.x, v1.y) : createVector(v4.x, v4.y);
		var vec1 = dir == 0 ? createVector(v2.x - v1.x, v2.y - v1.y) : createVector(v1.x - v4.x, v1.y - v4.y);
		// print(vec1)
		// print(start1)

		var start2 = dir == 0 ? createVector(v4.x, v4.y) : createVector(v3.x, v3.y);
		var vec2 = dir == 0 ? createVector(v3.x - v4.x, v3.y - v4.y) : createVector(v2.x - v3.x, v2.y - v3.y);

		var rand;

		var rand_factor = 0.2;
		rand = Math.random() * rand_factor + 0.5 - rand_factor / 2;
		var mag1 = vec1.mag();
		var mid1 = start1.add(vec1.mult(1.0 / mag1).mult(rand).mult(mag1));

		rand = Math.random() * rand_factor + 0.5 - rand_factor / 2;
		var mag2 = vec2.mag();
		var mid2 = start2.add(vec2.mult(1.0 / mag2).mult(rand).mult(mag2));

		if (dir == 0){
			new_shapes = append(new_shapes, new p5Shape([v1, mid1, mid2, v4], this.graphic));
			new_shapes = append(new_shapes, new p5Shape([mid1, v2, v3, mid2], this.graphic));
		}
		else{
			new_shapes = append(new_shapes, new p5Shape([v1, v2, mid2, mid1], this.graphic));
			new_shapes = append(new_shapes, new p5Shape([mid1, mid2, v3, v4], this.graphic));
		}

		return new_shapes;
	}

	// this.breadth = function(){
	// 	var dist1 = this.shortestDistanceLines(this.vertices[0], this.vertices[1], this.vertices[3], this.vertices[2]);
	// 	var dist2 = this.shortestDistanceLines(this.vertices[3], this.vertices[0], this.vertices[2], this.vertices[1]);
	// 	var dist3 = this.dist2(this.vertices[0], this.vertices[2]);
	// 	var dist4 = this.dist2(this.vertices[3], this.vertices[1]);
	// 	return min(dist1, dist2, dist3, dist4);

	// 	// var diag1 = createVector(this.vertices[0].x - this.vertices[2].x, this.vertices[0].y - this.vertices[2].y);
	// 	// var diag2 = createVector(this.vertices[1].x - this.vertices[3].x, this.vertices[1].y - this.vertices[3].y);
	// 	// return diag1.mag() > diag2.mag() ? diag1.mag() / diag2.mag() : diag2.mag() / diag1.mag();
	// }

	this.wellProportioned = function(){
		var v1 = createVector(this.vertices[1].x - this.vertices[0].x, this.vertices[1].y - this.vertices[0].y);
		var v2 = createVector(this.vertices[2].x - this.vertices[1].x, this.vertices[2].y - this.vertices[1].y);
		var v3 = createVector(this.vertices[3].x - this.vertices[2].x, this.vertices[3].y - this.vertices[2].y);
		var v4 = createVector(this.vertices[0].x - this.vertices[3].x, this.vertices[0].y - this.vertices[3].y);

		if (v1.mag() / v2.mag() < 0.25 || v1.mag() / v2.mag() > 4){
			// print(v1.mag() / v2.mag())
			return false;
		}

		if (v3.mag() / v4.mag() < 0.25 || v3.mag() / v4.mag() > 4){
			// print(v1.mag() / v2.mag())
			return false;
		}

		return true;
	}

	this.shortestDistanceLines = function(v1, v2, v3, v4){
		var dist1 = this.shortestDistancePointLine(v1, v2, v3);
		var dist2 = this.shortestDistancePointLine(v1, v2, v4);
		var dist3 = this.shortestDistancePointLine(v3, v4, v1);
		var dist4 = this.shortestDistancePointLine(v3, v4, v2);
		return min(dist1, dist2, dist3, dist4);
	}

	this.shortestDistancePointLine = function (v, w, p){
		var l2 = this.dist2(v, w);
		if (l2 == 0) 
			return this.dist2(p, v);

		var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

		t = Math.max(0, Math.min(1, t));

		return this.dist2(p, {x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y)});
	}

	this.dist2 = function(v, w){
		return pow(pow(v.x - w.x, 2) + pow(v.y - w.y, 2), 1/2);
	}

	this.setFill = function(){
		var new_fill = [0, 0, 0];
		tiling.graphic.loadPixels();
		// var r = 1;
		// for (var i = -r; i < r; i++){
		// 	for (var j = -r; j < r; j++){
		// 		var pix_idx = 4 * (floor(this.centroid.x) + i + (floor(this.centroid.y) + j) * img.width);
		// 		new_fill[0] += img.pixels[pix_idx];
		// 		new_fill[1] += img.pixels[pix_idx+1];
		// 		new_fill[2] += img.pixels[pix_idx+2];
		// 	}
		// }

		// new_fill[0] = constrain(new_fill[0] * (1/pow(2*r, 2)), 0 , 255);
		// new_fill[1] = constrain(new_fill[1] * (1/pow(2*r, 2)), 0 , 255);
		// new_fill[2] = constrain(new_fill[2] * (1/pow(2*r, 2)), 0 , 255);

		var normalizer = 0;
		if (floor(this.centroid.x) - 1 > 0){
			var pix_idx = 4 * (floor(this.centroid.x) - 1 + floor(this.centroid.y) * tiling.graphic.width);
			new_fill[0] += tiling.graphic.pixels[pix_idx];
			new_fill[1] += tiling.graphic.pixels[pix_idx+1];
			new_fill[2] += tiling.graphic.pixels[pix_idx+2];
			normalizer++;
		}

		if (floor(this.centroid.y) - 1 > 0){
			var pix_idx = 4 * (floor(this.centroid.x) + (floor(this.centroid.y) - 1) * tiling.graphic.width);
			new_fill[0] += tiling.graphic.pixels[pix_idx];
			new_fill[1] += tiling.graphic.pixels[pix_idx+1];
			new_fill[2] += tiling.graphic.pixels[pix_idx+2];
			normalizer++;
		}

		if (floor(this.centroid.x) + 1 < windowWidth){
			var pix_idx = 4 * (floor(this.centroid.x) + 1 + floor(this.centroid.y) * tiling.graphic.width);
			new_fill[0] += tiling.graphic.pixels[pix_idx];
			new_fill[1] += tiling.graphic.pixels[pix_idx+1];
			new_fill[2] += tiling.graphic.pixels[pix_idx+2];
			normalizer++;
		}

		if (floor(this.centroid.y) + 1 < windowHeight){
			var pix_idx = 4 * (floor(this.centroid.x) + (floor(this.centroid.y) + 1) * tiling.graphic.width);
			new_fill[0] += tiling.graphic.pixels[pix_idx];
			new_fill[1] += tiling.graphic.pixels[pix_idx+1];
			new_fill[2] += tiling.graphic.pixels[pix_idx+2];
			normalizer++;
		}

		new_fill[0] = constrain(new_fill[0] * (1/normalizer), 0, 255);
		new_fill[1] = constrain(new_fill[1] * (1/normalizer), 0, 255);
		new_fill[2] = constrain(new_fill[2] * (1/normalizer), 0, 255);
		
		// print(new_fill)
		var closest_color = this.closestColorTo(color(new_fill));
		// var closest_color = {color: color(new_fill), id: 'Z9'};
		this.id = closest_color.id;
		this.fill = closest_color.color;
	}

	this.closestColorTo = function(c){
		var min_dist = 999999;
		var min_idx = -1;
		var dist;
		for (var i = 0; i < colors.length; i++){
			dist = this.colorDist(colors[i].color, c);
			if (dist < min_dist){
				min_idx = i;
				min_dist = dist;
			}
		}
		return colors[min_idx];
	}

	this.colorDist = function(c1, c2){
		var diff = 0;

		// -------------------------
		// HSB COLOR DISTANCE
		// -------------------------
		// c1._getBrightness();
		// c2._getBrightness();
		// diff += pow(10.0 * (map(c1.hsba[0], 0, 360, 0, 1) - map(c2.hsba[0], 0, 360, 0, 1)), 2);
		// diff += pow(0.25 * (map(c1.hsba[1], 0, 100, 0, 1) - map(c2.hsba[1], 0, 100, 0, 1)), 2);
		// diff += pow(10.0 * (map(c1.hsba[2], 0, 100, 0, 1) - map(c2.hsba[2], 0, 100, 0, 1)), 2);

		// // -------------------------
		// // RGB COLOR DISTANCE
		// // -------------------------
		// diff += 2 * pow(c1.levels[0] - c2.levels[0], 2);
		// diff += 4 * pow(c1.levels[1] - c2.levels[1], 2);
		// diff += 3 * pow(c1.levels[2] - c2.levels[2], 2);

		// // -------------------------
		// // LAB COLOR DISTANCE
		// // -------------------------
		var c1_levels = rgb2lab(c1.levels);
		var c2_levels = rgb2lab(c2.levels);
		diff += pow(c1_levels[0] - c2_levels[0], 2);
		diff += pow(c1_levels[1] - c2_levels[1], 2);
		diff += pow(c1_levels[2] - c2_levels[2], 2);

		// return pow(diff, 1/2);
		return diff;
	}

	function rgb2lab(rgb){
		var r = rgb[0] / 255,
		g = rgb[1] / 255,
		b = rgb[2] / 255,
		x, y, z;

		r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
		g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
		b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

		x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
		y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
		z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

		x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
		y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
		z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

		return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
	}
}







