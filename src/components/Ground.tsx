import Grass from "./Grass";
import Pitch from "./Pitch";

export default function Ground() {
	return (
		<group>
			<Pitch textured={false} />
			<Grass textured={true} boundarySize={70} />
		</group>
	);
}
