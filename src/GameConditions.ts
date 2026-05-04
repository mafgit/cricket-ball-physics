import { Euler, type Group, Quaternion, Vector3 } from "three";

/**
 * **angularVelocity**: to understand it, stick a rod along the ball and think of rotating it around that rod. The rod is the axis that we must set w[axis] high to.
 */
class GameConditions {
	speedKph!: number;
	isStopped!: boolean;
	timeElapsed!: number;
	verticalAngle!: number;
	horizAngle!: number;
	dragFactor!: number;
	gravityAcc!: number;
	velocity!: { x: number; y: number; z: number };
	ballRef?: Group;
	coefficientOfRestitution!: number;
	coefficientOfFriction!: number;
	angularVelocity!: { x: number; y: number; z: number };
	magnusStrength!: number;
	angularDecay!: number;
	runupDuration!: number;
	htmlVelX: HTMLElement | undefined;
	htmlVelY: HTMLElement | undefined;
	htmlVelZ: HTMLElement | undefined;
	htmlPace: HTMLElement | undefined;
	initialBallPosition!: number[];
	orientationTheta!: Quaternion;

	constructor() {
		this.clearAnim();
	}

	startAnim({
		speedKph,
		verticalAngle,
		horizAngle,
		angularVelocity,
		seamAngle,
		initialBallPosition,
	}: {
		speedKph: number;
		verticalAngle: number;
		horizAngle: number;
		angularVelocity: number[];
		seamAngle: number[];
		initialBallPosition: number[];
	}) {
		// at release
		// wrt bowler
		this.speedKph = speedKph;
		this.verticalAngle = verticalAngle;
		this.horizAngle = horizAngle;
		const speedMps = this.speedKph / 3.6;

		const Vx =
			speedMps * Math.cos(this.horizAngle) * Math.cos(this.verticalAngle);

		const Vy = speedMps * Math.sin(this.verticalAngle);
		const Vz =
			speedMps * Math.cos(this.verticalAngle) * Math.sin(this.horizAngle);

		this.velocity = {
			x: Vx,
			y: Vy,
			z: Vz,
		};

		this.angularVelocity = {
			x: angularVelocity[0],
			y: angularVelocity[1],
			z: angularVelocity[2],
		};

		// air
		const airDensity = 1.255; // kg/m^3
		const dragCoeff = 0.45; // for sphere
		const mass = 0.156;
		const crossSecArea = 0.0042; // for cricket ball approx
		this.dragFactor = (0.5 * airDensity * dragCoeff * crossSecArea) / mass;

		const magnusCoefficient = 0.2;
		this.magnusStrength =
			(0.5 * magnusCoefficient * airDensity * crossSecArea) / mass;

		if (this.ballRef) {
			this.ballRef.position.set(
				initialBallPosition[0],
				initialBallPosition[1],
				initialBallPosition[2],
			);

			const euler = new Euler(
				seamAngle[0],
				seamAngle[1],
				seamAngle[2],
				"XYZ",
			);

			this.orientationTheta = new Quaternion().setFromEuler(euler);
			this.ballRef.rotation.setFromQuaternion(this.orientationTheta)
		}

		this.timeElapsed = 0;
		this.isStopped = false;
		this.runupDuration = 2; // seconds
		this.initialBallPosition = initialBallPosition;

		this.coefficientOfRestitution = 0.6; // more = more bounce preserved
		this.coefficientOfFriction = 0.1; // less = more energy velocity preserved

		this.updateHtmlOverlay(0, 0, 0, 0);
	}

	clearAnim() {
		this.isStopped = true;
		this.timeElapsed = 0;

		this.gravityAcc = -9.807;

		this.velocity = { x: 0, y: 0, z: 0 };
		this.angularVelocity = { x: 0, y: 0, z: 0 };

		this.angularDecay = 0.985;

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
