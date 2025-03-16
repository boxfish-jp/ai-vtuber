import type { ChatEvent, InstructionEvent } from "./event.js";

export class Activity {
	private _chatEvents: ChatEvent[] = [];
	private _screenshotUrl = "";
	private _instruction: InstructionEvent["type"] | undefined = undefined;

	constructor(
		chatEvents: ChatEvent[],
		screenshotUrl = "",
		instruction: InstructionEvent["type"] | undefined = undefined,
	) {
		this._chatEvents = chatEvents;
		this._screenshotUrl = screenshotUrl;
		this._instruction = instruction;
	}

	get instruction() {
		return this._instruction;
	}

	get chatEvents(): ChatEvent[] {
		return this._chatEvents;
	}

	set chatEvents(chatEvents: ChatEvent[]) {
		this._chatEvents = chatEvents;
	}

	get aiIsNeedWait(): boolean {
		return this.chatEvents.length <= 3;
	}

	get screenshotUrl() {
		return this._screenshotUrl;
	}

	get chatEventsPrompt() {
		return new ChatEventsPrompt(this._chatEvents);
	}

	get inputPrompt() {
		return new InputPrompt(this._chatEvents);
	}
}

class ChatEventsPrompt {
	private _chatEvents: ChatEvent[];

	constructor(chatEvents: ChatEvent[]) {
		this._chatEvents = chatEvents;
	}

	toString(isContainViewer = true) {
		const messages: string[] = [];
		for (const chat of this._chatEvents) {
			switch (chat.who) {
				case "fuguo":
					messages.push(`ふぐお「${chat.content}」`);
					break;
				case "viewer":
					if (isContainViewer) {
						messages.push(`視聴者「${chat.content}」`);
					}
					break;
				case "info":
					messages.push(`アナウンス「${chat.content}」`);
					break;
				case "ai":
					messages.push(`ずんだもん「${chat.content}」`);
					break;
			}
		}
		return messages.length ? messages.join("\n") : "";
	}
}

class InputPrompt {
	private _chatEvent: ChatEvent[];

	constructor(chatEvent: ChatEvent[]) {
		this._chatEvent = chatEvent;
	}

	toString(isContainViewer = true) {
		throw new Error("たぶんバグあるよ。InputPrompt.this.toString");
		/*
		let inputText = "";
		for (let i = this._chatEvent.length - 1; i >= 0; i--) {
			const chat = this._chatEvent[i];
			if (chat.who === "ai") {
				break;
			}
			switch (chat.who) {
				case "fuguo":
					inputText = `ふぐお「${chat.content}」${inputText}`;
					break;
				case "viewer":
					if (isContainViewer) {
						inputText = `視聴者「${chat.content}」${inputText}`;
					}
					break;
				case "info":
					inputText = `info「${chat.content}」${inputText}`;
					break;
			}
		}
		return inputText;
      */
	}

	get onlyLast(): ChatEvent {
		return this._chatEvent[this._chatEvent.length - 1];
	}
}
