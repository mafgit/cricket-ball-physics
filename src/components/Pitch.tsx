import Crease from "./Crease";
import Stumps from "./Stumps";
import TexturedPitchMaterial from "./TexturedPitchMaterial";

export default function Pitch({ textured = true }) {
	return (
		<group position={[0, 0.001, 0]}>
			<mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[3.66, 22.56, 10, 100]} />
				{textured ? (
					<TexturedPitchMaterial />
				) : (
					<meshStandardMaterial color="#E2D1A7" />
				)}
			</mesh>

			<group>
				<Crease posZ={-10.06} />
				<Crease posZ={10.06} />
				<Crease posZ={-10.06 + 1.22} popping />
				<Crease posZ={10.06 - 1.22} popping />
				<Crease posZ={0} posX={-1.32} vertical />
				<Crease posZ={0} posX={1.32} vertical />
			</group>

			<Stumps posZ={10.06} />
			<Stumps posZ={-10.06} />
		</group>
	);
}
