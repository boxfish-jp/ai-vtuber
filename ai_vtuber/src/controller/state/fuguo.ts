import type { talkStateDataType } from "./talk.js";

export class FuguoState implements talkStateDataType {
	private _talking = new Date().getTime();

	get talking() {
		return this._talking === 0;
	}

	set talking(bool: boolean) {
		this._talking = bool ? 0 : new Date().getTime();
	}
	get silence() {
		return new Date().getTime() - this._talking > 15000 && !this.talking;
	}

	get waiting() {
		return new Date().getTime() - this._talking > 7000 && !this.talking;
	}
}

let fuguoState: FuguoState | null = null;

export const getFuguoState = (): FuguoState => {
	if (!fuguoState) {
		fuguoState = new FuguoState();
	}
	return fuguoState;
};
