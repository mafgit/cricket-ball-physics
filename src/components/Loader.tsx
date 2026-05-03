import { Html, useProgress } from "@react-three/drei";

export default function Loader() {
	const { progress } = useProgress();

	return (
		<Html center>
			<h1>Cricket Ball Physics Simulator</h1>
			<div className="w-[300px] h-[30px] bg-black p-2 rounded-lg">
				<div
					className="h-full bg-white rounded-lg"
					style={{ width: progress + "%" }}
				></div>
			</div>
			<p>{Math.round(progress) + "%"}</p>
		</Html>
	);
}
