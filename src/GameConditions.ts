import { Euler, type Group, Quaternion, Vector3 } from "three";

const hardPitch = {
	cor: 0.6,
	cof: 0.4,
};

const grassyPitch = {
	cor: 0.51,
	cof: 0.3,
};

const dryDustyPitch = {
	cor: 0.44,
	cof: 0.63,
};

const softPitch = {
	cor: 0.35,
	cof: 0.25,
};

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
	velocity!: Vector3;
	ballRef?: Group;
	coefficientOfRestitution!: number;
	coefficientOfFriction!: number;
	angularVelocity!: Vector3;
	magnusStrength!: number;
	angularDecay!: number;
	runupDuration!: number;
	htmlVelX: HTMLElement | undefined;
	htmlVelY: HTMLElement | undefined;
	htmlVelZ: HTMLElement | undefined;
	htmlPace: HTMLElement | undefined;
	initialBallPosition!: number[];
	orientationTheta!: Quaternion;
	ballMass!: number;
	ballRadius!: number;
	momentOfInertia!: number;

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
		this.ballRadius = 0.036;
		this.ballMass = 0.156;
		this.momentOfInertia = (2 * this.ballMass * this.ballRadius ** 2) / 5;

		// at release
		// wrt bowler
		this.speedKph = speedKph;
		this.verticalAngle = verticalAngle;
		this.horizAngle = horizAngle;
		const speedMps = this.speedKph / 3.6;

		const Vz =
			-speedMps *
			Math.cos(this.verticalAngle) *
			Math.cos(this.horizAngle);
		const Vy = speedMps * Math.sin(this.verticalAngle);
		const Vx =
			speedMps * Math.cos(this.verticalAngle) * Math.sin(this.horizAngle);

		this.velocity = new Vector3(Vx, Vy, Vz);

		this.angularVelocity = new Vector3(
			angularVelocity[0],
			angularVelocity[1],
			angularVelocity[2],
		);

		// air
		const airDensity = 1.255; // kg/m^3
		const dragCoeff = 0.45; // for sphere
		const crossSecArea = 0.0042; // for cricket ball approx
		this.dragFactor =
			(0.5 * airDensity * dragCoeff * crossSecArea) / this.ballMass;

		const magnusCoefficient = 0.2;
		this.magnusStrength =
			(0.5 * magnusCoefficient * airDensity * crossSecArea) /
			this.ballMass;

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
			this.ballRef.rotation.setFromQuaternion(this.orientationTheta);
		}

		this.timeElapsed = 0;
		this.isStopped = false;
		this.runupDuration = 2; // seconds
		this.initialBallPosition = initialBallPosition;

		this.coefficientOfRestitution = hardPitch.cor; // more = more bounce preserved
		this.coefficientOfFriction = hardPitch.cof; // less = more energy velocity preserved

		this.updateHtmlOverlay(0, 0, 0, 0);
	}

	clearAnim() {
		this.ballRadius = 0.036;
		this.ballMass = 0.156;

		this.isStopped = true;
		this.timeElapsed = 0;

		this.gravityAcc = -9.807;

		this.velocity = new Vector3(0, 0, 0);
		this.angularVelocity = new Vector3(0, 0, 0);

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
