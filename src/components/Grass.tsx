export default function Grass() {
	return (
		<mesh
			position={[0, 0, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			receiveShadow
		>
			<circleGeometry args={[70, 20]} />
			<meshStandardMaterial
				color="green"
				//  side={DoubleSide}
			/>
		</mesh>
	);
}
