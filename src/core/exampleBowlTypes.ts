import { degToRad } from "three/src/math/MathUtils.js";

export const fastParams = {
	speedKph: 120,
	verticalAngle: degToRad(-3),
	horizAngle: degToRad(0),
	angularVelocity: [30, 0, 15],
	// [+backspin, --, +left] (inswing)
	seamYaw: degToRad(-20),
	seamRoll: degToRad(180),
};

export const spinParams = {
	speedKph: 85,
	verticalAngle: (0 * Math.PI) / 180,
	horizAngle: 0.02,
	// angularVelocity: [-45, 0, -70],
	angularVelocity: [-15, 0, -70],
	// seamYaw: Math.PI / 2 + 0.5,
	seamYaw: degToRad(0),
	seamRoll: 0,
};
