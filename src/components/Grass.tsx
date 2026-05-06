import { BufferAttribute } from "three";
import TexturedGrassMaterial from "./TexturedGrassMaterial";

export default function Grass({ textured = true }) {
	return (
		<mesh
			position={[0, 0, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			receiveShadow
		>
			<circleGeometry
				args={[70, 100]}
				onUpdate={(g) => {
					g.setAttribute(
						"uv2",
						new BufferAttribute(g.attributes.uv.array, 2),
					);
				}}
			/>
			{textured ? (
				<TexturedGrassMaterial />
			) : (
				<meshStandardMaterial
					color="#41980a"
				/>
			)}
		</mesh>
	);
}
