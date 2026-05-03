const r = 0.0183;
const h = 0.71;
const gap = 0.095

export default function Stumps({ posZ = 10.06 }) {
	return (
		<group position={[0, 0, posZ]}>
			{[-1, 0, 1].map((offsetX, i) => (
				<mesh position={[offsetX * gap, h / 2, 0]} castShadow>
					<cylinderGeometry args={[r, r, h, 30, 30]} />
					<meshStandardMaterial
						color="red"
						roughness={0.3}
						metalness={0.2}
					/>
				</mesh>
			))}
		</group>
	);
}
