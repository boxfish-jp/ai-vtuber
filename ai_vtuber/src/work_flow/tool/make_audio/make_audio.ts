import { sleep } from "../../../lib/sleep.js";
import { play } from "./play.js";
import { splitSentences } from "./splitSentences.js";
import { VoicevoxAudio, type VoicevoxAudioType } from "./voicevox.js";

export class MakeAudio {
	private waitingQueue: string[] = [];

	constructor() {
		this.start();
	}

	async addQueue(text: string): Promise<void> {
		const sentences = splitSentences(text);
		for (const sentence of sentences) {
			this.waitingQueue.push(sentence);
		}
	}

	async start() {
		while (true) {
			if (this.waitingQueue.length > 0) {
				const audioQueue: VoicevoxAudioType[] = [];
				for (const text of this.waitingQueue) {
					audioQueue.push(new VoicevoxAudio(text));
				}
				this.waitingQueue = [];
				this._createAudios(audioQueue);
				for (const audio of audioQueue) {
					console.log("audio", audio.text);
					await audio.play();
				}
			}
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
