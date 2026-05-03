import TexturedGrassMaterial from "./TexturedGrassMaterial";

export default function Grass({ textured = true }) {
	return (
		<mesh
			position={[0, 0, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			receiveShadow
		>
			<circleGeometry args={[70, 100]} />
			{textured ? (
				<TexturedGrassMaterial />
			) : (
				<meshStandardMaterial color="green" />
			)}
		</mesh>
	);
}
