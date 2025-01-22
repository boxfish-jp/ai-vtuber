import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { chatEvent, instructionEvent } from "../event/event.js";

export class Activity {
	private _listeningSong = "";
	private _chatHistory: chatEvent[] = [];
	private _screenShotUrl = "";
	private _workTheme = "";
	private _instruction: instructionEvent["type"] | undefined = undefined;

	constructor(
		listeningSong: string,
		chatHistory: chatEvent[],
		screenShotUrl: string,
		workTheme: string,
		instruction: instructionEvent["type"] | undefined,
	) {
		this._listeningSong = listeningSong;
		this._chatHistory = chatHistory;
		this._screenShotUrl = screenShotUrl;
		this._workTheme = workTheme;
		this._instruction = instruction;
	}

	get instruction() {
		return this._instruction;
	}

	get chatHistory(): chatEvent[] {
		return this._chatHistory;
	}

	get chatHistoryString(): string {
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

	get chatHistoryPrompt(): (AIMessage | HumanMessage)[] {
		const messages: (AIMessage | HumanMessage)[] = [];
		let tempMessage: { who: string; content: string } = {
			who: "",
			content: "",
		};
		for (const [i, chat] of this._chatHistory.entries()) {
			if (tempMessage.who === chat.who && i !== this.chatHistory.length - 1) {
				switch (chat.who) {
					case "fuguo":
						tempMessage.content += `ふぐお「${chat.content}」`;
						break;
					case "viewer":
						tempMessage.content += `視聴者「${chat.content}」`;
						break;
					case "info":
						tempMessage.content += `info「${chat.content}」`;
						break;
					case "ai":
						tempMessage.content += `${chat.content}`;
						break;
				}
			} else {
				if (tempMessage.who !== "") {
					if (tempMessage.who === "ai") {
						messages.push(
							new AIMessage({
								content: [{ type: "text", text: tempMessage.content }],
							}),
						);
					} else {
						messages.push(
							new HumanMessage({
								content: [{ type: "text", text: tempMessage.content }],
							}),
						);
					}
				}
				tempMessage = { who: chat.who, content: chat.content };
			}
		}
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i] instanceof HumanMessage) {
				messages.splice(i, 1);
			}
		}
		return messages;
	}

	get inputPrompt(): HumanMessage {
		let inputText = "";
		for (let i = this._chatHistory.length - 1; i >= 0; i--) {
			const chat = this._chatHistory[i];
			if (chat.who === "ai") {
				break;
			}
			switch (chat.who) {
				case "fuguo":
					inputText = `ふぐお「${chat.content}」${inputText}`;
					break;
				case "viewer":
					inputText = `視聴者「${chat.content}」${inputText}`;
					break;
				case "info":
					inputText = `info「${chat.content}」${inputText}`;
					break;
			}
		}
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

	get lastChat(): chatEvent {
		return this._chatHistory[this._chatHistory.length - 1];
	}
}
