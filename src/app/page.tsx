import MyCanvas from "@/components/MyCanvas";

export default function Home() {
	return (
		<>
			<p className="hint">Play/Replay (R)</p>
			<div id="velocity">
				<p className="font-bold">POV: Batsman</p>
				<div>
					<p>👉 +x</p>
					<p id="x">0</p>
				</div>
				<div>
					<p>☝️ +y</p>
					<p id="y">0</p>
				</div>

				<div>
					<p>✦ +z</p>
					<p id="z">0</p>
				</div>

				<div>
					<p>Pace</p>
					<p className="w-full"><span id="p">0</span> <span className="ml-auto">KPH</span></p>
				</div>
			</div>
			
			<MyCanvas />
		</>
	);
}
