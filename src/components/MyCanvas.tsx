"use client";
import { Canvas } from "@react-three/fiber";
import {
	Environment,
	FirstPersonControls,
	OrbitControls,
	PerspectiveCamera,
	PointerLockControls,
	Sky,
	Stats,
} from "@react-three/drei";
import Ball from "./Ball";
import Ground from "./Ground";
import Player from "./Player";
import { gameConditions } from "@/GameConditions";
import { Suspense, useEffect, useRef } from "react";
import Loader from "./Loader";
// import { useControls } from "leva";

const fastParams = {
	speedKph: 142,
	verticalAngle: -0.14,
	horizAngle: 0.03,
	angularVelocity: [30, 0, 15],
	seamAngle: [0, -0.4, 0],
};

const spinParams = {
	speedKph: 83,
	verticalAngle: 0.01,
	horizAngle: 0,
	angularVelocity: [0*-30,0,200],
	// angularVelocity: [-10, 0, -20],
	seamAngle: [0, Math.PI/2 + 0.5, 0],
};

const sunPos = [-20, 40, 20];
const restartAnimListener = (e: KeyboardEvent) => {
	if (e.key.toLowerCase() === "r") {
		gameConditions.startAnim({
			...spinParams,
			initialBallPosition: [-0.6, 1.85, 10.06 - 1.32],
		});
	}
};

const bowlerPosition = [-0.35, 1.72, 10.06 - 1];
const batterPosition = [0.095, 1.72, -10.06 + 1.32];

export default function MyCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// const { gravityAcc } = useControls({
	// 	gravityAcc: {
	// 		min: -40,
	// 		max: 30,
	// 		value: -9.807,
	// 		step: -9.807 / 4,
	// 	},
	// });

	useEffect(() => {
		document.addEventListener("keyup", restartAnimListener);
		// if (canvasRef.current) {
		// 	canvasRef.current.focus();
		// }

		return () => document.removeEventListener("keyup", restartAnimListener);
	}, []);

	return (
		<Canvas
			ref={canvasRef}
			tabIndex={0}
			className="bg-[#9bc3ff] w-screen h-screen"
			camera={{
				position: batterPosition as any,
				fov: 65,
				near: 0.1,
				far: 1000,
			}}
			shadows
		>
			{/* helpers */}
			{/* <axesHelper args={[30]} />
			<gridHelper args={[20, 20]} /> */}
			<Stats className="fps" />

			{/* Controls */}
			{/* <OrbitControls /> */}
			{/* <FirstPersonControls /> */}
			<PointerLockControls pointerSpeed={1.5} />
			{/* <Player /> */}

			{/* environment */}
			{/* <Environment preset="park" /> */}
			<Sky sunPosition={sunPos as any} />

			{/* light */}
			<ambientLight intensity={0.3} />
			<directionalLight
				position={sunPos as any}
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
			<Suspense fallback={<Loader />}>
				<Ball />
				<Ground />
			</Suspense>
		</Canvas>
	);
}
