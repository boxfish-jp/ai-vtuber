import type { talkStateDataType } from "./talk";

export interface viewerStateType extends talkStateDataType {
	setTalking(): void;
}

export class ViewerState implements viewerStateType {
	private _talking = new Date().getTime();

	get talking() {
		return this._talking < 3000;
	}

	setTalking() {
		this._talking = new Date().getTime();
	}
	get silence() {
		return new Date().getTime() - this._talking > 20000 && !this.talking;
	}

	get waiting() {
		return new Date().getTime() - this._talking > 10000 && !this.talking;
	}
}

export const viewerState: ViewerState = new ViewerState();