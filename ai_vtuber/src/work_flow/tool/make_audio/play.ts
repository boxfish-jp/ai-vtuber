import { hc } from "hono/client";
import endpointJson from "../../../../../endpoint.json" with { type: "json" };
import type { restPostChatType } from "../../../index.js";

export const play = async (
	audioData: ArrayBuffer,
	text: string,
): Promise<void> => {
	const url = `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}`;
	const response = await hc<restPostChatType>(url).chat.$post({
		json: {
			who: "ai",
			content: text,
			unixTime: new Date().getTime(),
			point: false,
		},
	});

	if (!response.ok) {
		console.log(` Failed to post ai_vtuber server:${response.statusText}`);
	}
	try {
		const url = `http://${endpointJson.audio.ip}:${endpointJson.audio.port}?channel=1`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			body: audioData,
		});

		if (!response.ok) {
			console.log(`Failed to post audio data: ${response.statusText}`);
		}
	} catch (e) {
		console.log(`Failed to play audio: ${String(e)}`);
	}
};
