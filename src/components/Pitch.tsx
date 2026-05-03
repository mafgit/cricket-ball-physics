export default function Pitch() {
	return (
		<mesh
			position={[0, 0.01, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			receiveShadow
		>
			<planeGeometry args={[3.05, 20.12]} />
			<meshStandardMaterial
				color="#E2D1A7"
				//  side={DoubleSide}
			/>
		</mesh>
	);
}
