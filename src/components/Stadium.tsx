import Grass from "./Grass";
import Pitch from "./Pitch";
import Rope from "./Rope";

export default function Stadium({
	boundarySize = 70,
	texturedPitch = false,
	texturedGrass = true,
}) {
	return (
		<group>
			<Rope boundarySize={boundarySize} />
			<Pitch textured={texturedPitch} />
			<Grass textured={texturedGrass} boundarySize={boundarySize} />
		</group>
	);
}
