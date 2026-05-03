import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Ball() {
	const leatherRef = useRef(null);
	const ballRadius = 0.036;
	const seamHeight = 0;
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef(null);

	// #780606
	useFrame(() => {
		if (ballRef.current) {
			// ballRef.current.position.z -= 0.2 // moving away
			// ballRef.current.rotation.z -= 0.3 // right spin
			// ballRef.current.rotation.x -= 0.3 // backspin
			// ballRef.current.rotation.y -= 0.3 // slider i guess
		}
	});

	return (
		<group position={[2, 2, 1]} ref={ballRef} castShadow receiveShadow>
			<mesh ref={leatherRef}>
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
