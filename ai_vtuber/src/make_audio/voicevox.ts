import endpointJson from "../../../endpoint.json";

export const createAudio = async (text: string): Promise<ArrayBuffer> => {
	const jsonBody = await fetchAudioQuery(text);
	const audioData = await fetchSynthesis(text, jsonBody);
	return audioData;
};

const fetchAudioQuery = async (text: string): Promise<unknown> => {
	const url = new URL(
		`http://${endpointJson.TTS.ip}:${endpointJson.TTS.port}/audio_query`,
	);
	url.searchParams.append("text", text);
	url.searchParams.append("speaker", "2");
	try {
		const res = await fetch(url.toString(), {
			method: "POST",
		});
		//console.log("response1 status code: ", res.status);
		return res.json();
	} catch (error) {
		throw new Error(`Failed to fetch synthesis: ${String(error)}`);
	}
};

const fetchSynthesis = async (
	text: string,
	audioJsonData: unknown,
): Promise<ArrayBuffer> => {
	const url = new URL(
		`http://${endpointJson.TTS.ip}:${endpointJson.TTS.port}/synthesis`,
	);
	url.searchParams.append("text", text);
	url.searchParams.append("speaker", "2");
	try {
		const res = await fetch(url, {
			method: "POST",
			body: JSON.stringify(audioJsonData),
			headers: {
				"Content-Type": "application/json",
			},
		});
		console.log("response2 status code: ", res.status);
		return res.arrayBuffer();
	} catch (error) {
		throw new Error(`Failed to fetch synthesis: ${String(error)}`);
	}
};
