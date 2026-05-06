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
import Batsman from "./Batsman";
import Bowler from "./Bowler";
// import { useControls } from "leva";

const fastParams = {
	speedKph: 142,
	verticalAngle: -0.3,
	horizAngle: 0.03,
	angularVelocity: [15, 0, 15],
	// [+backspin, --, +left] (inswing)
	seamAngle: [0, -0.4, 0],
};

const spinParams = {
	speedKph: 82,
	verticalAngle: (2 * Math.PI) / 180,
	horizAngle: 0.02,
	angularVelocity: [-45, 0, -70],
	// angularVelocity: [0, 0, 0],
	seamAngle: [0, Math.PI / 2 + 0.5, 0],
};

const playerHeight = 1.8;
const bentHeight = playerHeight - 0.1;
const bowlerReleaseHeight = playerHeight + 0.3;

const batsmanPos = [0.095, bentHeight / 2, -10.06 + 1.32];
const batsmanCameraPos = [0.095, bentHeight, -10.06 + 1.32];

const bowlerCameraPos = [-0.75, playerHeight, 10.06 - 1.2];
const bowlerPos = [-0.75, playerHeight / 2, 10.06 - 1.2];
const ballReleasePos = [-0.45, bowlerReleaseHeight, 10.06 - 1.32];

const sunPos = [-20, 40, 20];
const restartAnimListener = (e: KeyboardEvent) => {
	if (e.key.toLowerCase() === "r") {
		gameConditions.startAnim({
			...spinParams,
			initialBallPosition: ballReleasePos,
		});
	}
};

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
				position: [10, 5, -15] as any,
				fov: 65,
				near: 0.05,
				far: 1000,
			}}
			shadows
		>
			{/* helpers */}
			{/* <axesHelper args={[30]} />
			<gridHelper args={[20, 20]} /> */}
			<Stats className="fps" />

			{/* Controls */}
			<OrbitControls makeDefault />
			{/* <FirstPersonControls movementSpeed={5} /> */}
			{/* <PointerLockControls pointerSpeed={1.5} /> */}
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
				<Batsman pos={batsmanPos} bentHeight={bentHeight} />
				<Bowler pos={bowlerPos} height={playerHeight} />
				<Ball />
				<Ground />
			</Suspense>
		</Canvas>
	);
}
