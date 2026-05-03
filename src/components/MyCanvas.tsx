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
import { useEffect, useRef } from "react";

const sunPos = [-20, 40, 20];
const restartAnimListener = (e: KeyboardEvent) => {
	if (e.key.toLowerCase() === "r") {
		gameConditions.reinitializeAnim();
	}
};

export default function MyCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		document.addEventListener("keyup", restartAnimListener);
		if (canvasRef.current) {
			canvasRef.current.focus();
		}

		return () => document.removeEventListener("keyup", restartAnimListener);
	}, []);

	return (
		<>
			<p className="hint">Replay (R)</p>

			<Canvas
				ref={canvasRef}
				tabIndex={0}
				className="bg-[#9bc3ff] w-screen h-screen"
				camera={{
					position: [0.095, 1.72, -10.06 + 1.32],
					fov: 60,
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
