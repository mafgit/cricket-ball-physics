import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function TexturedPitchMaterial() {
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
		<meshStandardMaterial
			{...texture}
		/>
	);
}
