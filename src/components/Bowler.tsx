export default function Bowler({
	pos,
	height,
}: {
	pos: number[];
	height: number;
}) {
	return (
		<mesh position={pos as any} castShadow receiveShadow>
			<cylinderGeometry args={[0.2, 0.2, height]} />
			<meshStandardMaterial color="black" transparent opacity={0.3} />
		</mesh>
	);
}
