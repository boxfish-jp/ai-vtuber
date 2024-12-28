import type { Chat } from "@prisma/client";
import type { LLM } from "../llm/llm.js";
import { takeScreenshot } from "../take_screenShot/take_screenshot.js";
import {
	getLatestChatSection,
	insertChatDb,
	makeAsPointed,
} from "./db/chat_db.js";
import { getFuguoState } from "./state/fuguo.js";
import { getViewerState } from "./state/viewer.js";

export interface controllerType {
	addChat(
		unixTime: bigint,
		who: "ai" | "fuguo" | "viewer" | "announce",
		chatText: string,
		point: boolean,
	): Promise<Chat>;

	speakStateChange(speaking: boolean): boolean;

	talkToAi(
		unixTime: bigint,
		needScreenShot: boolean,
	): Promise<{ chats: Chat[]; url: string }>;
}

export class Controller implements controllerType {
	private readonly talk: LLM["talk"];

	constructor(talk: LLM["talk"]) {
		this.talk = talk;
	}
	async addChat(
		unixTime: bigint,
		who: "ai" | "fuguo" | "viewer" | "announce",
		chatText: string,
		point: boolean,
	): Promise<Chat> {
		if (who === "viewer") {
			const viewerState = getViewerState();
			viewerState.setTalking();
		}
		const createdChat = await insertChatDb(unixTime, who, chatText, point);
		return createdChat;
	}

	speakStateChange(speaking: boolean): boolean {
		const fuguoState = getFuguoState();
		fuguoState.talking = speaking;
		return fuguoState.talking;
	}

	async talkToAi(
		unixTime: bigint,
		needScreenShot: boolean,
	): Promise<{ chats: Chat[]; url: string }> {
		const imageUrl = needScreenShot ? await takeScreenshot() : "";
		await makeAsPointed(unixTime);
		const latestChatSection = await getLatestChatSection();
		console.log(latestChatSection);
		console.log(imageUrl);
		await this.talk(latestChatSection, imageUrl);
		return { chats: latestChatSection, url: imageUrl };
	}
}
