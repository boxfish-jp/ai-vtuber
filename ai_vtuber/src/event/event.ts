export interface chatEvent {
	who: "ai" | "fuguo" | "viewer" | "info";
	content: string;
	unixTime: number;
	point: boolean;
}

interface instructionEvent {
	type: "talk" | "work_theme" | "afk" | "back" | "grade";
	unixTime: number;
	needScreenshot: boolean;
}

export class LiveEvent {
	readonly chat: chatEvent | undefined = undefined;
	readonly instruction: instructionEvent | undefined = undefined;
	readonly fuguoSpeaking: boolean | undefined = undefined;
	constructor(
		chat: chatEvent | undefined,
		instruction: instructionEvent | undefined,
		fuguoSpeaking: boolean | undefined,
	) {
		this.chat = chat;
		this.instruction = instruction;
		this.fuguoSpeaking = fuguoSpeaking;
	}

	get isNeedApply(): boolean {
		if (this.chat || this.fuguoSpeaking || this.instruction?.unixTime) {
			return true;
		}
		return false;
	}

	get isNeedMakeActivity(): boolean {
		if (this.chat || this.fuguoSpeaking) {
			return false;
		}
		return true;
	}
}
