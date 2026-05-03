import Grass from "./Grass";
import Pitch from "./Pitch";

export default function Ground() {
	return (
		<group>
			<Pitch textured={true} />
			<Grass textured={true} />
		</group>
	);
}
