export const fastParams = {
	speedKph: 142,
	verticalAngle: -0.3,
	horizAngle: 0.03,
	angularVelocity: [15, 0, 15],
	// [+backspin, --, +left] (inswing)
	seamAngle: [0, -0.4, 0],
};

export const spinParams = {
	speedKph: 82,
	verticalAngle: (2 * Math.PI) / 180,
	horizAngle: 0.02,
	angularVelocity: [-45, 0, -70],
	// angularVelocity: [0, 0, 0],
	seamAngle: [0, Math.PI / 2 + 0.5, 0],
};
