import { queue } from "sharp";

export interface makeAudioType {
	addQueue(text: string): Promise<void>;
}

export class MakeAudio implements makeAudioType {
	private queue: string[] = [];

	async addQueue(text: string): Promise<void> {
		this.queue.push(text);
	}
}
