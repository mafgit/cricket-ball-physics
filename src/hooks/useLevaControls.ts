import { fastParams } from "@/core/exampleBowlTypes";
import { ballReleasePos } from "@/core/positions";
import { folder, useControls } from "leva";

export default function useLevaControls() {
	useControls({
		"Ball Preset": {
			options: ["Custom"],
		},
		Ball: folder(
			{
				"Release Speed/Angle": folder(
					{
						speedKph: {
							value: fastParams.speedKph,
							min: 68,
							max: 163,
							step: 0.5,
						},
						verticalAngle: {
							value: fastParams.verticalAngle,
							min: -30,
							max: 10,
							step: 0.2,
						},
						horizAngle: {
							value: fastParams.horizAngle,
							min: -15,
							max: 15,
							step: 0.2,
						},
					},
					{ collapsed: true },
				),

				"Spin (Revolutions/sec)": folder(
					{
						backSpin: {
							value: fastParams.backSpin,
							min: -200,
							max: 200,
							step: 1,
						},
						leftSpin: {
							value: fastParams.leftSpin,
							min: -200,
							max: 200,
							step: 1,
						},
					},
					{ collapsed: true },
				),

				"Seam Orientation": folder(
					{
						seamRollLeft: {
							value: fastParams.seamRollLeft,
							min: -200,
							max: 200,
							step: 1,
						},
						seamYawLeft: {
							value: fastParams.seamYawLeft,
							min: -200,
							max: 200,
							step: 1,
						},
					},
					{ collapsed: true },
				),

				"Release Position": folder(
					{
						x: {
							value: ballReleasePos[0],
							min: -2,
							max: 2,
							step: 0.05,
						},
						y: {
							value: ballReleasePos[1],
							min: 1.5,
							max: 2.5,
							step: 0.05,
						},
						z: {
							value: ballReleasePos[2],
							min: 10.06 - 1.2 - 0.5,
							max: 10.06 - 1.2 + 0.5,
						},
					},
					{ collapsed: true },
				),
			},
			{
				render: (get) => get("Ball Preset") === "Custom",
			},
		),
	});
}
