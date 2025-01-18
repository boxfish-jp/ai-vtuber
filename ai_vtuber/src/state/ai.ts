import type { talkStateDataType } from "./talk.js";

export class AiState implements talkStateDataType {
	private _talking = new Date().getTime();

	get talking() {
		return this._talking === 0;
	}

	setTalking() {
		this._talking = new Date().getTime();
	}
	get silence() {
		return new Date().getTime() - this._talking > 15000 && !this.talking;
	}

	get waiting() {
		return new Date().getTime() - this._talking > 5000 && !this.talking;
	}
}

let aiState: AiState = new AiState();

export const getAiState = (): AiState => {
	if (!aiState) {
		aiState = new AiState();
	}
	return aiState;
};
