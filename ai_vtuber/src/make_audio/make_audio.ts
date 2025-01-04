import { sleep } from "../lib/sleep.js";
import { play } from "./play.js";
import { createAudio } from "./voicevox.js";

export interface makeAudioType {
	addQueue(text: string): Promise<void>;
}

export class MakeAudio implements makeAudioType {
	private queue: string[] = [];

	constructor() {
		this.start();
	}

	async addQueue(text: string): Promise<void> {
		this.queue.push(text);
	}

	async start() {
		while (true) {
			for (let i = 0; i < this.queue.length; i++) {
				await this.process(this.queue[i]);
				this.queue.shift();
				await sleep(1000);
			}
			await sleep(1000);
		}
	}

	async process(text: string): Promise<void> {
		const data = await createAudio(text);
		console.log();
		await play(data);
	}
}
