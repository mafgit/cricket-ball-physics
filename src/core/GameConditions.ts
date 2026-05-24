import {
	type ArrowHelper,
	type Group,
	Quaternion,
	Vector2,
	Vector3,
} from "three";
import {
	outfield,
	hardPitch,
	dryDustyPitch,
	grassyPitch,
	softPitch,
} from "./groundProperties";
import { type RefObject } from "react";
import { clamp, radToDeg, smoothstep } from "three/src/math/MathUtils.js";

/**
 * **angularVelocity**: to understand it, stick a rod along the ball and think of rotating it around that rod. The rod is the axis that we must set w[axis] high to.
 *
 * **seamYaw & seamRoll**: the shiny side is always to the right initially, use these to set the desired seam/ball direction.
 */
export default class GameConditions {
	// air
	viscosity = 1.8e-5;
	gravityAcc = -9.807;
	momentOfInertia: number;
	angularDecayPerSec = 0.985;

	maxCoeffLift = 0.55;

	minCoeffDrag = 0.2;
	maxCoeffDrag = 0.6;

	minAirDensity = 1.15;
	maxAirDensity = 1.25;

	// ball
	ballRadius = 0.0355;
	ballMass = 0.156;
	crossSecArea: number;
	ballRef: RefObject<Group | null>;
	ballPositionState: "FLIGHT" | "REST" | "SLIDE" | "ROLL" = "REST";

	// seam
	seamRef: RefObject<Group | null>;
	seamProminence = 1; // 0-1

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

	getReynoldsNumber(
		airDensity: number,
		speed: number,
		diameter: number,
		viscosity: number,
	) {
		return (airDensity * speed * diameter) / viscosity;
	}

	/**
	 * 0 - 1 (Peaks at around 20 degrees)
	 */
	getSeamAngleEffectiveness(vDir: Vector3) {
		const localSeamRight = new Vector3(1, 0, 0);
		const worldSeamPole = localSeamRight
			.applyQuaternion(this.ballRef.current!.quaternion)
			.normalize();

		const localSeamUp = new Vector3(0, 1, 0);
		// cross product gives a vector thats perpendicular to both vectors
		const idealPole = localSeamUp.clone().cross(vDir).normalize();

		const dotProduct = worldSeamPole.clone().dot(idealPole);
		const seamAngle = Math.acos(Math.abs(dotProduct));

		const seamAngleDeg = radToDeg(seamAngle);
		// console.log(seamAngleDeg);
		const eff = Math.exp(-Math.pow((seamAngleDeg - 21) / 6.5, 2));
		// console.log(eff);

		return eff;
	}

	getSwingDirection(vDir: Vector3) {
		// todo: its very simple, just goes towards rough side
		const localRoughSide = new Vector3(-1, 0, 0);

		const worldRoughSide = localRoughSide
			.applyQuaternion(this.ballRef.current!.quaternion)
			.normalize();

		// two cross products, projected = v x rough then projected x v
		return vDir.clone().cross(worldRoughSide).cross(vDir);
	}

	getCoeffSwing(vDir: Vector3) {
		// todo
		return this.getSeamAngleEffectiveness(vDir) * this.seamProminence;
	}

	handleSwing(arrowHelperRef: RefObject<ArrowHelper | null>) {
		let aSwing = new Vector3(0, 0, 0);
		if (this.ballPositionState != "FLIGHT") return aSwing;
		const vMag = this.velocity.length();
		if (vMag < 13) return aSwing; // vMag too small for swing, and avoid division by zero

		// once calculated here to pass elsewhere
		const vDir = this.velocity.clone().normalize();

		//
		// const coeffSwing = this.getCoeffSwing(vDir);
		const coeffSwing = 0.5;
		const factor =
			(coeffSwing *
				this.getAirDensity() *
				this.crossSecArea *
				vMag *
				vMag) /
			(2 * this.ballMass); // todo: increase mass if ball gets wet or muddy

		//
		const swingDir = this.getSwingDirection(vDir);
		arrowHelperRef.current?.setDirection(swingDir);
		aSwing = swingDir.clone().multiplyScalar(factor);
		return aSwing;
	}

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

		// swing

		// spin

		// ground
		this.outfield = outfield;
		this.pitch = hardPitch;

		this.clearAnim();
	}

	startAnim({
		speedKph,
		verticalAngle = 0,
		horizAngle = 0,
		backSpin = 0,
		leftSpin = 0,
		seamYawLeft = 0,
		seamRollLeft = 0,
		ballReleasePos,
	}: {
		speedKph: number;
		verticalAngle?: number;
		horizAngle?: number;
		backSpin?: number;
		leftSpin?: number;
		seamYawLeft?: number;
		seamRollLeft?: number;
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

		this.angularVelocity = new Vector3(backSpin, 0, leftSpin);

		if (this.ballRef.current) {
			this.ballRef.current.position.set(
				ballReleasePos[0],
				ballReleasePos[1],
				ballReleasePos[2],
			);

			const quaternionYaw = new Quaternion().setFromAxisAngle(
				new Vector3(0, 1, 0),
				seamYawLeft,
			);
			const quaternionRoll = new Quaternion().setFromAxisAngle(
				new Vector3(0, 0, 1),
				seamRollLeft,
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

	handleSeamMovement(vyOld: number) {
		if (Math.abs(vyOld) < 2.7) return;
		const worldSeamAxis = new Vector3(1, 0, 0).applyQuaternion(
			this.ballRef.current!.quaternion,
		);
		const seamProjectedOnGround = new Vector3(
			worldSeamAxis.x,
			0,
			worldSeamAxis.z,
		);

		const uprightness = 1 - Math.abs(worldSeamAxis.y);
		if (uprightness < 0.92) return; // leather part
		if (uprightness > 0.98) return; // too upright
		// otherwise leather part hitting
		seamProjectedOnGround.normalize();

		const vProjectedOnGround = this.velocity.clone().setY(0);
		if (vProjectedOnGround.lengthSq() < 1e-4) return;
		vProjectedOnGround.normalize();

		// seam on ground alignment with velocity on ground
		let seamYawAlignment = vProjectedOnGround.dot(seamProjectedOnGround);
		const yaw = 1 - Math.abs(seamYawAlignment); // 0: seam straight in direction of velocity, 1: perpendicular
		const grip = Math.pow(yaw, 1.8); // factor of misalignment
		seamYawAlignment = clamp(seamYawAlignment, -1, 1); // for acos safeety
		// const seamYawDeg = radToDeg(Math.acos(seamYawAlignment));
		// const idealYawDeg = 90;
		// const spread = 18;
		// let yawEffectiveness = Math.exp(
		// 	-((seamYawDeg - idealYawDeg) ** 2) / (2 * spread ** 2),
		// );
		// yawEffectiveness = clamp(yawEffectiveness, 0, 1);

		const nipAxis = new Vector3(0, 1, 0).cross(vProjectedOnGround);
		// crossed with ground normal
		if (nipAxis.lengthSq() < 1e-8) return;
		nipAxis.normalize();

		const nipFactor =
			this.seamProminence * grip * uprightness * (Math.abs(vyOld) / 3);

		console.log("SEAM HIT: upr, yaw, factor", uprightness, grip, nipFactor);
		this.velocity.x += nipAxis.x * nipFactor;
		this.velocity.z += nipAxis.z * nipFactor;
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

			// ----------- seam movement -----------
			this.handleSeamMovement(vyOld);

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

	getAirDensity() {
		// 1.15 to 1.25 kg/m3
		return 1.21;
	}

	getCoeffLift(w: number, r: number, speed: number) {
		const k = 0.1; // todo: check. high giving low bounce
		if (speed < 1e-5) return 0;
		const spin = (w * r) / speed;
		return clamp(k * spin, 0, this.maxCoeffLift);
	}

	handleMagnus() {
		let aMagnus = new Vector3(0, 0, 0);
		if (
			this.ballPositionState != "FLIGHT"
			// || this.ballRef.current!.position.y - this.ballRadius <= 0.2
		)
			return aMagnus;

		const v = this.velocity.length();
		if (v < 1e-5) return aMagnus;

		const coeffLift = this.getCoeffLift(
			this.angularVelocity.length(),
			this.ballRadius,
			v,
		);

		// console.log(coeffLift);

		const magnusFactor =
			(coeffLift * this.getAirDensity() * this.crossSecArea) /
			(2 * this.ballMass);

		aMagnus
			.crossVectors(this.angularVelocity, this.velocity)
			.multiplyScalar(magnusFactor);

		return aMagnus;
	}

	getCoeffDrag(Re: number) {
		const step = smoothstep(Re, 1e5, 3e5); // 0.0 to 1.0
		const coeffDrag = 0.55 - step * 0.22; // to put in this range
		return coeffDrag;
	}

	handleDrag() {
		const aDrag = new Vector3(0, 0, 0);
		if (this.ballPositionState != "FLIGHT") return aDrag;

		const vMag = this.velocity.length();

		const p = this.getAirDensity();
		const Re = this.getReynoldsNumber(
			p,
			vMag,
			this.ballRadius * 2,
			this.viscosity,
		);

		const dragFactor =
			(this.getCoeffDrag(Re) * p * this.crossSecArea) /
			(2 * this.ballMass);

		if (vMag > 1e-8) {
			aDrag.copy(this.velocity).multiplyScalar(-dragFactor * vMag);
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
