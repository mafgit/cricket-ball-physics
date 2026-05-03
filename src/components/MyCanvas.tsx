"use client";
import { Canvas } from "@react-three/fiber";
import {
	ContactShadows,
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
import { gameConditions } from "@/GameConditions";

const sunPos = [-20, 40, 20];

export default function MyCanvas() {
	return (
		<>
			<button
				onClick={() => gameConditions.reinitializeAnim()}
				className="btn"
			>
				Replay
			</button>

			<Canvas
				className="bg-[#9bc3ff] w-screen h-screen"
				camera={{
					position: [0.095, 1.72, -10.06 + 1.32],
					fov: 70,
					near: 0.1,
					far: 1000,
				}}
				shadows
			>
				{/* helpers */}
				{/* <axesHelper args={[30]} />
			<gridHelper args={[20, 20]} /> */}
				<Stats />

				{/* <OrbitControls /> */}

				{/* <FirstPersonControls /> */}
				<PointerLockControls />
				{/* <Player /> */}

				{/* environment */}
				<Environment preset="park" />
				<Sky sunPosition={sunPos} />

				{/* light */}
				<ambientLight intensity={0.3} />
				<directionalLight
					position={sunPos}
					shadow-camera-left={-20}
					shadow-camera-right={20}
					shadow-camera-top={30}
					shadow-camera-bottom={-30}
					shadow-camera-near={10}
					shadow-camera-far={60}
					shadow-mapSize={[2048, 2048]}
					intensity={2}
					castShadow
				/>

				{/* main */}
				<Ball />
				<Ground />
			</Canvas>
		</>
	);
}
