import { degToRad } from "three/src/math/MathUtils.js";

export const fastParams = {
	speedKph: 135,
	verticalAngle: degToRad(-1),
	horizAngle: degToRad(5),
	backSpin: 30,
	leftSpin: 20,
	seamYawLeft: degToRad(-20),
	seamRollLeft: degToRad(0),
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
