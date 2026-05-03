"use client";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";

function Ball() {
	const leatherRef = useRef(null);
	const ballRadius = 2;
	const seamHeight = 0.01;
	const seamThickness = 0.03;
	const seamOffsets = [-0.48, -0.32,  -0.09, 0.09, 0.32, 0.48];
	const ballRef = useRef(null);

	// #780606

	return (
		<group position={[2, 2, 1]} ref={ballRef}>
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
						<mesh key={i} position={[offset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
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

export default function Home() {
	return (
		<div className="h-screen">
			<Canvas
				className="bg-blue-500 w-screen h-screen"
				camera={{ position: [0, 5, 10], rotation: [0, 0, 0] }}
			>
				<axesHelper args={[30]} />
				<gridHelper args={[20, 20]} />
				<OrbitControls />
				<ambientLight />
				{/* <pointLight position={[1, 2, 3]} /> */}

				<Ball />
			</Canvas>
		</div>
	);
}
