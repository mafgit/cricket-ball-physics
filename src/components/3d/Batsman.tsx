export default function Batsman({
	pos,
	bentHeight,
}: {
	pos: number[];
	bentHeight: number;
}) {
	return (
		<mesh position={pos as any} castShadow receiveShadow>
			<cylinderGeometry args={[0.2, 0.2, bentHeight]} />
			<meshStandardMaterial color="white" transparent opacity={0.3} />
		</mesh>
	);
}
