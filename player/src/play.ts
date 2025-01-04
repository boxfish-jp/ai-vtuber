import { exec } from "child_process";
import { unlinkSync, writeFileSync } from "fs";
import path from "path";
import iconv from "iconv-lite";

export const play = async (audio: ArrayBuffer): Promise<void> => {
	try {
		const filePath = await saveAudio(audio);
		console.log("play", filePath);
		const command = `ffplay -autoexit -nodisp "${filePath}"`;
		console.log("command: ", command);
		await executeCommand(command);
		deleteAudio(filePath);
	} catch (e) {
		throw new Error(`Failed to play audio: ${String(e)}`);
	}
};
const saveAudio = async (audioData: ArrayBuffer): Promise<string> => {
	const __dirname = path.resolve(path.dirname(""));
	const fileName = path.join(__dirname, `./${new Date().getTime()}.wav`);
	try {
		const buffer = Buffer.from(audioData);
		writeFileSync(fileName, new Uint8Array(buffer));
	} catch (e) {
		throw new Error(`Failed to save audio: ${String(e)}`);
	}
	return fileName;
};

const executeCommand = async (command: string): Promise<void> => {
	await new Promise<void>((resolve) =>
		exec(command, { encoding: "buffer" }, (err, stdout, stderr) => {
			if (err) {
				console.log(`stderr: ${iconv.decode(stderr, "Shift_JIS")}`);
				return;
			}
			resolve();
		}),
	);
};

const deleteAudio = async (filePath: string): Promise<void> => {
	try {
		unlinkSync(filePath);
	} catch (e) {
		throw new Error(`Failed to delete audio: ${String(e)}`);
	}
};
