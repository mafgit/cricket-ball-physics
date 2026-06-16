import { fastParams } from "@/core/exampleBowlTypes";
import GameConditions from "@/core/GameConditions";
import { ballReleasePos } from "@/core/positions";
import { useFrame } from "@react-three/fiber";
import { folder, levaStore, useControls } from "leva";
import { useCallback, useEffect, useRef } from "react";
import { Vector3, type Group } from "three";

export default function Ball() {
	const seamThickness = 0.001;
	const seamOffsets = [-0.01, -0.007, -0.003, 0.003, 0.007, 0.01];
	const ballRef = useRef<Group>(null);
	const seamRef = useRef<Group>(null);
	const game = useRef<GameConditions | null>(null);
	const arrowHelperRef = useRef(null);
	const accumulator = useRef(0);
	const subStepDelta = 1 / 120;

	const toggleGameStopped = useCallback(() => {
		if (!game.current) return;
		game.current.isStopped = !game.current.isStopped;
	}, []);

	const restartAnim = useCallback(() => {
		if (!game.current) return;
		accumulator.current = 0;
		game.current.startAnim({
			speedKph: levaStore.get("Ball.Release Speed/Angle.speedKph"),
			backSpin: levaStore.get("Ball.Spin (Revolutions/sec).backSpin"),
			leftSpin: levaStore.get("Ball.Spin (Revolutions/sec).leftSpin"),
			seamRollLeft: levaStore.get("Ball.Seam Orientation.seamRollLeft"),
			seamYawLeft: levaStore.get("Ball.Seam Orientation.seamYawLeft"),
			verticalAngle: levaStore.get(
				"Ball.Release Speed/Angle.verticalAngle",
			),
			horizAngle: levaStore.get("Ball.Release Speed/Angle.horizAngle"),
			ballReleasePos: [
				levaStore.get("Ball.Release Position.x"),
				levaStore.get("Ball.Release Position.y"),
				levaStore.get("Ball.Release Position.z"),
			],
		});
	}, []);

	const animKeyListener = (e: KeyboardEvent) => {
		if (e.key.toLowerCase() === "p") {
			toggleGameStopped();
		} else if (e.key.toLowerCase() === "r") {
			restartAnim();
		}
	};

	useEffect(() => {
		game.current = new GameConditions(ballRef, seamRef); // one time initialization
		document
			.getElementById("pause-btn")
			?.addEventListener("click", toggleGameStopped);
		document
			.getElementById("replay-btn")
			?.addEventListener("click", restartAnim);
		document.addEventListener("keyup", animKeyListener);

		return () => {
			document
				.getElementById("pause-btn")
				?.removeEventListener("click", toggleGameStopped);
			document
				.getElementById("replay-btn")
				?.removeEventListener("click", restartAnim);
			document.removeEventListener("keyup", animKeyListener);
			game.current = null; // todo: cancelAnimationFrame inside game.current.destroy() new function
		};
	}, []);

	useFrame((state, deltaSec) => {
		const deltaClamped = Math.min(deltaSec, 0.1); // delta clamp because of tab change

		if (!ballRef.current || !seamRef.current || !game.current) return;

		const p = ballRef.current.position;

		state.camera.position.lerp(new Vector3(p.x, p.y + 0.25, p.z + 1), 0.2);
		state.camera.lookAt(p);

		if (game.current.isStopped) return;

		// 2 sec delay when anim starts
		if (game.current.timeElapsed < game.current.runupDuration) {
			game.current.timeElapsed += deltaClamped;
			return;
		}

		if (game.current.ballPositionState === "REST")
			game.current.ballPositionState = "FLIGHT"; // runup to flight transition

		const v = game.current.velocity;

		accumulator.current += deltaClamped;

		while (accumulator.current >= subStepDelta) {
			// game.current.applyAngularDecay(deltaSec);

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
				.add(aMagnus)
				.add(aSwing);

			// -------- updating velocities --------
			v.addScaledVector(a, subStepDelta);

			// -------- updating positions --------
			p.addScaledVector(v, subStepDelta);

			state.camera.position.lerp(
				new Vector3(p.x, p.y + 0.25, p.z + 1), 0.2,
			);

			state.camera.lookAt(p);

			// -------- updating rotations --------
			game.current.updateRotation(subStepDelta);

			// -------- contact with ground --------
			game.current.handleGroundContact(subStepDelta);

			accumulator.current -= subStepDelta;
			const vMagUpdated = v.length();

			// stop anim
			if (vMagUpdated < 0.08 || Math.sqrt(p.x ** 2 + p.z ** 2) >= 20) {
				game.current.clearAnim();
				accumulator.current = 0;
				// console.log(ballRef.current.position.z);
				break;
			}
		}
	});

	return (
		<>
			{/* <arrowHelper
				ref={arrowHelperRef}
				args={[new Vector3(), new Vector3(0, 2, 0), 2, "red"]}
			/> */}

			<group
				position={[0, game.current?.ballRadius ?? 0.0355, -5]}
				ref={ballRef}
				castShadow
				receiveShadow
				// scale={[10, 10, 10]}
			>
				<group castShadow receiveShadow>
					<mesh rotation={[0, 0, -Math.PI / 2]}>
						<sphereGeometry
							args={[
								game.current?.ballRadius ?? 0.0355,
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
								game.current?.ballRadius ?? 0.0355,
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
							roughness={0.7}
						/>
					</mesh>
				</group>

				<group ref={seamRef}>
					{/* <axesHelper args={[5]} /> */}
					{seamOffsets.map((offset, i) => {
						const seamRadius =
							Math.sqrt(
								(game.current?.ballRadius || 0.0355) ** 2 -
									offset ** 2,
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
