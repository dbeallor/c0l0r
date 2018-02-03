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
				this.graphic.fill(this.fill.levels);
				this.graphic.stroke(this.fill.levels);
			}
			else {
				this.graphic.fill(255);
				this.graphic.stroke(180);
				this.graphic.strokeWeight(0.5);
			}
			// this.graphic.noStroke();
			this.graphic.beginShape();
			for (var i = 0; i < this.vertices.length; i++){
				this.graphic.vertex(this.vertices[i].x, this.vertices[i].y);
			}
			this.graphic.endShape(CLOSE);
		
			if (mode == 0){
				this.graphic.fill(180);
				this.graphic.textSize(18);
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

		var v1 = this.vertices[0];
		var v2 = this.vertices[1];
		var v3 = this.vertices[2];
		var v4 = this.vertices[3];

		var start1 = dir == 0 ? createVector(v1.x, v1.y) : createVector(v4.x, v4.y);
		var vec1 = dir == 0 ? createVector(v2.x - v1.x, v2.y - v1.y) : createVector(v1.x - v4.x, v1.y - v4.y);

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

	this.wellProportioned = function(){
		var v1 = createVector(this.vertices[1].x - this.vertices[0].x, this.vertices[1].y - this.vertices[0].y);
		var v2 = createVector(this.vertices[2].x - this.vertices[1].x, this.vertices[2].y - this.vertices[1].y);
		var v3 = createVector(this.vertices[3].x - this.vertices[2].x, this.vertices[3].y - this.vertices[2].y);
		var v4 = createVector(this.vertices[0].x - this.vertices[3].x, this.vertices[0].y - this.vertices[3].y);

		if (v1.mag() / v2.mag() < 0.33 || v1.mag() / v2.mag() > 3){
			// print(v1.mag() / v2.mag())
			return false;
		}

		if (v3.mag() / v4.mag() < 0.33 || v3.mag() / v4.mag() > 3){
			// print(v1.mag() / v2.mag())
			return false;
		}

		if (v3.mag() / v2.mag() < 0.33 || v3.mag() / v2.mag() > 3){
			// print(v1.mag() / v2.mag())
			return false;
		}

		if (v1.mag() / v4.mag() < 0.33 || v1.mag() / v4.mag() > 3){
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

	this.setFill = function(c){
		this.id = c.id;
		this.fill = c.color;
	}

	
}







