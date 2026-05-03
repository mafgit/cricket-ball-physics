"use client";
import { Canvas } from "@react-three/fiber";
import {
	Environment,
	FirstPersonControls,
	OrbitControls,
	PointerLockControls,
	Sky,
	Stats,
} from "@react-three/drei";
import Ball from "./Ball";
import Ground from "./Ground";
import Player from "./Player";

export default function MyCanvas() {
	return (
		<Canvas
			className="bg-[#9bc3ff] w-screen h-screen"
			camera={{
				position: [0.095, 1.72, -10.06 + 1.32],
				fov: 70,
				near: 0.1,
				far: 1000,
			}}
		>
			{/* helpers */}
			{/* <axesHelper args={[30]} />
			<gridHelper args={[20, 20]} /> */}
			<Stats />

			{/* <OrbitControls /> */}

			{/* <FirstPersonControls />
			<PointerLockControls /> */}
			<Player />

			{/* environment */}
			<Environment preset="park" />
			<Sky sunPosition={[20, 100, 20]} />

			{/* light */}
			<ambientLight intensity={0.5} />
			<directionalLight
				position={[10, 20, 10]}
				intensity={1.5}
				castShadow
			/>

			{/* main */}
			<Ball />
			<Ground />
		</Canvas>
	);
}
