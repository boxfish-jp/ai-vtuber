import { exec } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import iconv from "iconv-lite";
import endpoint from "../../../endpoint.json";
import AIConfig from "../../AIConfig.json";
import { sleep } from "../lib/sleep";

export interface Audio {
	create(): Promise<void>;
	play(): Promise<void>;
}

export class voiceVoxAudio implements Audio {
	params = {
		text: "",
		speaker: AIConfig.voice.speakerId.toString(),
	};
	filePath = "";

	constructor(text: string) {
		this.params.text = text;
	}

	get alreadyCreated(): boolean {
		//console.log("filePath: ", this.filePath);
		return this.filePath !== "";
	}

	async fetchAudioQuery(): Promise<unknown> {
		const url = `http://${endpoint.TTS.ip}:${
			endpoint.TTS.port
		}/audio_query?${new URLSearchParams(this.params).toString()}`;
		try {
			const res = await fetch(url, {
				method: "POST",
			});
			console.log("response1 status code: ", res.status);
			return res.json();
		} catch (error) {
			throw new Error(`Failed to fetch synthesis: ${String(error)}`);
		}
	}

	async fetchSynthesis(audioJsonData: unknown): Promise<ArrayBuffer> {
		const url = `http://${endpoint.TTS.ip}:${
			endpoint.TTS.port
		}/synthesis?${new URLSearchParams(this.params).toString()}`;
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
	}

	async saveAudio(audioData: ArrayBuffer): Promise<void> {
		const __dirname = path.resolve(path.dirname(""));
		const fileName = path.join(__dirname, `./${new Date().getTime()}.wav`);
		try {
			const buffer = Buffer.from(audioData);
			writeFileSync(fileName, new Uint8Array(buffer));
		} catch (e) {
			throw new Error(`Failed to save audio: ${String(e)}`);
		}
		this.filePath = fileName;
		console.log("Audio created: ", this.filePath);
	}

	async executeCommand(command: string): Promise<void> {
		await new Promise<void>((resolve) =>
			exec(command, { encoding: "buffer" }, (err, stdout, stderr) => {
				if (err) {
					console.log(`stderr: ${iconv.decode(stderr, "Shift_JIS")}`);
					return;
				}
				resolve();
			}),
		);
	}

	async deleteAudio(): Promise<void> {
		try {
			unlinkSync(this.filePath);
		} catch (e) {
			throw new Error(`Failed to delete audio: ${String(e)}`);
		}
		this.filePath = "";
	}

	async create() {
		console.log("Creating audio...", this.params.text);
		const audioJsonData = await this.fetchAudioQuery();
		const audioData = await this.fetchSynthesis(audioJsonData);
		await this.saveAudio(audioData);
	}

	async play() {
		while (!this.alreadyCreated) {
			await sleep(50);
			console.log("Waiting for audio to be created...");
		}
		try {
			console.log("play", this.filePath);
			const command = `"C:/Program Files/VLC/vlc.exe" --play-and-exit --gain=1.5 "${this.filePath}"`;
			console.log("command: ", command);
			await this.executeCommand(command);
			this.deleteAudio();
		} catch (e) {
			throw new Error(`Failed to play audio: ${String(e)}`);
		}
	}
}
