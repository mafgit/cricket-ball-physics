import { Euler, type Group, Quaternion, Vector3 } from "three";
import {
	outfield,
	hardPitch,
	dryDustyPitch,
	grassyPitch,
	softPitch,
} from "./groundProperties";
import { type RefObject } from "react";

/**
 * **angularVelocity**: to understand it, stick a rod along the ball and think of rotating it around that rod. The rod is the axis that we must set w[axis] high to.
 */
export default class GameConditions {
	// air
	airDensity = 1.225;
	dragCoeff = 0.45;
	magnusCoeff = 0.1;
	dragFactor: number;
	gravityAcc = -9.807;
	magnusFactor: number;
	momentOfInertia: number;
	angularDecayPerSec = 0.985;

	// ball
	ballRadius = 0.0355;
	ballMass = 0.156;
	crossSecArea: number;
	ballRef: RefObject<Group | null>;

	// seam
	seamRef: RefObject<Group | null>;
	worldSeamAxis = new Vector3(1, 0, 0);

	// input related
	speedKph!: number;
	verticalAngle!: number;
	horizAngle!: number;
	ballReleasePos!: number[];
	angularVelocity!: Vector3;
	velocity!: Vector3;

	// anim state
	isStopped = false;
	timeElapsed = 0;
	runupDuration = 2;

	// overlay
	htmlVelX: HTMLElement | undefined;
	htmlVelY: HTMLElement | undefined;
	htmlVelZ: HTMLElement | undefined;
	htmlPace: HTMLElement | undefined;

	// ground
	pitch = hardPitch;
	outfield = outfield;

	constructor(
		ballRef: RefObject<Group | null>,
		seamRef: RefObject<Group | null>,
	) {
		this.ballRef = ballRef;
		this.seamRef = seamRef;

		this.crossSecArea = Math.PI * this.ballRadius ** 2; // for cricket ball approx

		this.momentOfInertia = (2 * this.ballMass * this.ballRadius ** 2) / 5;

		this.dragFactor =
			(this.airDensity * this.dragCoeff * this.crossSecArea) /
			(2 * this.ballMass);

		// magnus
		this.magnusFactor =
			(this.magnusCoeff *
				this.airDensity *
				this.crossSecArea *
				this.ballRadius) /
			(2 * this.ballMass);

		// swing

		// spin

		// ground
		this.outfield = outfield;
		this.pitch = hardPitch;

		this.clearAnim();
	}

	startAnim({
		speedKph,
		verticalAngle,
		horizAngle,
		angularVelocity,
		seamYaw,
		seamRoll,
		ballReleasePos,
	}: {
		speedKph: number;
		verticalAngle: number;
		horizAngle: number;
		angularVelocity: number[];
		seamYaw: number;
		seamRoll: number;
		ballReleasePos: number[];
	}) {
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

		if (this.ballRef.current) {
			this.ballRef.current.position.set(
				ballReleasePos[0],
				ballReleasePos[1],
				ballReleasePos[2],
			);

			const quaternionYaw = new Quaternion().setFromAxisAngle(
				new Vector3(0, 1, 0),
				seamYaw,
			);
			const quaternionRoll = new Quaternion().setFromAxisAngle(
				new Vector3(0, 0, -1),
				seamRoll,
			);

			this.ballRef.current.quaternion.copy(
				new Quaternion().multiplyQuaternions(
					quaternionYaw,
					quaternionRoll,
				),
			);
		}

		this.timeElapsed = 0;
		this.isStopped = false;
		this.ballReleasePos = ballReleasePos;

		this.updateHtmlOverlay(0, 0, 0, 0);
	}

	clearAnim() {
		this.isStopped = true;
		this.timeElapsed = 0;

		this.velocity = new Vector3(0, 0, 0);
		this.angularVelocity = new Vector3(0, 0, 0);

		this.updateHtmlOverlay(0, 0, 0, 0);
	}

	updateHtmlOverlay(vx: number, vy: number, vz: number, pace: number) {
		if (this.htmlVelX && this.htmlVelY && this.htmlVelZ && this.htmlPace) {
			this.htmlVelX.innerText = (vx*3.6).toFixed(2);
			this.htmlVelY.innerText = (vy*3.6).toFixed(2);
			this.htmlVelZ.innerText = (vz*3.6).toFixed(2);
			this.htmlPace.innerText = (pace*3.6).toFixed(2);
		}
	}
}
