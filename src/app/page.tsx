"use client";
import { Leva } from "leva";
import dynamic from "next/dynamic";

const MyCanvas = dynamic(() => import("@/components/3d/MyCanvas"), { ssr: false });

export default function Home() {
	return (
		<>
			<div className="overlay-btns">
				<button id="replay-btn">Replay (R)</button>
				<button id="pause-btn">Pause (P)</button>
			</div>

			<Leva oneLineLabels={true} collapsed={false} hideCopyButton />

			{/* <div id="velocity">
				<p className="font-bold">POV: Bowler</p>
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
			 */}
			<MyCanvas />
		</>
	);
}
