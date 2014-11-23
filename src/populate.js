function populate(x, y, LedFactory) {
	let length = x * y;
	let leds = [];

	for (let i = 0; i < length; i++) {
		let yc = Math.floor(i / x);
		let xc = i - (x * yc);
		leds.push(LedFactory(xc, yc));
	}

	return leds;
}

module.exports = populate;
