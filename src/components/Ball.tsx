import { gameConditions } from "@/GameConditions";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Vector2, Vector3, type Group } from "three";

export default function Ball() {
	// const gameConditions.ballRadius = 0.036;
	const seamHeight = 0;
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Group>(null);

	useEffect(() => {
		if (ballRef.current) gameConditions.ballRef = ballRef.current;
		gameConditions.htmlVelX = document.querySelector("#velocity #x")!;
		gameConditions.htmlVelY = document.querySelector("#velocity #y")!;
		gameConditions.htmlVelZ = document.querySelector("#velocity #z")!;
		gameConditions.htmlPace = document.querySelector("#velocity #p")!;
	}, []);

	useFrame((state, deltaSec) => {
		if (!gameConditions.ballRef) return;

		state.camera.position.set(
			gameConditions.ballRef.position.x,
			gameConditions.ballRef.position.y + 0.5,
			gameConditions.ballRef.position.z + 0.9,
		);
		state.camera.lookAt(gameConditions.ballRef.position);

		if (gameConditions.isStopped) return;

		// 2 sec delay when anim starts
		if (gameConditions.timeElapsed < gameConditions.runupDuration) {
			gameConditions.timeElapsed += deltaSec;
			return;
		}

		// drag force applies against all velocity components only during flight
		// gravity affects only Vy at all times
		// CoR applies only to Vy, only on bounce
		// CoF applies to Vx and Vz, only on bounce

		const p = gameConditions.ballRef.position;
		const v = gameConditions.velocity;
		const w = gameConditions.angularVelocity;

		let normalAcc = 0; // if at ground, gravity cancels out
		// if (p.y <= gameConditions.ballRadius + 0.005 && v.y < 0) {
		// 	normalAcc = -gameConditions.gravityAcc;
		// }

		const a = new Vector3(0, gameConditions.gravityAcc - normalAcc, 0);
		// on each frame, no accumulation of accelerations

		// -------- updating accelerations/forces --------

		// drag effect (air resistance)
		const vMagnitude = v.length();
		if (vMagnitude > 1e-5) {
			const dragAcc = vMagnitude ** 2 * gameConditions.dragFactor;
			a.x -= (v.x / vMagnitude) * dragAcc;
			a.y -= (v.y / vMagnitude) * dragAcc;
			a.z -= (v.z / vMagnitude) * dragAcc;
		}

		// magnus effect (swing in air DUE TO SPIN/ROTATION, perpendicular to angular velocity and velocity, like free kick swing)
		// const crossProd = new Vector3().crossVectors(w, v);
		// a.x += gameConditions.magnusStrength * crossProd.x;
		// a.y += gameConditions.magnusStrength * crossProd.y;
		// a.z += gameConditions.magnusStrength * crossProd.z;

		// angular decay
		// w.x *= Math.pow(gameConditions.angularDecay, deltaSec);
		// w.y *= Math.pow(gameConditions.angularDecay, deltaSec);
		// w.z *= Math.pow(gameConditions.angularDecay, deltaSec);

		// -------- updating velocities --------
		v.x += a.x * deltaSec;
		v.y += a.y * deltaSec;
		v.z += a.z * deltaSec;

		// -------- updating positions --------
		p.x += v.x * deltaSec;
		p.y += v.y * deltaSec;
		p.z += v.z * deltaSec;

		// -------- updating rotations --------
		const deltaTheta = new Quaternion();
		const angularAxis = new Vector3().copy(w);
		const angularMag = angularAxis.length();

		if (angularMag > 1e-5) {
			angularAxis.normalize(); // get angular axis's directions
			deltaTheta.setFromAxisAngle(angularAxis, angularMag * deltaSec);
			gameConditions.orientationTheta.multiplyQuaternions(
				deltaTheta,
				gameConditions.orientationTheta,
			);
			gameConditions.orientationTheta.normalize();
			gameConditions.ballRef.quaternion.copy(
				gameConditions.orientationTheta,
			);
		}

		// -------- on contact with ground --------
		const isTouchingGround = p.y <= gameConditions.ballRadius + 0.005;

		const {
			ballRadius: r,
			ballMass: m,
			momentOfInertia: I,
		} = gameConditions;

		if (isTouchingGround) {
			let cof = 0,
				cor = 0,
				corr = 0;
			const onOutfield = Math.abs(p.z) > 11.28 || Math.abs(p.x) > 1.83;

			if (onOutfield) {
				({ cof, cor, corr } = gameConditions.outfield);
			} else {
				({ cof, cor, corr } = gameConditions.pitch);
			}

			p.y = r; // fix if below pitch

			const isBouncing = v.y < -0.3;

			const slipXZ = new Vector2(v.x - w.z * r, v.z + w.x * r);
			const slipMag = slipXZ.length();

			if (isBouncing) {
				console.log("Bouncing");

				const verticalImpulse = m * (1 + cor) * Math.abs(v.y);
				v.y += verticalImpulse / m;
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
			} else if (slipMag > 0.05) {
				console.log("Sliding");
				v.y = 0;

				if (slipMag > 1e-5) {
					const slipNormalized = slipXZ.clone().normalize();
					const frictionDecel =
						cof * Math.abs(gameConditions.gravityAcc);
					const speedDecrease = frictionDecel * deltaSec;

					if (slipMag > speedDecrease) {
						const ax =
							-frictionDecel * slipNormalized.getComponent(0);
						const az =
							-frictionDecel * slipNormalized.getComponent(1);

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
				v.y = 0;
				const vMag = v.length();
				// rolling acceleration
				if (vMag > 1e-5) {
					const vNormalized = v.clone().normalize();

					// const rollingAcc = vNormalized
					// 	.clone()
					// 	.multiplyScalar(corr * gameConditions.gravityAcc);
					const rollingDecel =
						corr * Math.abs(gameConditions.gravityAcc);
					const speedDecrease = rollingDecel * deltaSec;

					// to not decrease so much that it flips
					if (vMag > speedDecrease) {
						v.x -= vNormalized.x * speedDecrease;
						v.z -= vNormalized.z * speedDecrease;

						w.x = -v.z / r;
						w.y = 0;
						w.z = v.x / r;
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

		// ----- overlay -----
		const vMagUpdated = v.length();
		gameConditions.updateHtmlOverlay(v.x, v.y, v.z, vMagUpdated);

		// stop anim
		if (
			vMagUpdated < 0.02
			// || gameConditions.ballRef.position.z <= -50
		) {
			gameConditions.clearAnim();
			console.log(gameConditions.ballRef.position.z);
		}
	});

	return (
		<group
			position={[0, gameConditions.ballRadius, -5]}
			// scale={[10, 10, 10]}
			// rotation={}
			ref={ballRef}
		>
			<mesh castShadow receiveShadow>
				<sphereGeometry args={[gameConditions.ballRadius, 32, 32]} />
				<meshStandardMaterial
					color="#C41E3A"
					metalness={0.1}
					roughness={0.3}
				/>
			</mesh>

			<group>
				{seamOffsets.map((offset, i) => {
					const seamRadius =
						Math.sqrt(
							gameConditions.ballRadius ** 2 - offset ** 2,
						) + seamHeight;

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
								roughness={0.8}
							/>
						</mesh>
					);
				})}
			</group>
		</group>
	);
}
