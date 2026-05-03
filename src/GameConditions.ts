import { degToRad } from "three/src/math/MathUtils.js";

class GameConditions {
	velKph!: number;
	stopRef!: boolean;
	timeElapsed!: number;
	verticalAngle!: number;
	horizAngle!: number;
	dragFactor!: number;
	gravityAcc!: number;
	velocity!: { x: number; y: number; z: number };
	ballRef?: any;
	initialBallPosition: number[];
	verticalRetainOnBounce!: number;
	coefficientOfFriction!: number;

	constructor(vKph: number, vAngle: number, hAngle: number) {
		this.initialBallPosition = [-0.7, 1.72, 10.06];
		this.reinitializeAnim(vKph, vAngle, hAngle);
	}

	reinitializeAnim(vKph: number, vAngle: number, hAngle: number) {
		// at release
		// wrt bowler
		this.velKph = vKph;
		this.verticalAngle = vAngle;
		this.horizAngle = hAngle;

		const velMps = this.velKph / 3.6;

		const Vx =
			velMps *
			Math.cos(degToRad(this.horizAngle)) *
			Math.cos(degToRad(this.verticalAngle));
		const Vy = velMps * Math.sin(degToRad(this.verticalAngle));
		const Vz =
			velMps *
			Math.cos(degToRad(this.verticalAngle)) *
			Math.sin(degToRad(this.horizAngle));

		this.velocity = {
			x: Vx,
			y: Vy,
			z: Vz,
		};
		console.log(this.velocity);

		this.gravityAcc = -9.807;

		// air
		const airDensity = 1.255; // kg/m^3
		const dragCoeff = 0.45; // for sphere
		const mass = 0.156;
		const crossSecArea = 0.0042; // for cricket ball approx
		this.dragFactor = (0.5 * airDensity * dragCoeff * crossSecArea) / mass;

		if (this.ballRef) {
			this.ballRef.position.x = this.initialBallPosition[0];
			this.ballRef.position.y = this.initialBallPosition[1];
			this.ballRef.position.z = this.initialBallPosition[2];
		}

		this.timeElapsed = 0;
		this.stopRef = false;

		this.verticalRetainOnBounce = 0.75;
		this.coefficientOfFriction = 0.3;
	}
}

export const gameConditions = new GameConditions(100, -3, 271.6);
