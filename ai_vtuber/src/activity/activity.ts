import { HumanMessage } from "@langchain/core/messages";
import type { chatEvent } from "../event/event.js";

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
