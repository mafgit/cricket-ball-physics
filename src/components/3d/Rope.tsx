export default function Rope({ boundarySize = 70 }) {
	return (
		<mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
			<torusGeometry args={[boundarySize + 0.06, 0.1, 20, 55]} />
			<meshStandardMaterial color="blue" />
		</mesh>
	);
}
