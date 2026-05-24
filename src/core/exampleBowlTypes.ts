import { degToRad } from "three/src/math/MathUtils.js";

export const fastParams = {
	//  outswing
		speedKph: 135,
		verticalAngle: degToRad(-6),
		horizAngle: degToRad(2),
		backSpin: 30,
		leftSpin: -15,
		seamYawLeft: degToRad(20),
		seamRollLeft: degToRad(0),

	// speedKph: 135,
	// verticalAngle: degToRad(-4),
	// horizAngle: degToRad(0),
	// backSpin: 30,
	// leftSpin: 0,
	// seamYawLeft: degToRad(0),
	// seamRollLeft: degToRad(0),
};

export const spinParams = {
	speedKph: 85,
	verticalAngle: (0 * Math.PI) / 180,
	horizAngle: 0.02,
	backSpin: -50,
	leftSpin: -250,
	seamYawLeft: degToRad(-70),
	seamRollLeft: degToRad(-10),
};
