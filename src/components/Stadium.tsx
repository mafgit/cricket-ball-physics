import Grass from "./Grass";
import Pitch from "./Pitch";
import Rope from "./Rope";

export default function Stadium({ boundarySize = 70 }) {
	return (
		<group>
			<Rope boundarySize={boundarySize} />
			<Pitch textured={false} />
			<Grass textured={true} boundarySize={boundarySize} />
		</group>
	);
}
