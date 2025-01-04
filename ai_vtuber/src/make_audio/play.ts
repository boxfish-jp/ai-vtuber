import endpointJson from "../../../endpoint.json";

export const play = async (audioData: ArrayBuffer): Promise<void> => {
	try {
		const url = `http://${endpointJson.audio.ip}:${endpointJson.audio.port}`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			body: audioData,
		});

		if (!response.ok) {
			throw new Error(`Failed to post audio data: ${response.statusText}`);
		}
	} catch (e) {
		throw new Error(`Failed to play audio: ${String(e)}`);
	}
};
