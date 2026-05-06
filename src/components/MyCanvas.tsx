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
import { Suspense, useRef } from "react";
import Loader from "./Loader";
import Batsman from "./Batsman";
import Bowler from "./Bowler";
import {
	batsmanPos,
	bentHeight,
	bowlerPos,
	playerHeight,
	sunPos,
} from "@/core/positions";
// import { useControls } from "leva";

export default function MyCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
			{(() => {
				try {
					return <Environment preset="park" />;
				} catch {
					return <></>;
				}
			})()}
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
