import { gameConditions } from "@/GameConditions";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { type Group } from "three";

export default function Ball() {
	// const ballRadius = 0.036;
	const ballRadius = 0.036;
	const seamHeight = 0;
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Group>(null);

	useEffect(() => {
		gameConditions.ballRef = ballRef.current;
		gameConditions.htmlVelX = document.querySelector("#velocity #x")!;
		gameConditions.htmlVelY = document.querySelector("#velocity #y")!;
		gameConditions.htmlVelZ = document.querySelector("#velocity #z")!;
		gameConditions.htmlPace = document.querySelector("#velocity #p")!;
	}, []);

	useFrame((state, deltaSec) => {
		if (gameConditions.isStopped || !ballRef.current) return;

		// 2 sec delay when anim starts
		if (gameConditions.timeElapsed < gameConditions.runupDuration) {
			gameConditions.timeElapsed += deltaSec;
			return;
		}

		// ballRef.current.rotation.z -= 0.3 // right spin
		// ballRef.current.rotation.x -= 0.3 // backspin
		// ballRef.current.rotation.y -= 0.3 // slider i guess

		// drag force applies against all velocity components only during flight
		// gravity affects only Vy at all times
		// CoR applies only to Vy, only on bounce
		// CoF applies to Vx and Vz, only on bounce

		let { x: vx, y: vy, z: vz } = gameConditions.velocity;
		let { x: px, y: py, z: pz } = gameConditions.ballRef.position;
		let { x: rx, y: ry, z: rz } = gameConditions.ballRef.rotation;
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

		// magnus effect (spin & rotation)
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
		rx += wx * deltaSec;
		ry += wy * deltaSec;
		rz += wz * deltaSec;

		// -------- on contact with ground --------
		if (py <= ballRadius && vy < 0) {
			py = ballRadius; // fix if below pitch
			vy *= -gameConditions.coefficientOfRestitution;
			vx *= 1 - gameConditions.coefficientOfFriction;
			vz *= 1 - gameConditions.coefficientOfFriction;
		}

		// -------- updating all inside the main object --------
		gameConditions.velocity.x = vx;
		gameConditions.velocity.y = vy;
		gameConditions.velocity.z = vz;

		gameConditions.ballRef.position.x = px;
		gameConditions.ballRef.position.y = py;
		gameConditions.ballRef.position.z = pz;

		gameConditions.ballRef.rotation.x = rx;
		gameConditions.ballRef.rotation.y = ry;
		gameConditions.ballRef.rotation.z = rz;

		// updating overlay for speed visuals (opposite signs to adjust for batsman POV)
		gameConditions.updateHtmlOverlay(-vx, vy, -vz, vMagnitude);

		// stop anim
		if (vMagnitude < 0.1 || ballRef.current.position.z <= -50) {
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
								args={[seamRadius, seamThickness, 8, 18]}
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
