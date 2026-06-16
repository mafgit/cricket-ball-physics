import { Html, useProgress } from "@react-three/drei";

export default function Loader() {
	const { progress } = useProgress();

	return (
		<Html center>
			<div className="flex flex-col gap-2 justify-center items-center">
				<h1 className="text-2xl font-bold text-center flex flex-col gap-1">
					<span>🏏</span>
					<span>Cricket Ball Physics Simulator</span>
				</h1>

				<div className="w-[300px] h-[22px] bg-black p-1 rounded-xl">
					<div
						className="h-full bg-white rounded-lg"
						style={{ width: progress + "%" }}
					></div>
				</div>

				<p className="font-bold font-mono text-lg">{Math.round(progress) + "%"}</p>
			</div>
		</Html>
	);
}
