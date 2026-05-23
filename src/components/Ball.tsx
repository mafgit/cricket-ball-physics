import { fastParams, spinParams } from "@/core/exampleBowlTypes";
import GameConditions from "@/core/GameConditions";
import { ballReleasePos } from "@/core/positions";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3, type Group } from "three";

export default function Ball() {
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Group>(null);
	const seamRef = useRef<Group>(null);
	const game = useRef(new GameConditions(ballRef, seamRef));
	const arrowHelperRef = useRef(null);

	const animKeyListener = (e: KeyboardEvent) => {
		if (e.key.toLowerCase() === "p") {
			game.current.isStopped = !game.current.isStopped;
		} else if (e.key.toLowerCase() === "r") {
			game.current.startAnim({
				...fastParams,
				ballReleasePos,
			});
		}
	};

	useEffect(() => {
		game.current.htmlVelX = document.querySelector("#velocity #x")!;
		game.current.htmlVelY = document.querySelector("#velocity #y")!;
		game.current.htmlVelZ = document.querySelector("#velocity #z")!;
		game.current.htmlPace = document.querySelector("#velocity #p")!;

		document.addEventListener("keyup", animKeyListener);
		return () => document.removeEventListener("keyup", animKeyListener);
	}, []);

	useFrame((state, deltaSec) => {
		if (!ballRef.current || !seamRef.current) return;

		state.camera.position.set(
			ballRef.current.position.x,
			ballRef.current.position.y + 1.2,
			ballRef.current.position.z + 1.7,
		);
		state.camera.lookAt(ballRef.current.position);

		if (game.current.isStopped) return;

		// 2 sec delay when anim starts
		if (game.current.timeElapsed < game.current.runupDuration) {
			game.current.timeElapsed += deltaSec;
			return;
		}

		if (game.current.ballPositionState === "REST")
			game.current.ballPositionState = "FLIGHT"; // runup to flight transition

		// game.current.applyAngularDecay(deltaSec);

		// shorthand
		const p = ballRef.current.position;
		const v = game.current.velocity;

		// -------- accelerations --------
		// on each frame... so no accumulation of accelerations

		const aNormal = game.current.getNormalAcc();

		// drag effect (air resistance)
		const aDrag = game.current.handleDrag();

		// magnus effect (swing in air DUE TO SPIN/ROTATION, perpendicular to angular velocity and velocity, like free kick swing)
		const aMagnus = game.current.handleMagnus();

		// swing
		const aSwing = game.current.handleSwing(arrowHelperRef);

		// ------ summing accelerations ------
		const a = new Vector3(0, 0, 0)
			.add(aNormal)
			.add(game.current.aGrav)
			.add(aDrag)
			// .add(aMagnus)
			.add(aSwing);

		// -------- updating velocities --------
		v.addScaledVector(a, deltaSec);

		// -------- updating positions --------
		p.addScaledVector(v, deltaSec);

		// -------- updating rotations --------
		game.current.updateRotation(deltaSec);

		// -------- contact with ground --------
		game.current.handleGroundContact(deltaSec);

		// ----- overlay -----
		const vMagUpdated = v.length();
		game.current.updateHtmlOverlay(v.x, v.y, v.z, vMagUpdated);

		// stop anim
		if (vMagUpdated < 0.08 || Math.sqrt(p.x ** 2 + p.z ** 2) >= 70) {
			game.current.clearAnim();
			// console.log(ballRef.current.position.z);
		}
	});

	return (
		<>
			<arrowHelper
				ref={arrowHelperRef}
				args={[new Vector3(), new Vector3(0, 2, 0), 2, 'red']}
			/>

			<group
				position={[0, game.current.ballRadius, -5]}
				ref={ballRef}
				castShadow
				receiveShadow
				// scale={[10, 10, 10]}
			>
				<group castShadow receiveShadow>
					<mesh rotation={[0, 0, -Math.PI / 2]}>
						<sphereGeometry
							args={[
								game.current.ballRadius,
								32,
								16,
								0,
								Math.PI * 2,
								0,
								Math.PI / 2,
							]}
						/>
						<meshStandardMaterial
							color="#C41E3A"
							metalness={0}
							roughness={0.15}
						/>
					</mesh>

					<mesh rotation={[0, 0, +Math.PI / 2]}>
						<sphereGeometry
							args={[
								game.current.ballRadius,
								32,
								16,
								0,
								Math.PI * 2,
								0,
								Math.PI / 2,
							]}
						/>
						<meshStandardMaterial
							color="black"
							metalness={0}
							roughness={0.7}
						/>
					</mesh>
				</group>

				<group ref={seamRef}>
					{/* <axesHelper args={[5]} /> */}
					{seamOffsets.map((offset, i) => {
						const seamRadius =
							Math.sqrt(
								game.current.ballRadius ** 2 - offset ** 2,
							) + 0;

						return (
							<mesh
								key={i}
								position={[offset, 0, 0]}
								rotation={[0, Math.PI / 2, 0]}
							>
								<torusGeometry
									args={[seamRadius, seamThickness, 30, 50]}
								/>
								<meshStandardMaterial
									color="#ffffff"
									roughness={0.9}
								/>
							</mesh>
						);
					})}
				</group>
			</group>
		</>
	);
}
