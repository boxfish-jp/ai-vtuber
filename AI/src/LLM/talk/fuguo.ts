export interface fuguoStateDataType {
	talking: boolean;
	silence: boolean;
}

export class FuguoState implements fuguoStateDataType {
	private _talking = new Date().getTime();

	get talking() {
		return this._talking === 0;
	}

	get silence() {
		return new Date().getTime() - this._talking > 15000 && !this.talking;
	}

	set talking(bool: boolean) {
		this._talking = bool ? 0 : new Date().getTime();
	}
}

export const fuguoState: FuguoState = new FuguoState();
