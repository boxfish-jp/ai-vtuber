let aiTalkingTime: number = new Date().getTime();
let fuguoTalkingTime: number = new Date().getTime();
let viewerTalkingTime: number = new Date().getTime();

interface talkStateDataType {
	talking: boolean;
	silence: boolean;
	waiting: boolean;
}

class CharacterState implements talkStateDataType {
	private _fuguo: FuguoState = new FuguoState();
	private _ai: AiState = new AiState();
	private _viewer: ViewerState = new ViewerState();

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
		return this._ai.waiting && this._fuguo.waiting && this._viewer.waiting;
	}

	get talking(): boolean {
		return this._ai.talking || this._fuguo.talking || this._viewer.waiting;
	}
}

export const characterState = new CharacterState();

class ViewerState implements talkStateDataType {
	get talking(): boolean {
		return viewerTalkingTime < 3000;
	}

	setTalking() {
		viewerTalkingTime = new Date().getTime();
	}
	get silence() {
		return (
			new Date().getTime() - viewerTalkingTime > 20000 && !viewerTalkingTime
		);
	}

	get waiting() {
		return (
			new Date().getTime() - viewerTalkingTime > 10000 && !viewerTalkingTime
		);
	}
}

class FuguoState implements talkStateDataType {
	get talking() {
		return fuguoTalkingTime === 0;
	}

	setTalking(bool: boolean) {
		fuguoTalkingTime = bool ? 0 : new Date().getTime();
	}
	get silence() {
		return new Date().getTime() - fuguoTalkingTime > 15000 && !this.talking;
	}

	get waiting() {
		return new Date().getTime() - fuguoTalkingTime > 7000 && !this.talking;
	}
}

class AiState implements talkStateDataType {
	get talking() {
		return aiTalkingTime === 0;
	}

	setTalking() {
		aiTalkingTime = new Date().getTime();
	}
	get silence() {
		return new Date().getTime() - aiTalkingTime > 15000 && !this.talking;
	}

	get waiting() {
		return new Date().getTime() - aiTalkingTime > 5000 && !this.talking;
	}
}
