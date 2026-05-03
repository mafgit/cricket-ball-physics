import { FirstPersonControls, PointerLockControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Player() {
	// lock height
	// useFrame(({ camera }) => {
	// 	camera.position.y = 1.72;
	// });

	return <PointerLockControls />;
}
