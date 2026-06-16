import { folder, levaStore, useControls } from "leva";
import Grass from "./Grass";
import Pitch from "./Pitch";
import Rope from "./Rope";

export default function Stadium({ boundarySize = 70 }) {
	const { texturedPitch, texturedGrass } = useControls({
		"Texture/Environment": folder(
			{
				texturedPitch: false,
				texturedGrass: true,
			},
			{ collapsed: true },
		),
	});

	return (
		<group>
			<Rope boundarySize={boundarySize} />
			<Pitch textured={texturedPitch} />
			<Grass textured={texturedGrass} boundarySize={boundarySize} />
		</group>
	);
}
