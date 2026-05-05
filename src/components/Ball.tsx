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

		const p = gameConditions.ballRef.position;
		const v = gameConditions.velocity;
		const w = gameConditions.angularVelocity;

		const a = new Vector3(0, gameConditions.gravityAcc, 0);
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
		const crossProd = new Vector3().crossVectors(w, v);
		a.x += gameConditions.magnusStrength * crossProd.x;
		a.y += gameConditions.magnusStrength * crossProd.y;
		a.z += gameConditions.magnusStrength * crossProd.z;

		// wx *= Math.pow(gameConditions.angularDecay, deltaSec);
		// wy *= Math.pow(gameConditions.angularDecay, deltaSec);
		// wz *= Math.pow(gameConditions.angularDecay, deltaSec);

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
		const angularMag = w.length();

		if (angularMag > 1e-5) {
			w.normalize(); // get angular axis's directions
			deltaTheta.setFromAxisAngle(w, angularMag * deltaSec);
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
		const {
			ballRadius: r,
			ballMass: m,
			coefficientOfFriction: cof,
			coefficientOfRestitution: cor,
			momentOfInertia: I,
		} = gameConditions;

		if (p.y <= r && v.y < 0) {
			p.y = r; // fix if below pitch

			const contactPoint = new Vector3(0, -r, 0); // contact point
			const vContact = new Vector3();
			vContact.copy(v).add(vContact.crossVectors(w, contactPoint));

			const verticalImpulse = -m * (1 + cor) * v.y;
			v.y += verticalImpulse / m;

			const slipXZ = new Vector2(v.x + w.z * r, v.z - w.x * r);
			const slipMag = slipXZ.length();
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

		// updating overlay for speed visuals (opposite signs to adjust for batsman POV)
		const vMagUpdated = v.length();
		gameConditions.updateHtmlOverlay(-v.x, v.y, -v.z, vMagUpdated);

		// stop anim
		if (
			vMagUpdated < 0.1
			// || gameConditions.ballRef.position.z <= -50
		) {
			gameConditions.clearAnim();
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
