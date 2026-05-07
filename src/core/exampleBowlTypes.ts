import { degToRad } from "three/src/math/MathUtils.js";

export const fastParams = {
	speedKph: 142,
	verticalAngle: degToRad(-13),
	horizAngle: degToRad(-2),
	angularVelocity: [30, 0, 0],
	// [+backspin, --, +left] (inswing)
	seamYaw: degToRad(-20),
	seamRoll: degToRad(180),
};

export const spinParams = {
	speedKph: 82,
	verticalAngle: (2 * Math.PI) / 180,
	horizAngle: 0.02,
	// angularVelocity: [-45, 0, -70],
	angularVelocity: [0, 0, -10],
	// seamYaw: Math.PI / 2 + 0.5,
	seamYaw: degToRad(0),
	seamRoll: 0,
};
