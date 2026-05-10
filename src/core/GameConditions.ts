import { Euler, type Group, Quaternion, Vector2, Vector3 } from "three";
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
	ballPositionState: "FLIGHT" | "REST" | "SLIDE" | "ROLL" = "REST";

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

	aGrav: Vector3;
	aNormal: Vector3;

	constructor(
		ballRef: RefObject<Group | null>,
		seamRef: RefObject<Group | null>,
	) {
		this.aGrav = new Vector3(0, this.gravityAcc, 0);
		this.aNormal = new Vector3(0, -this.gravityAcc, 0);

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
		this.ballPositionState = "REST";
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
			this.htmlVelX.innerText = vx.toFixed(2);
			this.htmlVelY.innerText = vy.toFixed(2);
			this.htmlVelZ.innerText = vz.toFixed(2);
			this.htmlPace.innerText = pace.toFixed(2);
		}
	}

	handleGroundContact(deltaSec: number) {
		const p = this.ballRef.current!.position;

		if (p.y > this.ballRadius + 0.008) {
			this.ballPositionState = "FLIGHT";
			return;
		}

		const {
			ballRadius: r,
			ballMass: m,
			momentOfInertia: I,
			velocity: v,
			angularVelocity: w,
		} = this;

		p.y = r;

		let cof = 0,
			cor = 0,
			corr = 0;
		const onOutfield = Math.abs(p.z) > 11.28 || Math.abs(p.x) > 1.83;

		if (onOutfield) {
			({ cof, cor, corr } = this.outfield);
		} else {
			({ cof, cor, corr } = this.pitch);
		}

		// ------- BOUNCE -------
		if (this.ballPositionState === "FLIGHT") {
			const vyOld = v.y;

			// give velocity in opposite direction
			v.y *= -cor;

			// contact point friction
			let slipXZ = new Vector2(v.x + w.z * r, v.z - w.x * r);
			let slipMag = slipXZ.length();

			if (slipMag > 1e-5) {
				console.log("Bouncing");

				const normalImpulse = m * (1 + cor) * Math.abs(vyOld);
				let tangentialImpulse = (2 / 7) * m * slipMag;
				tangentialImpulse = Math.min(
					tangentialImpulse,
					cof * normalImpulse,
				);
				const xImpulse =
					(-tangentialImpulse * slipXZ.getComponent(0)) / slipMag;
				const zImpulse =
					(-tangentialImpulse * slipXZ.getComponent(1)) / slipMag;

				v.x += xImpulse / m;
				v.z += zImpulse / m;
				w.x -= (r * zImpulse) / I;
				w.z += (r * xImpulse) / I;
			}

			// check if it will even bounce or not
			if (v.y > 0.1) {
				this.ballPositionState = "FLIGHT";
				return;
			} else {
				// kill any small v.y
				v.y = 0;
				// check new slip to find new state
				let slipXZ = new Vector2(v.x + w.z * r, v.z - w.x * r);
				let slipMag = slipXZ.length();
				if (slipMag > 1) this.ballPositionState = "SLIDE";
				else this.ballPositionState = "ROLL";
			}
		}

		if (this.ballPositionState === "SLIDE") {
			v.y = 0;
			const slipXZ = new Vector2(v.x - w.z * r, v.z + w.x * r);
			const slipMag = slipXZ.length();

			if (slipMag >= 0.3) {
				const tangentialImpulse = Math.min(
					cof * m * this.gravityAcc * deltaSec,
					m * slipMag,
				);

				const dx =
					(-tangentialImpulse * slipXZ.getComponent(0)) / slipMag;
				const dz =
					(-tangentialImpulse * slipXZ.getComponent(1)) / slipMag;

				v.x += dx / m;
				v.z += dz / m;
				w.x -= (r * dz) / I;
				w.z += (r * dx) / I;

				if (v.length() < 0.1) {
					v.set(0, 0, 0);
					w.set(0, 0, 0);
					this.ballPositionState = "REST";
					this.clearAnim();
				}
			} else {
				this.ballPositionState = "ROLL";
				w.x = v.z / r;
				w.z = -v.x / r;
			}
		}

		if (this.ballPositionState === "ROLL") {
			v.y = 0;

			const speed = v.length();
			if (speed < 0.05) {
				w.set(0, 0, 0);
				v.set(0, 0, 0);
				this.clearAnim();
				this.ballPositionState = "REST";
			} else {
				const dv = corr * Math.abs(this.gravityAcc) * deltaSec;

				if (dv >= speed) {
					w.set(0, 0, 0);
					v.set(0, 0, 0);
					this.clearAnim();
					this.ballPositionState = "REST";
				} else {
					v.x *= (speed - dv) / speed;
					v.z *= (speed - dv) / speed;
					w.x = v.z / r;
					w.z = -v.x / r;
					w.y = 0;
				}
			}
		}
	}

	handleSwing() {
		let aSwing = new Vector3(0, 0, 0);
		if (this.ballPositionState != "FLIGHT") return aSwing;

		const v = this.velocity;

		const seamDir = this.worldSeamAxis
			.clone()
			.applyQuaternion(this.ballRef.current!.quaternion)
			.normalize();

		if (v.lengthSq() > 1) {
			const airflowDir = v.clone().negate().normalize();
			const seamOnFlowPlane = seamDir
				.clone()
				.sub(airflowDir.multiplyScalar(seamDir.dot(airflowDir)));
			const seamPlaneMag = seamOnFlowPlane.length();

			if (seamPlaneMag > 1e-5) {
				const swingDir = seamOnFlowPlane.multiplyScalar(
					1 / seamPlaneMag,
				);

				aSwing = swingDir.multiplyScalar(-2);
			}
		}

		return aSwing;
	}

	handleMagnus() {
		let aMagnus = new Vector3(0, 0, 0);
		if (this.ballPositionState != "FLIGHT") return aMagnus;

		const vSqMag = this.velocity.lengthSq();

		if (vSqMag > 1e-5) {
			aMagnus
				.crossVectors(this.angularVelocity, this.velocity)
				.multiplyScalar(this.magnusFactor / Math.sqrt(vSqMag));
		}

		return aMagnus;
	}

	handleDrag() {
		const aDrag = new Vector3(0, 0, 0);
		if (this.ballPositionState != "FLIGHT") return aDrag;

		const vMag = this.velocity.length();

		if (vMag > 1e-8) {
			aDrag.copy(this.velocity).multiplyScalar(-this.dragFactor * vMag);
			// or normalize to v cap, then v cap * vMagSquared
		}

		return aDrag;
	}

	updateRotation(deltaSec: number) {
		const angularAxis = this.angularVelocity.clone();
		const angularMag = angularAxis.length();
		if (angularMag < 1.2) this.angularVelocity.set(0, 0, 0);
		else if (angularMag > 1e-5) {
			angularAxis.normalize(); // get angular axis's directions
			const deltaTheta = new Quaternion().setFromAxisAngle(
				angularAxis,
				angularMag * deltaSec,
			);
			this.ballRef.current!.quaternion.premultiply(deltaTheta);
		}
	}

	getNormalAcc() {
		return this.ballPositionState !== "FLIGHT"
			? this.aNormal
			: new Vector3(0, 0, 0);
	}
}
