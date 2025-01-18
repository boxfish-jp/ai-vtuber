import type { talkStateDataType } from "./talk.js";

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

let viewerState: ViewerState | null;

export const getViewerState = (): ViewerState => {
	if (!viewerState) {
		viewerState = new ViewerState();
	}
	return viewerState;
};
