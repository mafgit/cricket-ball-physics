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
	ballPositionState: "HAND" | "FLIGHT" | "BOUNCE" | "SLIDE" | "ROLL" = "HAND";

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
		this.ballPositionState = "HAND";
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
			this.htmlVelX.innerText = (vx * 3.6).toFixed(2);
			this.htmlVelY.innerText = (vy * 3.6).toFixed(2);
			this.htmlVelZ.innerText = (vz * 3.6).toFixed(2);
			this.htmlPace.innerText = (pace * 3.6).toFixed(2);
		}
	}

	handleGroundContact(deltaSec: number) {
		const p = this.ballRef.current!.position;
		const v = this.velocity;
		const w = this.angularVelocity;

		const isTouchingGround = p.y <= this.ballRadius + 0.008;

		const { ballRadius: r, ballMass: m, momentOfInertia: I } = this;

		if (isTouchingGround) {
			let cof = 0,
				cor = 0,
				corr = 0;
			const onOutfield = Math.abs(p.z) > 11.28 || Math.abs(p.x) > 1.83;

			if (onOutfield) {
				({ cof, cor, corr } = this.outfield);
			} else {
				({ cof, cor, corr } = this.pitch);
			}

			p.y = r; // fix if below pitch

			let slipXZ = new Vector2(v.x - w.z * r, v.z + w.x * r);
			let slipMag = slipXZ.length();

			if (v.y < -0.01) {
				console.log("Bouncing");

				const verticalImpulse = m * (1 + cor) * Math.abs(v.y);
				v.y = -v.y * cor;
				if (slipMag > 1e-5) {
					let tangentialImpulse = (2 / 7) * m * slipMag;
					tangentialImpulse = Math.min(
						tangentialImpulse,
						cof * verticalImpulse,
					);
					const horizontalImpulse =
						(-tangentialImpulse * slipXZ.getComponent(0)) / slipMag;
					const zImpulse =
						(-tangentialImpulse * slipXZ.getComponent(1)) / slipMag;

					v.x += horizontalImpulse / m;
					v.z += zImpulse / m;
					w.x -= (r * zImpulse) / I;
					w.z += (r * horizontalImpulse) / I;
				}
			} else {
				if (v.y > -0.15 && v.y < 0.3) {
					v.y = 0;
					slipXZ = new Vector2(v.x - w.z * r, v.z + w.x * r);
					slipMag = slipXZ.length();

					if (slipMag > 0.18) {
						console.log("Sliding");

						if (slipMag > 1e-5) {
							const slipNormalized = slipXZ.clone().normalize();
							const frictionDecel =
								cof * Math.abs(this.gravityAcc);
							const speedDecrease = frictionDecel * deltaSec;

							if (slipMag > speedDecrease) {
								const ax =
									-frictionDecel *
									slipNormalized.getComponent(0);
								const az =
									-frictionDecel *
									slipNormalized.getComponent(1);

								v.x += ax * deltaSec;
								v.z += az * deltaSec;

								const torqueX = -r * (m * az);
								const torqueZ = r * (m * ax);
								w.x += (torqueX / I) * deltaSec;
								w.z += (torqueZ / I) * deltaSec;
							} else {
								v.set(0, 0, 0);
								w.set(0, 0, 0);
							}
						} else {
							v.set(0, 0, 0);
							w.set(0, 0, 0);
						}
					} else {
						console.log("Rolling");
						// rolling
						const vMag = v.length();
						// rolling acceleration
						if (vMag > 0.08) {
							const vNormalized = v.clone().normalize();

							// const rollingAcc = vNormalized
							// 	.clone()
							// 	.multiplyScalar(corr * gameConditions.current.gravityAcc);
							const rollingDecel =
								corr * Math.abs(this.gravityAcc);
							const speedDecrease = rollingDecel * deltaSec;

							// to not decrease so much that it flips
							if (vMag > speedDecrease) {
								v.x -= vNormalized.x * speedDecrease;
								v.z -= vNormalized.z * speedDecrease;
							} else {
								// stop completely
								v.set(0, 0, 0);
								w.set(0, 0, 0);
							}
						} else {
							// stop completely
							v.set(0, 0, 0);
							w.set(0, 0, 0);
						}
					}
				}
			}
		}

		if (!isTouchingGround) {
			w.multiplyScalar(Math.pow(this.angularDecayPerSec, deltaSec));
		}
	}

	handleSwing() {
		let aSwing = new Vector3(0, 0, 0);
		if (this.ballRef.current!.position.y <= this.ballRadius) return aSwing;

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

				aSwing = swingDir.multiplyScalar(-7);
			}
		}

		return aSwing;
	}

	handleMagnus() {
		let aMagnus = new Vector3(0, 0, 0);
		if (this.ballRef.current!.position.y <= this.ballRadius) return aMagnus;

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
		if (this.ballRef.current!.position.y <= this.ballRadius) return aDrag;

		const vMagnitude = this.velocity.length();

		if (vMagnitude > 1e-5) {
			aDrag
				.copy(this.velocity)
				.multiplyScalar(-this.dragFactor * vMagnitude);
		}

		return aDrag;
	}

	updateRotation(deltaSec: number) {
		const angularAxis = this.angularVelocity.clone();
		const angularMag = angularAxis.length();

		if (angularMag > 1e-5) {
			angularAxis.normalize(); // get angular axis's directions
			const deltaTheta = new Quaternion().setFromAxisAngle(
				angularAxis,
				angularMag * deltaSec,
			);
			this.ballRef.current!.quaternion.premultiply(deltaTheta);
		}
	}
}
