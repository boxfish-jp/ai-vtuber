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

	constructor(fuguoState: FuguoState, aiState: AiState) {
		this.fuguoTalkState = fuguoState;
		this.aiTalkState = aiState;
	}

	get silence(): boolean {
		return this.fuguoTalkState.silence && this.aiTalkState.silence;
	}

	get waiting(): boolean {
		console.log(`this.fuguoTalkState.waiting: ${this.fuguoTalkState.waiting}`);
		console.log(`this.aiTalkState.waiting: ${this.aiTalkState.waiting}`);
		return this.fuguoTalkState.waiting && this.aiTalkState.waiting;
	}

	get talking(): boolean {
		return this.fuguoTalkState.talking || this.aiTalkState.talking;
	}
}

export const talkState: TalkState = new TalkState(fuguoState, aiState);
