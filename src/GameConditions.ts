import { degToRad } from "three/src/math/MathUtils.js";

class GameConditions {
	speedKph!: number;
	isStopped!: boolean;
	timeElapsed!: number;
	verticalAngle!: number;
	horizAngle!: number;
	dragFactor!: number;
	gravityAcc!: number;
	velocity!: { x: number; y: number; z: number };
	ballRef?: any;
	coefficientOfRestitution!: number;
	coefficientOfFriction!: number;
	// acceleration: { x: number; y: number; z: number };

	htmlVelX: HTMLElement | undefined;
	htmlVelY: HTMLElement | undefined;
	htmlVelZ: HTMLElement | undefined;
	htmlPace: HTMLElement | undefined;

	constructor() {
		this.isStopped = true;

		this.velocity = { x: 0, y: 0, z: 0 };
		// this.acceleration = { x: 0, y: 0, z: 0 };
	}

	reinitializeAnim(
		speedKph: number,
		verticalAngle: number,
		horizAngle: number,
		initialBallPosition = [-0.7, 1.72, 10.06 - 1.32],
	) {
		// at release
		// wrt bowler
		this.speedKph = speedKph;
		this.verticalAngle = verticalAngle;
		this.horizAngle = horizAngle;

		const speedMps = this.speedKph / 3.6;

		const Vx =
			speedMps *
			Math.cos(degToRad(this.horizAngle)) *
			Math.cos(degToRad(this.verticalAngle));

		const Vy = speedMps * Math.sin(degToRad(this.verticalAngle));
		const Vz =
			speedMps *
			Math.cos(degToRad(this.verticalAngle)) *
			Math.sin(degToRad(this.horizAngle));

		this.velocity = {
			x: Vx,
			y: Vy,
			z: Vz,
		};
		// console.log(this.velocity);

		this.gravityAcc = -9.807;

		// air
		const airDensity = 1.255; // kg/m^3
		const dragCoeff = 0.45; // for sphere
		const mass = 0.156;
		const crossSecArea = 0.0042; // for cricket ball approx
		this.dragFactor = (0.5 * airDensity * dragCoeff * crossSecArea) / mass;

		if (this.ballRef) {
			this.ballRef.position.x = initialBallPosition[0];
			this.ballRef.position.y = initialBallPosition[1];
			this.ballRef.position.z = initialBallPosition[2];
		}

		this.timeElapsed = 0;
		this.isStopped = false;

		this.coefficientOfRestitution = 0.5; // more = more bounce preserved
		this.coefficientOfFriction = 0.3; // less = more energy velocity preserved

		this.updateHtmlOverlay(0, 0, 0, 0);
	}

	endAnim() {
		this.isStopped = true;
		this.timeElapsed = 0;

		this.velocity = { x: 0, y: 0, z: 0 };
		// this.acceleration = { x: 0, y: this.gravityAcc, z: 0 };

		this.updateHtmlOverlay(0, 0, 0, 0);
	}

	updateHtmlOverlay(vx: number, vy: number, vz: number, pace: number) {
		if (this.htmlVelX && this.htmlVelY && this.htmlVelZ && this.htmlPace) {
			this.htmlVelX.innerText = mpsToKph(vx).toFixed(2);
			this.htmlVelY.innerText = mpsToKph(vy).toFixed(2);
			this.htmlVelZ.innerText = mpsToKph(vz).toFixed(2);
			this.htmlPace.innerText = mpsToKph(pace).toFixed(2);
		}
	}
}

function mpsToKph(v: number) {
	return v * 3.6;
}
export const gameConditions = new GameConditions();
