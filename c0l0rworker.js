self.addEventListener('message', function(e){
	var centroids = e.data.centroids;
	var pixels = e.data.pixels;
	var colors = e.data.colors;
	var width = e.data.width;
	var height = e.data.height;
	var work = [];

	for (var i = e.data.start; i < e.data.stop; i++){
		work.push(closestColorTo(colorSurrounding(centroids[i])));
	}

	function colorSurrounding(centroid){
		var new_fill = [0, 0, 0];
		var normalizer = 0;

		if (Math.floor(centroid[0]) - 1 > 0){
			var pix_idx = 4 * (Math.floor(centroid[0]) - 1 + Math.floor(centroid[1]) * width);
			new_fill[0] += pixels[pix_idx];
			new_fill[1] += pixels[pix_idx+1];
			new_fill[2] += pixels[pix_idx+2];
			normalizer++;
		}

		if (Math.floor(centroid[1]) - 1 > 0){
			var pix_idx = 4 * (Math.floor(centroid[0]) + (Math.floor(centroid[1]) - 1) * width);
			new_fill[0] += pixels[pix_idx];
			new_fill[1] += pixels[pix_idx+1];
			new_fill[2] += pixels[pix_idx+2];
			normalizer++;
		}

		if (Math.floor(centroid[0]) + 1 < width){
			var pix_idx = 4 * (Math.floor(centroid[0]) + 1 + Math.floor(centroid[1]) * width);
			new_fill[0] += pixels[pix_idx];
			new_fill[1] += pixels[pix_idx+1];
			new_fill[2] += pixels[pix_idx+2];
			normalizer++;
		}

		if (Math.floor(centroid[1]) + 1 < height){
			var pix_idx = 4 * (Math.floor(centroid[0]) + (Math.floor(centroid[1]) + 1) * width);
			new_fill[0] += pixels[pix_idx];
			new_fill[1] += pixels[pix_idx+1];
			new_fill[2] += pixels[pix_idx+2];
			normalizer++;
		}

		new_fill[0] = constrain(new_fill[0] * (1/normalizer), 0, 255);
		new_fill[1] = constrain(new_fill[1] * (1/normalizer), 0, 255);
		new_fill[2] = constrain(new_fill[2] * (1/normalizer), 0, 255);

		return new_fill;
	}

	function constrain(n, low, high){
	  return Math.max(Math.min(n, high), low);
	};

	function closestColorTo(c){
		var min_dist = 999999;
		var min_idx = -1;
		var dist;
		for (var i = 0; i < colors.length; i++){
			dist = colorDist(colors[i].color, c);
			if (dist < min_dist){
				min_idx = i;
				min_dist = dist;
			}
		}
		return colors[min_idx];
	}

	function colorDist(c1, c2){
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
		var c2_levels = rgb2lab(c2);
		diff += Math.pow(c1_levels[0] - c2_levels[0], 2);
		diff += Math.pow(c1_levels[1] - c2_levels[1], 2);
		diff += Math.pow(c1_levels[2] - c2_levels[2], 2);

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

	self.postMessage({work: work, chunk: e.data.chunk});
}, false);