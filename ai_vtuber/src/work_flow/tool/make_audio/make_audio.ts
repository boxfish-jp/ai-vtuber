import { sleep } from "../../../lib/sleep.js";
import { splitSentences } from "./splitSentences.js";
import { VoicevoxAudio, type VoicevoxAudioType } from "./voicevox.js";

export class MakeAudio {
	private _waitingQueue: string[] = [];
	private _isInterrupt = false;

	private static _makeAudio: undefined | MakeAudio = undefined;

	static getInstance = () => {
		if (!MakeAudio._makeAudio) {
			MakeAudio._makeAudio = new MakeAudio();
		}
		return MakeAudio._makeAudio;
	};

	private constructor() {
		this.start();
	}

	interrupt(interrupt: boolean) {
		this._isInterrupt = interrupt;
	}

	async addQueue(text: string): Promise<void> {
		const sentences = splitSentences(text);
		for (const sentence of sentences) {
			if (sentence.trim()) {
				this._waitingQueue.push(sentence);
			}
		}
	}

	async start() {
		while (true) {
			const playedTexts: string[] = [];
			if (this._waitingQueue.length > 0) {
				const audioQueue: VoicevoxAudioType[] = [];
				for (const text of this._waitingQueue) {
					audioQueue.push(new VoicevoxAudio(text));
				}
				this._waitingQueue = [];
				this._createAudios(audioQueue);
				for (const audio of audioQueue) {
					console.log("audio", audio.text);
					if (!this._isInterrupt) {
						playedTexts.push(audio.text);
						await audio.play();
					}
				}
			}
			if (playedTexts.length) {
				sendStreemingKit(playedTexts.join());
			}
			this._isInterrupt = false;
			await sleep(1000);
		}
	}

	private async _createAudios(audioQueue: VoicevoxAudioType[]): Promise<void> {
		for (const audio of audioQueue) {
			audio.create();
			await sleep(100);
		}
	}
}

const sendStreemingKit = async (content: string) => {
	const streemingKitUrl = "http://localhost:3002";
	const formData = new FormData();
	formData.append("who", "bot");
	formData.append("content", content);
	const streemingKitResponse = await fetch(streemingKitUrl, {
		method: "POST",
		body: formData,
	});

	if (!streemingKitResponse.ok) {
		console.log(
			` Failed to post streemingKitUrl server:${streemingKitResponse.statusText}`,
		);
	}
};
