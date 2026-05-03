import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function TexturedGrassMaterial() {
	const maps = useTexture([
		"/Grass005_2K-JPG/Grass005_2K-JPG_AmbientOcclusion.jpg",
		"/Grass005_2K-JPG/Grass005_2K-JPG_Color.jpg",
		// "/Grass005_2K-JPG/Grass005_2K-JPG_Displacement.jpg",
		"/Grass005_2K-JPG/Grass005_2K-JPG_NormalGL.jpg",
		"/Grass005_2K-JPG/Grass005_2K-JPG_Roughness.jpg",
	]);

	const [aoMap, colorMap, normalMap, roughnessMap] = maps;

	// texture repeating
	maps.forEach((map) => {
		map.wrapS = map.wrapT = THREE.RepeatWrapping;
		map.repeat.set(60, 60);
	});

	return (
		<meshStandardMaterial
			map={colorMap}
			aoMap={aoMap}
			roughnessMap={roughnessMap}
			normalMap={normalMap}
		/>
	);
}
