import { gameConditions } from "@/GameConditions";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { type Group } from "three";

function mpsToKph(v: number) {
	return v * 3.6;
}

export default function Ball() {
	const ballRadius = 0.036;
	const seamHeight = 0;
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Group>(null);

	useEffect(() => {
		gameConditions.ballRef = ballRef.current;
	}, []);

	useFrame((state, deltaSec) => {
		if (gameConditions.isStopped || !ballRef.current) return;

		if (gameConditions.timeElapsed < 2) {
			gameConditions.timeElapsed += deltaSec;
		} else {
			// ballRef.current.rotation.z -= 0.3 // right spin
			// ballRef.current.rotation.x -= 0.3 // backspin
			// ballRef.current.rotation.y -= 0.3 // slider i guess

			// console.log(gameConditions.velocity.z);

			// updating velocities
			const v = Math.sqrt(
				gameConditions.velocity.y ** 2 +
					gameConditions.velocity.z ** 2 +
					gameConditions.velocity.x ** 2,
			);
			const accelerationDrag = v ** 2 * gameConditions.dragFactor;

			// division by zero
			if (v > 1e-6) {
				gameConditions.velocity.y +=
					(gameConditions.gravityAcc +
						(gameConditions.velocity.y / v) * accelerationDrag) *
					deltaSec;
				gameConditions.velocity.z -=
					(gameConditions.velocity.z / v) *
					accelerationDrag *
					deltaSec;
				gameConditions.velocity.x -=
					(gameConditions.velocity.x / v) *
					accelerationDrag *
					deltaSec;
			} else {
				gameConditions.velocity.y +=
					gameConditions.gravityAcc * deltaSec;
			}

			// if (Math.abs(gameConditions.velocity.x) < 0.5)
			// 	gameConditions.velocity.x = 0;
			// if (Math.abs(gameConditions.velocity.y) < 0.5)
			// 	gameConditions.velocity.y = 0;
			// if (Math.abs(gameConditions.velocity.z) < 0.001)
			// 	gameConditions.velocity.z = 0;

			// stop anim
			if (ballRef.current.position.z <= -120) {
				gameConditions.isStopped = true;
				gameConditions.timeElapsed = 0;
			}

			// console.log(gameConditions.velocity);
			// bounce
			if (ballRef.current.position.y <= ballRadius) {
				gameConditions.velocity.y *=
					-gameConditions.verticalRetainOnBounce *
					(1 - gameConditions.coefficientOfFriction);
				ballRef.current.position.y = ballRadius;

				gameConditions.velocity.z *=
					1 - gameConditions.coefficientOfFriction;

				gameConditions.velocity.x *=
					1 - gameConditions.coefficientOfFriction;
			}

			// updating positions
			ballRef.current.position.z += gameConditions.velocity.z * deltaSec;
			ballRef.current.position.y = Math.max(
				ballRadius,
				ballRef.current.position.y +
					gameConditions.velocity.y * deltaSec,
			);
			ballRef.current.position.x += gameConditions.velocity.x * deltaSec;

			// velocity on overlay showing
			const velDivX = document.querySelector("#velocity #x") as any;
			const velDivY = document.querySelector("#velocity #y") as any;
			const velDivZ = document.querySelector("#velocity #z") as any;
			const velDivP = document.querySelector("#velocity #p") as any;
			if (velDivX && velDivY && velDivZ) {
				velDivX.innerText = mpsToKph(gameConditions.velocity.x).toFixed(
					2,
				);
				velDivY.innerText = mpsToKph(gameConditions.velocity.y).toFixed(
					2,
				);
				velDivZ.innerText = mpsToKph(gameConditions.velocity.z).toFixed(
					2,
				);
				velDivP.innerText = mpsToKph(v).toFixed(2);
			}
		}
	});

	return (
		<group
			position={gameConditions.initialBallPosition as any}
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
