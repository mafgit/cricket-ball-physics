import { DoubleSide } from "three";

export default function Crease({
	posZ,
	popping = false,
	vertical = false,
	posX = 0,
}: {
	posZ: number;
	popping?: boolean;
	vertical?: boolean;
	posX?: number;
}) {
	let w, h;

	if (!vertical) {
		w = popping ? 3.66 : 2.64;
		h = 0.05;
	} else {
		w = 0.05;
		h = 22;
	}

	return (
		<mesh position={[posX, 0, posZ]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[w, h, 20, 20]} />
			<meshStandardMaterial
				color="white"
				transparent
				roughness={1}
				opacity={1}
				polygonOffset
				polygonOffsetUnits={-1}
				polygonOffsetFactor={-1}
			/>
		</mesh>
	);
}
