import { fastParams, spinParams } from "@/core/exampleBowlTypes";
import GameConditions from "@/core/GameConditions";
import { ballReleasePos } from "@/core/positions";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Vector2, Vector3, type Group } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

export default function Ball() {
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Group>(null);
	const seamRef = useRef<Group>(null);
	const game = useRef(new GameConditions(ballRef, seamRef));

	const restartAnimListener = (e: KeyboardEvent) => {
		if (e.key.toLowerCase() === "r") {
			game.current.startAnim({
				...fastParams,
				ballReleasePos,
			});
		}
	};

	useEffect(() => {
		game.current.htmlVelX = document.querySelector("#velocity #x")!;
		game.current.htmlVelY = document.querySelector("#velocity #y")!;
		game.current.htmlVelZ = document.querySelector("#velocity #z")!;
		game.current.htmlPace = document.querySelector("#velocity #p")!;

		document.addEventListener("keyup", restartAnimListener);
		return () => document.removeEventListener("keyup", restartAnimListener);
	}, []);

	useFrame((state, deltaSec) => {
		if (!ballRef.current || !seamRef.current) return;

		// state.camera.position.set(
		// 	ballRef.current.position.x,
		// 	ballRef.current.position.y + 1,
		// 	ballRef.current.position.z + 1.7,
		// );
		// state.camera.lookAt(ballRef.current.position);

		if (game.current.isStopped) return;

		// 2 sec delay when anim starts
		if (game.current.timeElapsed < game.current.runupDuration) {
			game.current.timeElapsed += deltaSec;
			return;
		}

		// const seamAngle = currentSeamRotation.angleTo(
		// 	game.current.worldSeamAxis,
		// );
		// console.log((seamAngle * 180) / Math.PI);
		// drag force applies against all velocity components only during flight
		// gravity affects only Vy at all times
		// CoR applies only to Vy, only on bounce
		// CoF applies to Vx and Vz, only on bounce

		const p = ballRef.current.position;
		const v = game.current.velocity;
		const w = game.current.angularVelocity;

		// -------- ccelerations --------
		const a = new Vector3(0, 0, 0);
		// on each frame... so no accumulation of accelerations

		// gravity
		const aGrav = new Vector3(0, game.current.gravityAcc, 0);

		// drag effect (air resistance)
		let aDrag = new Vector3(0, 0, 0);
		const vMagnitude = v.length();
		if (vMagnitude > 1e-5) {
			aDrag.copy(v).multiplyScalar(-game.current.dragFactor * vMagnitude);
		}

		// magnus effect (swing in air DUE TO SPIN/ROTATION, perpendicular to angular velocity and velocity, like free kick swing)
		let aMagnus = new Vector3(0, 0, 0);
		if (vMagnitude > 1e-5) {
			// aMagnus
			// 	.crossVectors(w, v)
			// 	.multiplyScalar(game.current.magnusFactor / vMagnitude);
		}

		// swing
		const seamDir = game.current.worldSeamAxis
			.clone()
			.applyQuaternion(ballRef.current.quaternion)
			.normalize();

		let aSwing = new Vector3(0, 0, 0);

		if (vMagnitude > 0.05) {
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
		// console.log(
		// 	(Math.atan2(seamDir.z, seamDir.x) * 180) / Math.PI,
		// 	((seamDir.angleTo(new Vector3(0, 1, 0)) - Math.PI / 2) * 180) /
		// 		Math.PI,
		// );

		// ------ summing accelerations ------
		a.add(aGrav).add(aDrag).add(aMagnus).add(aSwing);

		// -------- updating velocities --------
		v.addScaledVector(a, deltaSec);

		// -------- updating positions --------
		p.addScaledVector(v, deltaSec);

		// -------- updating rotations --------
		const angularAxis = w.clone();
		const angularMag = angularAxis.length();

		if (angularMag > 1e-5) {
			angularAxis.normalize(); // get angular axis's directions
			const deltaTheta = new Quaternion().setFromAxisAngle(
				angularAxis,
				angularMag * deltaSec,
			);
			ballRef.current.quaternion.premultiply(deltaTheta);
		}

		// -------- on contact with ground --------
		const isTouchingGround = p.y <= game.current.ballRadius + 0.008;

		const { ballRadius: r, ballMass: m, momentOfInertia: I } = game.current;

		if (isTouchingGround) {
			let cof = 0,
				cor = 0,
				corr = 0;
			const onOutfield = Math.abs(p.z) > 11.28 || Math.abs(p.x) > 1.83;

			if (onOutfield) {
				({ cof, cor, corr } = game.current.outfield);
			} else {
				({ cof, cor, corr } = game.current.pitch);
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
								cof * Math.abs(game.current.gravityAcc);
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
								corr * Math.abs(game.current.gravityAcc);
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
			w.multiplyScalar(
				Math.pow(game.current.angularDecayPerSec, deltaSec),
			);
		}

		// ----- overlay -----
		const vMagUpdated = v.length();
		game.current.updateHtmlOverlay(v.x, v.y, v.z, vMagUpdated);

		// stop anim
		if (
			vMagUpdated < 0.02
			// || ballRef.current.position.z <= -50
		) {
			game.current.clearAnim();
			console.log(ballRef.current.position.z);
		}
	});

	return (
		<group
			position={[0, game.current.ballRadius, -5]}
			ref={ballRef}
			castShadow
			receiveShadow
			scale={[10, 10, 10]}
		>
			{/* <axesHelper args={[10]} /> */}
			<group castShadow receiveShadow>
				<mesh rotation={[0, 0, -Math.PI / 2]}>
					<sphereGeometry
						args={[
							game.current.ballRadius,
							32,
							16,
							0,
							Math.PI * 2,
							0,
							Math.PI / 2,
						]}
					/>
					<meshStandardMaterial
						color="#C41E3A"
						metalness={0}
						roughness={0.15}
					/>
				</mesh>

				<mesh rotation={[0, 0, +Math.PI / 2]}>
					<sphereGeometry
						args={[
							game.current.ballRadius,
							32,
							16,
							0,
							Math.PI * 2,
							0,
							Math.PI / 2,
						]}
					/>
					<meshStandardMaterial
						color="black"
						metalness={0}
						roughness={0.7}
					/>
				</mesh>
			</group>

			<group ref={seamRef}>
				{/* <axesHelper args={[5]} /> */}
				{seamOffsets.map((offset, i) => {
					const seamRadius =
						Math.sqrt(game.current.ballRadius ** 2 - offset ** 2) +
						0;

					return (
						<mesh
							key={i}
							position={[offset, 0, 0]}
							rotation={[0, Math.PI / 2, 0]}
						>
							<torusGeometry
								args={[seamRadius, seamThickness, 30, 50]}
							/>
							<meshStandardMaterial
								color="#ffffff"
								roughness={0.9}
							/>
						</mesh>
					);
				})}
			</group>
		</group>
	);
}
