import { type AiState, getAiState } from "./ai.js";
import { type FuguoState, getFuguoState } from "./fuguo.js";
import { type ViewerState, getViewerState } from "./viewer.js";

export interface talkStateDataType {
	talking: boolean;
	silence: boolean;
	waiting: boolean;
}

export interface talkStateType extends talkStateDataType {
	checking: boolean;
}

export class TalkState implements talkStateType {
	private fuguoTalkState: FuguoState;
	private aiTalkState: AiState;
	private viewerState: ViewerState;
	private checkTime: number;

	constructor(
		fuguoState: FuguoState,
		aiState: AiState,
		viewerState: ViewerState,
	) {
		this.fuguoTalkState = fuguoState;
		this.aiTalkState = aiState;
		this.viewerState = viewerState;
		this.checkTime = 0;
	}

	get silence(): boolean {
		return (
			this.fuguoTalkState.silence &&
			this.aiTalkState.silence &&
			this.viewerState.silence
		);
	}

	get waiting(): boolean {
		/*
		console.log(`this.fuguoTalkState.waiting: ${this.fuguoTalkState.waiting}`);
		console.log(`this.aiTalkState.waiting: ${this.aiTalkState.waiting}`);
		console.log(`this.viewerState.waiting: ${this.viewerState.waiting}`);
    */
		return (
			this.fuguoTalkState.waiting &&
			this.aiTalkState.waiting &&
			this.viewerState.waiting &&
			this.checking
		);
	}

	get talking(): boolean {
		return (
			this.fuguoTalkState.talking ||
			this.aiTalkState.talking ||
			this.viewerState.waiting
		);
	}

	get checking(): boolean {
		const checkState = new Date().getTime() - this.checkTime > 3000;
		if (checkState) {
			this.checkTime = new Date().getTime();
		}
		return checkState;
	}
}
const fuguoState = getFuguoState();
const aiState = getAiState();
const viewerState = getViewerState();

let talkState: TalkState | null = null;

export function getTalkState(): TalkState {
	if (!talkState) {
		talkState = new TalkState(fuguoState, aiState, viewerState);
	}
	return talkState;
}
