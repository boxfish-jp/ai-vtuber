import { HumanMessage } from "@langchain/core/messages";
import { Spotify } from "../agents/spotify/spotify.js";
import { WorkTheme } from "../agents/work_theme/work_theme.js";
import type { LiveEvent, chatEvent } from "../event/event.js";
import { getAiState } from "../state/ai.js";
import { getFuguoState } from "../state/fuguo.js";
import { getViewerState } from "../state/viewer.js";
import { takeScreenshot } from "../take_screenShot/take_screenshot.js";
import {
	getLatestChatSection,
	insertChatDb,
	makeAsPointed,
} from "./db/chat_db.js";

export class Activity {
	private _listeningSong = "";
	private _chatHistory: chatEvent[] = [];
	private _screenShotUrl = "";
	private _workTheme = "";
	constructor(
		listeningSong: string,
		chatHistory: chatEvent[],
		screenShotUrl: string,
		workTheme: string,
	) {
		this._listeningSong = listeningSong;
		this._chatHistory = chatHistory;
		this._screenShotUrl = screenShotUrl;
		this._workTheme = workTheme;
	}

	get chatHistory(): chatEvent[] {
		return this._chatHistory;
	}

	get chatHistoryPrompt(): string {
		if (this._chatHistory.length <= 1) {
			return "直前の会話履歴はありません";
		}
		const onlyHistory = this._chatHistory.slice(0, -1);
		const messages: string[] = [];
		for (const chat of onlyHistory) {
			switch (chat.who) {
				case "fuguo":
					messages.push(`ふぐお「${chat.content}」`);
					break;
				case "viewer":
					messages.push(`視聴者「${chat.content}」`);
					break;
				case "info":
					messages.push(`アナウンス「${chat.content}」`);
					break;
				case "ai":
					messages.push(`αちゃん「${chat.content}」`);
					break;
			}
		}
		return messages.join("\n");
	}

	get inputPrompt(): HumanMessage {
		if (this._chatHistory.length === 0) {
			throw new Error("chats is empty");
		}
		const inputText = this._chatHistory[this._chatHistory.length - 1].content;
		const inputPrompt = this._screenShotUrl
			? new HumanMessage({
					content: [
						{ type: "text", text: inputText },
						{
							type: "image_url",
							image_url: {
								url: this._screenShotUrl,
							},
						},
					],
				})
			: new HumanMessage({
					content: [{ type: "text", text: inputText }],
				});
		return inputPrompt;
	}
}

export const makeActivity = async (
	event: LiveEvent | undefined,
): Promise<Activity> => {
	const chatHistory = await getLatestChatSection();
	const imageUrl = event?.instruction?.needScreenshot
		? await takeScreenshot()
		: "";
	const workTheme = new WorkTheme();
	const spotify = new Spotify();
	const songName = await spotify.getListteningSongName();
	return new Activity(songName, chatHistory, imageUrl, workTheme.theme);
};

export const applyEvent = async (event: LiveEvent): Promise<void> => {
	if (event.chat !== undefined) {
		if (event.chat.who === "viewer") {
			const viewerState = getViewerState();
			viewerState.setTalking();
		} else if (event.chat.who === "ai") {
			const aiState = getAiState();
			aiState.setTalking();
		}
		await insertChatDb(event.chat);
	}
	if (event.fuguoSpeaking !== undefined) {
		const fuguoState = getFuguoState();
		fuguoState.talking = event.fuguoSpeaking;
	}
	if (event.instruction?.unixTime !== undefined) {
		await makeAsPointed(event.instruction.unixTime);
	}
};
