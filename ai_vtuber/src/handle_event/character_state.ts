let aiTalkingTime: number = Date.now();
let fuguoTalkingTime: number = Date.now();
let viewerTalkingTime: number = Date.now();

interface talkStateDataType {
	talking: boolean;
	silence: boolean;
	waiting: boolean;
}

class ViewerState implements talkStateDataType {
	get talking(): boolean {
		return Date.now() - viewerTalkingTime < 1000;
	}

	setTalking() {
		viewerTalkingTime = Date.now();
	}
	get silence() {
		return Date.now() - viewerTalkingTime > 5000 && !this.talking;
	}

	get waiting() {
		return Date.now() - viewerTalkingTime > 4000;
	}
}

class FuguoState implements talkStateDataType {
	get talking() {
		return fuguoTalkingTime === 0;
	}

	setTalking(bool: boolean) {
		fuguoTalkingTime = bool ? 0 : Date.now();
	}
	get silence() {
		return Date.now() - fuguoTalkingTime > 15000 && !this.talking;
	}

	get waiting() {
		return Date.now() - fuguoTalkingTime > 4000 && !this.talking;
	}
}

class AiState implements talkStateDataType {
	get talking() {
		return aiTalkingTime === 0;
	}

	setTalking() {
		aiTalkingTime = Date.now();
	}
	get silence() {
		return Date.now() - aiTalkingTime > 15000 && !this.talking;
	}

	get waiting() {
		return Date.now() - aiTalkingTime > 5000 && !this.talking;
	}
}

class CharacterState implements talkStateDataType {
	private _fuguo: FuguoState;
	private _ai: AiState;
	private _viewer: ViewerState;

	constructor() {
		this._fuguo = new FuguoState();
		this._ai = new AiState();
		this._viewer = new ViewerState();
	}

	get fuguo(): FuguoState {
		return this._fuguo;
	}

	get ai(): AiState {
		return this._ai;
	}

	get viewer(): ViewerState {
		return this._viewer;
	}

	get silence(): boolean {
		return this._fuguo.silence && this._viewer.silence && this._ai.silence;
	}

	get waiting(): boolean {
		return this._viewer.waiting && this._ai.waiting && this.fuguo.waiting;
	}

	get talking(): boolean {
		return this._ai.talking || this._fuguo.talking || this._viewer.waiting;
	}
}

export const characterState = new CharacterState();
