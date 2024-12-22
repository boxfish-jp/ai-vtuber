import {
	getLatestChatSection,
	insertChatDb,
	makeAsPointed,
} from "./db/chat_db.js";
import { getFuguoState } from "./state/fuguo.js";
import { getViewerState } from "./state/viewer.js";
import type { LLM } from "../llm/llm.js";
import { takeScreenshot } from "../take_screenShot/take_screenshot.js";

export interface controllerType {
	addChat(
		unixTime: number,
		who: "ai" | "fuguo" | "viewer" | "announce",
		chatText: string,
		point: boolean,
	): Promise<void>;

	speakStateChange(speaking: boolean): void;

	talkToAi(unixTime: number, needScreenShot: boolean): Promise<void>;
}

export class Controller implements controllerType {
	private readonly talk: LLM["talk"];

	constructor(talk: LLM["talk"]) {
		this.talk = talk;
	}
	async addChat(
		unixTime: number,
		who: "ai" | "fuguo" | "viewer" | "announce",
		chatText: string,
		point: boolean,
	): Promise<void> {
		if (who === "viewer") {
			const viewerState = getViewerState();
			viewerState.setTalking();
		}
		await insertChatDb(unixTime, who, chatText, point);
	}

	speakStateChange(speaking: boolean): void {
		const fuguoState = getFuguoState();
		fuguoState.talking = speaking;
	}

	async talkToAi(unixTime: number, needScreenShot: boolean): Promise<void> {
		const imageUrl = needScreenShot ? await takeScreenshot() : "";
		await makeAsPointed(unixTime);
		const latestChatSection = await getLatestChatSection();
		await this.talk(latestChatSection, imageUrl);
	}
}
