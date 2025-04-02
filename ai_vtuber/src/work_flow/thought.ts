export class Thought {
	public beforeListen: string;
	public beforeSpeak: string;

	constructor(beforeListen: string) {
		this.beforeListen = beforeListen;
		this.beforeSpeak = "";
	}

	set afterSpeak(thought: string) {
		this.beforeListen = thought;
	}
}
