import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Mesh } from "three";

// at releastt
const speedKph = 140;
const speedMps = speedKph / 3.6;
const downwardAngleDeg = -3.2; // length
const lineAngleDeg = -3;

const toRad = (deg: number) => (Math.PI * deg) / 180;

const Vzx = speedMps * Math.cos(toRad(downwardAngleDeg));
const Vz = Vzx * Math.cos(toRad(lineAngleDeg));
const Vx = Vzx * Math.sin(toRad(lineAngleDeg));
const Vy = speedMps * Math.sin(downwardAngleDeg);

const Ay = -9.8;

export default function Ball() {
	const ballRadius = 0.036;
	const seamHeight = 0;
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Mesh>(null);
	const stopRef = useRef(false);
	const timeElapsed = useRef(0);
	const velocity = useRef({ x: Vx, y: Vy, z: Vz });

	// #780606
	useFrame((state, deltaSec) => {
		if (timeElapsed.current < 5) {
			timeElapsed.current += deltaSec;
		} else {
			if (!stopRef.current) {
				if (ballRef.current) {
					// ballRef.current.position.z -= 0.2 // moving away
					// ballRef.current.rotation.z -= 0.3 // right spin
					// ballRef.current.rotation.x -= 0.3 // backspin
					// ballRef.current.rotation.y -= 0.3 // slider i guess

					ballRef.current.position.z -= velocity.current.z * deltaSec;
					ballRef.current.position.y -= velocity.current.y * deltaSec;
					ballRef.current.position.x -= velocity.current.x * deltaSec;
					velocity.current.y -= deltaSec * Ay; // gravity

					if (ballRef.current.position.z <= -10.06)
						stopRef.current = true;
					if (ballRef.current.position.y <= ballRadius * 2)
						stopRef.current = true;
				}
			}
		}
	});

	return (
		<group
			position={[-0.7, 1.72, 10.06]}
			ref={ballRef}
			castShadow
			receiveShadow
		>
			<mesh>
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
