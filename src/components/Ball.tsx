import { gameConditions } from "@/GameConditions";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Vector3, type Group } from "three";
import { clamp } from "three/src/math/MathUtils.js";

export default function Ball() {
	// const ballRadius = 0.036;
	const ballRadius = 0.036;
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
		if (gameConditions.isStopped || !gameConditions.ballRef) return;

		// 2 sec delay when anim starts
		if (gameConditions.timeElapsed < gameConditions.runupDuration) {
			gameConditions.timeElapsed += deltaSec;
			return;
		}

		// drag force applies against all velocity components only during flight
		// gravity affects only Vy at all times
		// CoR applies only to Vy, only on bounce
		// CoF applies to Vx and Vz, only on bounce

		let { x: vx, y: vy, z: vz } = gameConditions.velocity;
		let { x: px, y: py, z: pz } = gameConditions.ballRef.position;
		let { x: wx, y: wy, z: wz } = gameConditions.angularVelocity;

		let ax = 0,
			ay = gameConditions.gravityAcc,
			az = 0; // on each frame, no accumulation of accelerations

		// -------- updating accelerations/forces --------

		// drag effect (air resistance)
		const vMagnitude = Math.sqrt(vy ** 2 + vz ** 2 + vx ** 2);
		if (vMagnitude > 1e-5) {
			const dragAcc = vMagnitude ** 2 * gameConditions.dragFactor;
			ax -= (vx / vMagnitude) * dragAcc;
			ay -= (vy / vMagnitude) * dragAcc;
			az -= (vz / vMagnitude) * dragAcc;
		}

		// magnus effect (swing in air DUE TO SPIN/ROTATION, perpendicular to angular velocity and velocity, like free kick swing)
		const crossProd = {
			x: wy * vz - wz * vy,
			y: wz * vx - wx * vz,
			z: wx * vy - wy * vx,
		};
		ax += gameConditions.magnusStrength * crossProd.x;
		ay += gameConditions.magnusStrength * crossProd.y;
		az += gameConditions.magnusStrength * crossProd.z;

		wx *= Math.pow(gameConditions.angularDecay, deltaSec);
		wy *= Math.pow(gameConditions.angularDecay, deltaSec);
		wz *= Math.pow(gameConditions.angularDecay, deltaSec);

		// -------- updating velocities --------
		vx += ax * deltaSec;
		vy += ay * deltaSec;
		vz += az * deltaSec;

		// -------- updating positions --------
		px += vx * deltaSec;
		py += vy * deltaSec;
		pz += vz * deltaSec;

		// -------- updating rotations --------
		const deltaTheta = new Quaternion();
		const angularAxis = new Vector3(wx, wy, wz);
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
		if (py <= ballRadius && vy < 0) {
			py = ballRadius; // fix if below pitch

			let vyBefore = vy;
			vy *= -gameConditions.coefficientOfRestitution; // opposite direction with retained bounce

			// vx *= 1 - gameConditions.coefficientOfFriction; // x and z affected by friction
			// vz *= 1 - gameConditions.coefficientOfFriction;

			// surface velocity of point of contact wrt ball (i.e, below its center) (0, -ballRadius, 0)
			const vSurfaceX = wz * ballRadius;
			const vSurfaceZ = -wx * ballRadius;

			const vSlideX = vx - vSurfaceX;
			const vSlideZ = vz - vSurfaceZ;
			const vSlideMag = Math.sqrt(vSlideX ** 2 + vSlideZ ** 2);

			// friction impulse
			if (vSlideMag > 1e-5) {
				const frictionScale =
					Math.abs(vyBefore) *
					gameConditions.coefficientOfRestitution *
					gameConditions.coefficientOfFriction;
				// how hard it hit the ground
				const fx =
					clamp(frictionScale, 0, Math.abs(vSlideX)) *
					Math.sign(vSlideX);
				const fz =
					clamp(frictionScale, 0, Math.abs(vSlideZ)) *
					Math.sign(vSlideZ);
				// const fx =
				// 	Math.min(frictionScale, Math.abs(vSlideX)) *
				// 	Math.sign(vSlideX);
				// const fz =
				// 	Math.min(frictionScale, Math.abs(vSlideZ)) *
				// 	Math.sign(vSlideZ);

				vx -= fx;
				vz -= fz;
			}

			wx *= 0.6;
			wy *= 0.6;
			wz *= 0.6;
		}

		// -------- updating all inside the main object --------
		gameConditions.velocity.x = vx;
		gameConditions.velocity.y = vy;
		gameConditions.velocity.z = vz;
		gameConditions.ballRef.position.set(px, py, pz);
		gameConditions.angularVelocity.x = wx; // just move inside if contact block if no other things gonna change it
		gameConditions.angularVelocity.y = wy;
		gameConditions.angularVelocity.z = wz;

		// updating overlay for speed visuals (opposite signs to adjust for batsman POV)
		gameConditions.updateHtmlOverlay(-vx, vy, -vz);

		// stop anim
		if (
			vMagnitude < 0.1
			// || gameConditions.ballRef.position.z <= -50
		) {
			gameConditions.clearAnim();
		}
	});

	return (
		<group
			position={[0, ballRadius, -5]}
			// scale={[10, 10, 10]}
			// rotation={}
			ref={ballRef}
		>
			<mesh castShadow receiveShadow>
				<sphereGeometry args={[ballRadius, 32, 32]} />
				<meshStandardMaterial
					color="#C41E3A"
					metalness={0.1}
					roughness={0.3}
				/>
			</mesh>

			<group>
				{seamOffsets.map((offset, i) => {
					const seamRadius =
						Math.sqrt(ballRadius ** 2 - offset ** 2) + seamHeight;

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
