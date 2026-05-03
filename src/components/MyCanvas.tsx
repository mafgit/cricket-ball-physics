"use client";
import { Canvas } from "@react-three/fiber";
import { FirstPersonControls, OrbitControls } from "@react-three/drei";
import Ball from "./Ball";
import Ground from "./Ground";

export default function MyCanvas() {
	return (
		<Canvas
			className="bg-[#9bc3ff] w-screen h-screen"
			camera={{ position: [2, 1.72, 10], fov: 75 }}
		>
			{/* helpers */}
			<axesHelper args={[30]} />
			<gridHelper args={[20, 20]} />
			<OrbitControls />
			<FirstPersonControls />

			{/* light */}
			{/* <ambientLight /> */}
			<directionalLight
				position={[1000, 1000, 1000]}
				intensity={3}
				castShadow
			/>

			{/* main */}
			<Ball />
			<Ground />
		</Canvas>
	);
}
