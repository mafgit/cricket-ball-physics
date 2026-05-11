import { degToRad } from "three/src/math/MathUtils.js";

export const fastParams = {
	speedKph: 120,
	verticalAngle: degToRad(-3),
	horizAngle: degToRad(0),
	backSpin: 30,
	leftSpin: 15,
	seamYawLeft: degToRad(-20),
	seamRollRight: degToRad(180),
};

export const spinParams = {
	speedKph: 85,
	verticalAngle: (0 * Math.PI) / 180,
	horizAngle: 0.02,
	backSpin: -50,
	leftSpin: -250,
	seamYawLeft: degToRad(-70),
	seamRollRight: degToRad(10),
};
