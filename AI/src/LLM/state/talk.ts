import { aiState, type AiState } from "./ai";
import { type FuguoState, fuguoState } from "./fuguo";

export interface talkStateDataType {
	talking: boolean;
	silence: boolean;
	waiting: boolean;
}

export class TalkState implements talkStateDataType {
	private fuguoTalkState: FuguoState;
	private aiTalkState: AiState;
	private checkTime: number;

	constructor(fuguoState: FuguoState, aiState: AiState) {
		this.fuguoTalkState = fuguoState;
		this.aiTalkState = aiState;
		this.checkTime = 0;
	}

	get silence(): boolean {
		return this.fuguoTalkState.silence && this.aiTalkState.silence;
	}

	get waiting(): boolean {
		console.log(`this.fuguoTalkState.waiting: ${this.fuguoTalkState.waiting}`);
		console.log(`this.aiTalkState.waiting: ${this.aiTalkState.waiting}`);
		return (
			this.fuguoTalkState.waiting && this.aiTalkState.waiting && this.checking
		);
	}

	get talking(): boolean {
		return this.fuguoTalkState.talking || this.aiTalkState.talking;
	}

	get checking(): boolean {
		const checkState = new Date().getTime() - this.checkTime > 3000;
		if (checkState) {
			this.checkTime = new Date().getTime();
		}
		return checkState;
	}
}

export const talkState: TalkState = new TalkState(fuguoState, aiState);
