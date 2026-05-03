import { gameConditions } from "@/GameConditions";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Mesh } from "three";

export default function Ball() {
	const ballRadius = 0.036;
	const seamHeight = 0;
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Mesh>(null);
	gameConditions.ballRef = ballRef.current;

	useFrame((state, deltaSec) => {
		if (gameConditions.timeElapsed < 5) {
			gameConditions.timeElapsed += deltaSec;
		} else {
			if (gameConditions.stopRef === true || !ballRef.current) return;
			// ballRef.current.position.z -= 0.2 // moving away
			// ballRef.current.rotation.z -= 0.3 // right spin
			// ballRef.current.rotation.x -= 0.3 // backspin
			// ballRef.current.rotation.y -= 0.3 // slider i guess

			ballRef.current.position.z += gameConditions.velocity.z * deltaSec;
			ballRef.current.position.y = Math.max(
				ballRadius,
				ballRef.current.position.y +
					gameConditions.velocity.y * deltaSec,
			);
			ballRef.current.position.x += gameConditions.velocity.x * deltaSec;

			const v = Math.sqrt(
				gameConditions.velocity.y ** 2 +
					gameConditions.velocity.z ** 2 +
					gameConditions.velocity.x ** 2,
			);
			const accelerationDrag = v * gameConditions.dragFactor ** 2;
			gameConditions.velocity.y +=
				(gameConditions.gravityAcc +
					(gameConditions.velocity.y / v) * accelerationDrag) *
				deltaSec;
			gameConditions.velocity.z +=
				(gameConditions.velocity.z / v) * accelerationDrag * deltaSec;
			gameConditions.velocity.x -=
				(gameConditions.velocity.x / v) * accelerationDrag * deltaSec;

			if (ballRef.current.position.z <= -10) {
				gameConditions.stopRef = true;
				gameConditions.timeElapsed = 0;
			}
			if (ballRef.current.position.y <= ballRadius) {
				console.log(gameConditions.velocity);
				gameConditions.velocity.y *= -1;
			}
		}
	});

	return (
		<group
			position={gameConditions.initialBallPosition}
			ref={ballRef}
			// scale={[10, 10, 10]}
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
