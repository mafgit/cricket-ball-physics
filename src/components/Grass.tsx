import { BufferAttribute } from "three";
import TexturedGrassMaterial from "./TexturedGrassMaterial";

export default function Grass({ textured = true, boundarySize = 70 }) {
	return (
		<group>
			<mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
				<torusGeometry args={[boundarySize + 0.06, 0.1, 20, 55]} />
				<meshStandardMaterial color="blue" />
			</mesh>

			<mesh
				position={[0, 0, 0]}
				rotation={[-Math.PI / 2, 0, 0]}
				receiveShadow
			>
				<circleGeometry
					args={[boundarySize, 100]}
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
					<meshStandardMaterial color="#41980a" />
				)}
			</mesh>
		</group>
	);
}
