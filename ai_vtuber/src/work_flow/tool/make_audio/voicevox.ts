import endpointJson from "../../../../../endpoint.json";
import { sleep } from "../../../lib/sleep.js";
import { play } from "./play.js";

export interface VoicevoxAudioType {
	text: string;
	create(): Promise<void>;
	play(): Promise<void>;
}

export class VoicevoxAudio implements VoicevoxAudioType {
	private _text: string;
	private _audioData: ArrayBuffer | null = null;

	constructor(text: string) {
		this._text = text;
	}

	get text(): string {
		return this._text;
	}

	async create(): Promise<void> {
		const jsonBody = await fetchAudioQuery(this._text);
		this._audioData = await fetchSynthesis(this._text, jsonBody);
	}

	async play(): Promise<void> {
		while (this._audioData === null) {
			await sleep(100);
		}
		await play(this._audioData, this._text);
	}
}

const fetchAudioQuery = async (text: string): Promise<unknown> => {
	const url = new URL(
		`http://${endpointJson.TTS.ip}:${endpointJson.TTS.port}/audio_query`,
	);
	url.searchParams.append("text", text);
	url.searchParams.append("speaker", "3");
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
	url.searchParams.append("speaker", "3");
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
