import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import Crease from "./Crease";
import Stumps from "./Stumps";

export default function Pitch() {
	const texture = useTexture({
		normalMap: "/Ground026_2K-JPG/Ground026_2K-JPG_NormalDX.jpg",
		// displacementMap:
		// 	"/Ground026_2K-JPG/Ground026_2K-JPG_Displacement.jpg",
		map: "/Ground026_2K-JPG/Ground026_2K-JPG_Color.jpg",
		aoMap: "/Ground026_2K-JPG/Ground026_2K-JPG_AmbientOcclusion.jpg",
		roughnessMap: "/Ground026_2K-JPG/Ground026_2K-JPG_Roughness.jpg",
	});

	if (texture.map) {
		Object.values(texture).forEach((t) => {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
			t.repeat.set(1, 6);
		});
		texture.map.colorSpace = THREE.SRGBColorSpace;
	}

	return (
		<group position={[0, 0.001, 0]}>
			<mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[3.66, 22.56, 10, 100]} />
				<meshStandardMaterial
					{...texture}
					// color="#E2D1A7"
					//  side={DoubleSide}
				/>
			</mesh>

			<group>
				<Crease posZ={-10.06} />
				<Crease posZ={10.06} />
				<Crease posZ={-10.06 + 1.22} popping />
				<Crease posZ={10.06 - 1.22} popping />
				<Crease posZ={0} posX={-1.32} vertical />
				<Crease posZ={0} posX={1.32} vertical />
			</group>

			<Stumps posZ={10.06}/>
			<Stumps posZ={-10.06}/>
		</group>
	);
}
