import { insertChatDb } from "./db/chat_db.js";
import { getFuguoState } from "./state/fuguo.js";
import { getViewerState } from "./state/viewer.js";
import type { Chat } from "@prisma/client";

export interface controllerType {
	addChat(
		who: "ai" | "fuguo" | "viewer" | "announce",
		chatText: string,
		point: boolean,
	): Promise<void>;

	speakStateChange(speaking: boolean): void;

	talkToAi(unixTime: number, needScreenShot: boolean): Promise<void>;
}

export class Controller implements controllerType {
	private readonly talk: (chats: Chat[]) => Promise<void>;

	constructor(talk: (chats: Chat[]) => Promise<void>) {
		this.talk = talk;
	}
	async addChat(
		who: "ai" | "fuguo" | "viewer" | "announce",
		chatText: string,
		point: boolean,
	): Promise<void> {
		if (who === "viewer") {
			const viewerState = getViewerState();
			viewerState.setTalking();
		}
		await insertChatDb(who, chatText, point);
	}

	speakStateChange(speaking: boolean): void {
		const fuguoState = getFuguoState();
		fuguoState.talking = speaking;
	}

	talkToAi(unixTime: number, needScreenShot: boolean): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
