export class WorkTheme {
	private _theme = "";
	private checking = false;

	get theme(): string {
		return this._theme;
	}
}

export const workTheme = new WorkTheme();
