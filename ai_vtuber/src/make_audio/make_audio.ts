import { getAiState } from "../controller/state/ai.js";
import { sleep } from "../lib/sleep.js";
import { play } from "./play.js";
import { splitSentences } from "./splitSentences.js";
import { createAudio } from "./voicevox.js";

export interface makeAudioType {
	addQueue(text: string): Promise<void>;
}

export class MakeAudio implements makeAudioType {
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
			const audioQueue: Promise<[ArrayBuffer, string]>[] = [];
			for (const text of this.waitingQueue) {
				audioQueue.push(Promise.all([createAudio(text), text]));
			}
			this.waitingQueue = [];
			const values = await Promise.all(audioQueue);
			for (const [audio, text] of values) {
				await play(audio, text);
			}
			const aiState = getAiState();
			aiState.talking = false;
			await sleep(1000);
		}
	}

	async process(text: string): Promise<void> {
		const data = await createAudio(text);
		await play(data, text);
	}
}
