// =======================================================================================================
// ==AUXILLARY MATH FUNCTIONS
// =======================================================================================================
function angleBetween(v1, v2){
	return polarAngle(v2.x, v2.y) - polarAngle(v1.x, v1.y);
}

function dot(v1, v2){
	return v1.x*v2.x + v1.y*v2.y;
}

// Return the slope of the line  (x1, y1) --> (x2, y2)
function slope(x1, y1, x2, y2){
	if (x2 - x1 == 0) 
		return 1000000;
	else
		return (y2 - y1) / (x2 - x1);
}

// Determine the y intercept of the line y = mx + b given m, x and y
function intercept(m, x, y){
	return y - m*x;
}

// Return the midpoint of the line (x1, y1) --> (x2, y2)
function midpoint(x1, y1, x2, y2){
	return [(x1 + x2) / 2, (y1 + y2) / 2];
}

function polarAngle(x, y){
	if (x > 0 && y > 0)
		return Math.atan(abs(y) / abs(x));
	else if (x < 0 && y > 0)
		return Math.PI - Math.atan(abs(y) / abs(x));
	else if (x > 0 && y < 0)
		return 2*Math.PI - Math.atan(abs(y) / abs(x));
	else if (x < 0 && y < 0)
		return Math.PI + Math.atan(abs(y) / abs(x));
	else if (x == 0 && y > 0)
		return Math.PI / 2;
	else if (x == 0 && y < 0)
		return 3*Math.PI / 2;
	else if (x < 0 && y == 0)
		return Math.PI;
	else
		return 0;
}

// Determine if the point (x, y) is "above" the line (x1, y1) --> (x2, y2)
function aboveLine(x, y, x1, y1, x2, y2){
	if (x2 >= x1){
		var m = slope(x1, y1, x2, y2);
		if (m == 1000000) // check for vertical line
			if (y2 > y1)
				return x > x1;
			else
				return x < x1;
		var b = intercept(m, x1, y1);
		return y < m * x + b;
	}
	else {
		var m = slope(x2, y2, x1, y1);
		if (m == 1000000)
			if (y2 > y1)
				return x > x1;
			else
				return x < x1;
		var b = intercept(m, x1, y1);
		return y > m * x + b;
	}	
}

// Determine if the point (x, y) is "to the left" of the line perpendicular to the line (x1, y1) --> (x2, y2)
// and passing through it's midpoint
function toTheLeft(x, y, x1, y1, x2, y2){
	var vec = createVector(x2 - x1, y2 - y1);
	var perp_vec = createVector(1, -vec.x/vec.y);
	var mid = midpoint(x1, y1, x2, y2);
	if (vec.y == 0){
		if (x2 > x1)
			return x < mid[0]
		else
			return x > mid[0]
	}
	var end = [mid[0] + perp_vec.x, mid[1] + perp_vec.y];

	if (end[1] < mid[1])
		return aboveLine(x, y, mid[0], mid[1], end[0], end[1]);
	else
		return aboveLine(x, y, end[0], end[1], mid[0], mid[1]);
}

function scalePoint(x, y, delta, center){
	x = x - center[0];
	y = y - center[1];

	var r = pow(pow(x, 2) +  pow(y, 2), 0.5);
	var theta = polarAngle(x, y);

	var new_x = delta * r * cos(theta) + center[0];
	var new_y = delta * r * sin(theta) + center[1];

	return [new_x, new_y];
}

function withinBounds(x, y, bounds){
	return (x >= bounds[0] && x <= bounds[1] && y >= bounds[2] && y <= bounds[3]);
	// 			left             right           bottom             top
}