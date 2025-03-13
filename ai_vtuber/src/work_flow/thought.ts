export class Thought {
	private _beforeListen: string;
	private _beforeSpeak: string;
	private _afterSpeak: string;

	constructor(beforeListen: string) {
		this._beforeListen = beforeListen;
		this._beforeSpeak = "";
		this._afterSpeak = "";
	}

	get beforeListen() {
		return this._beforeListen;
	}

	set beforeListen(thought: string) {
		this._beforeListen = thought;
	}

	get beforeSpeak(): string {
		return this._beforeSpeak;
	}

	set beforeSpeak(thought: string) {
		this._beforeSpeak = thought;
	}

	get afterSpeak(): string {
		return this._afterSpeak;
	}

	set afterSpeak(thought: string) {
		this._afterSpeak = thought;
	}
}
