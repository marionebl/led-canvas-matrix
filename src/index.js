var getBounds = require('./getBounds');
var populate = require('./populate');
var sortLeds = require('./sortLeds');

class LedCanvasMatrix {
	constructor(x = 0, y = 0, width = 1, height = 1, leds = []){
		if (Array.isArray(leds)) {
			this.leds = leds;
		} else {
			this.leds = populate(width, height, leds);
		}

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	get(x, y) {
		x = (x >= this.width) ? 0 : x;
		y = (y >= this.height) ? 0 : y;
		let led = this.leds[x + y * this.width];
		let leds = led ? [led] : undefined;
		return led ? new LedCanvasMatrix(x, y, 1, 1, leds) : null;
	}

	index(idx) {
		var led = this.leds[idx];
		return new LedCanvasMatrix(led.x, led.y, 1, 1, [led]);
	}

	prop(key, value) {
		let leds = this.leds.filter(function(led){
			return led[key] == value;
		});

		let bounds = getBounds(leds);
		return new LedCanvasMatrix(bounds.x, bounds.y, bounds.width, bounds.height, leds);
	}

	row(y) {
		return new LedCanvasMatrix(this.x, y, this.width, 1, this.leds.filter(function(led){
			return led.y == y;
		}));
	}

	column(x) {
		return new LedCanvasMatrix(x, this.y, 1, this.height, this.leds.filter(function(led){
			return led.x == x;
		}));
	}

	rect(x, y, width = 1, height = 1) {
		let xmax = x + width;
		let ymax = y + height;

		return new LedCanvasMatrix(x, y, width, height, this.leds.filter(function(led){
			return led.x >= x && led.x < xmax && led.y >= y && led.y < ymax;
		}));
	}

	set(key, value) {
		if (typeof key !== 'string') {
			this.leds.forEach(function(led){
				led.enabled = typeof key === 'undefined' ? true : key;
			});
		} else {
			this.leds.forEach(function(led){
				led.set(key, value);
			});
		}
		return this;
	}

	toggle() {
		this.leds.forEach(function(led){
			led.enabled = ! led.enabled;
		});

		return this;
	}

	render(...args) {
		this.leds.forEach(function(led){
			led.render(...args);
		});

		return this;
	}

	add(matrix) {
		let moved = matrix.leds.map((led) => {
			led.x += this.width;
			return led;
		});

		let leds = this.leds.concat(moved).sort(sortLeds);

		let bounds = getBounds(leds);
		return new LedCanvasMatrix(bounds.x, bounds.y, bounds.width, bounds.height, leds);
	}

	join(matrix, x = 0, y = 0) {
		let leds = matrix.leds.map((led) => {
			let xOffset = (matrix.x + led.x + x) % this.width;
			let yOffset = (matrix.y + led.y + y) % this.height;
			let submatrix = this.get(xOffset, yOffset);
			submatrix.set(led.enabled);
			return submatrix.leds[0];
		});

		return new LedCanvasMatrix(matrix.x + x, matrix.y + y, matrix.width, matrix.height, leds);
	}
}

module.exports = LedCanvasMatrix;
